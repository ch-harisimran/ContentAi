import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenRouterClient, GENERATION_MODEL } from "@/lib/openrouter";
import { buildMessages, buildVisionMessages, cleanOutput } from "@/lib/prompts";
import {
  MONTHLY_GENERATION_LIMIT,
  MIN_MS_BETWEEN_GENERATIONS,
  VARIATIONS_PER_GENERATION,
  MAX_IMAGE_UPLOAD_MB,
  CONTENT_TYPES,
  TONES,
} from "@/lib/constants";
import { isRateLimited } from "@/lib/rateLimit";
import type { ContentType, Tone } from "@/types/database";
import type { ChatCompletion, ChatCompletionMessageParam } from "openai/resources/chat/completions";

const VALID_CONTENT_TYPES: ContentType[] = CONTENT_TYPES.map((c) => c.value);
const VALID_TONES: Tone[] = TONES.map((t) => t.value);

// This route fires 3 LLM calls in parallel (see below) and free-tier model
// latency can be slow — Vercel's default function timeout (10s) can be too
// tight for that. Extend it; 60s is the max allowed on the Hobby plan.
export const maxDuration = 60;

// Data URL length cap, sized so the underlying image stays roughly under
// MAX_IMAGE_UPLOAD_MB once base64's ~4/3 size inflation is accounted for.
const MAX_IMAGE_DATA_URL_CHARS = Math.ceil(MAX_IMAGE_UPLOAD_MB * 1024 * 1024 * (4 / 3));
const IMAGE_DATA_URL_PATTERN = /^data:image\/(png|jpe?g|webp|gif);base64,/;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(user.id, MIN_MS_BETWEEN_GENERATIONS)) {
    return NextResponse.json(
      { error: "You're generating too fast — please wait a few seconds and try again." },
      { status: 429 }
    );
  }

  let body: { topic?: string; content_type?: string; tone?: string; image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { topic, content_type, tone, image } = body;
  const isImageCaption = content_type === "image_caption";

  if (!content_type || !VALID_CONTENT_TYPES.includes(content_type as ContentType)) {
    return NextResponse.json({ error: "Invalid content_type." }, { status: 400 });
  }
  if (!tone || !VALID_TONES.includes(tone as Tone)) {
    return NextResponse.json({ error: "Invalid tone." }, { status: 400 });
  }

  // Image-caption requests carry an image instead of a required topic;
  // every other content type requires a text topic.
  if (isImageCaption) {
    if (!image || typeof image !== "string" || !IMAGE_DATA_URL_PATTERN.test(image)) {
      return NextResponse.json(
        { error: "A JPEG, PNG, WEBP, or GIF image is required for image captions." },
        { status: 400 }
      );
    }
    if (image.length > MAX_IMAGE_DATA_URL_CHARS) {
      return NextResponse.json(
        { error: `Image is too large — please use one under ${MAX_IMAGE_UPLOAD_MB}MB.` },
        { status: 400 }
      );
    }
    if (topic && topic.length > 500) {
      return NextResponse.json({ error: "Additional context must be under 500 characters." }, { status: 400 });
    }
  } else {
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }
    if (topic.length > 500) {
      return NextResponse.json({ error: "Topic must be under 500 characters." }, { status: 400 });
    }
  }

  // --- Quota check: count this user's generation batches so far this month ---
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("variation_index", 0)
    .gte("created_at", startOfMonth.toISOString());

  if (countError) {
    return NextResponse.json({ error: "Failed to check usage quota." }, { status: 500 });
  }

  if ((count ?? 0) >= MONTHLY_GENERATION_LIMIT) {
    return NextResponse.json(
      {
        error: `You've used all ${MONTHLY_GENERATION_LIMIT} generations for this month. Your quota resets on the 1st.`,
      },
      { status: 403 }
    );
  }

  // --- Generate N variations ---
  // Free models routed through OpenRouter don't reliably support an
  // OpenAI-style `n` parameter, so one full generation =
  // VARIATIONS_PER_GENERATION parallel calls instead of one call asking
  // for several candidates.
  let variations: string[];
  try {
    const openrouter = getOpenRouterClient();
    // Annotated explicitly: buildMessages/buildVisionMessages return
    // differently-shaped literal arrays (plain string content vs.
    // image-part content), and a bare ternary infers `messages` as a
    // union of two array types rather than an array of the union element
    // — which the SDK's overload resolution doesn't accept, silently
    // falling back to its streaming-capable overload instead.
    const messages: ChatCompletionMessageParam[] = isImageCaption
      ? buildVisionMessages(tone as Tone, (topic ?? "").trim(), image as string)
      : buildMessages(content_type as ContentType, tone as Tone, (topic as string).trim());

    // `stream: false` is pinned explicitly so the SDK resolves to its
    // non-streaming overload (returning `ChatCompletion`) rather than the
    // generic `ChatCompletion | Stream<ChatCompletionChunk>` union it falls
    // back to when `stream` is left out of a params object built from a
    // variable — that union is what the type predicate below narrows.
    const results = await Promise.allSettled(
      Array.from({ length: VARIATIONS_PER_GENERATION }, () =>
        openrouter.chat.completions.create({
          model: GENERATION_MODEL,
          messages,
          temperature: 0.9,
          max_tokens: 700,
          stream: false,
        })
      )
    );

    variations = results
      .filter((r): r is PromiseFulfilledResult<ChatCompletion> => r.status === "fulfilled")
      .map((r) => cleanOutput(r.value.choices[0]?.message?.content ?? ""))
      .filter(Boolean);

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(`${failures.length}/${VARIATIONS_PER_GENERATION} OpenRouter calls failed:`, failures[0].reason);
    }
  } catch (err) {
    console.error("OpenRouter generation failed:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 502 });
  }

  if (variations.length === 0) {
    return NextResponse.json({ error: "Generation returned empty output." }, { status: 502 });
  }

  // --- Save all variations under one batch_id ---
  // The image itself isn't persisted (no storage bucket) — topic_input
  // records the user's optional text context, or a placeholder.
  const batchId = randomUUID();
  const topicInput = isImageCaption
    ? (topic ?? "").trim() || "(Image-based caption — no additional context provided)"
    : (topic as string).trim();

  const rows = variations.map((output_text, variation_index) => ({
    user_id: user.id,
    batch_id: batchId,
    variation_index,
    content_type: content_type as ContentType,
    tone: tone as Tone,
    topic_input: topicInput,
    output_text,
  }));

  const { data: saved, error: insertError } = await supabase
    .from("generations")
    .insert(rows)
    .select();

  if (insertError) {
    console.error("Failed to save generations:", insertError);
    // Still return the output — the user got their content even if history save failed.
  }

  return NextResponse.json({
    batch_id: batchId,
    variations,
    generations: saved ?? null,
  });
}
