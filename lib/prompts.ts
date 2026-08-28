import type { ContentType, Tone } from "@/types/database";

const TONE_GUIDANCE: Record<Tone, string> = {
  professional: "Polished, confident, and business-appropriate. No slang.",
  casual: "Relaxed and conversational, like talking to a friend.",
  funny: "Playful, witty, and a little irreverent — but still on-topic.",
  bold: "Punchy, high-energy, and assertive. Short sentences. No hedging.",
  inspirational: "Uplifting and motivational, written to energize the reader.",
};

const SYSTEM_PROMPTS: Record<ContentType, string> = {
  social_caption:
    "You are a social media copywriter. Generate a single ready-to-post caption (with 3-5 relevant hashtags at the end). Keep it under 300 characters excluding hashtags.",
  blog_outline:
    "You are a content strategist. Generate a clear, structured blog outline with a title and 5-7 section headers, each with a one-line description.",
  tweet_thread:
    "You are a social media strategist. Generate a Twitter/X thread of 5-8 tweets. Number each tweet (1/, 2/, etc.), each under 280 characters, with a strong hook as tweet 1.",
  linkedin_post:
    "You are a LinkedIn ghostwriter. Generate a professional, story-driven LinkedIn post (150-250 words) with short paragraphs, a hook first line, and a closing line that invites engagement.",
  product_description:
    "You are an e-commerce copywriter. Generate a persuasive product description (80-150 words) that leads with the core benefit, lists 3 key features, and ends with a soft call to action.",
  email_subject_lines:
    "You are an email marketer. Generate 5 distinct subject line options for an email campaign, each on its own line, each under 60 characters, varying in angle (curiosity, urgency, benefit, question, direct).",
  video_script:
    "You are a short-form video scriptwriter (TikTok/Reels/Shorts). Generate a 30-45 second script with a labeled Hook, 2-3 Beats, and a Call to Action, each on its own line.",
  image_caption:
    "You are a social media copywriter with strong visual analysis skills. Look carefully at the image: the main subject, the setting/background, colors, lighting, mood, and any notable details. Generate a single ready-to-post caption that reflects what's actually in the photo (with 3-5 relevant hashtags at the end). Keep it under 300 characters excluding hashtags. Do not describe the image literally like an alt-text — write a caption a person would post.",
};

const OUTPUT_INSTRUCTIONS =
  "Generate the content now. Output only the final content — no preamble, no markdown code fences, no explanations.";

export function buildMessages(contentType: ContentType, tone: Tone, topic: string) {
  const system = `${SYSTEM_PROMPTS[contentType]} Tone: ${TONE_GUIDANCE[tone]}`;
  const user = `Topic: ${topic}\nTone: ${tone}\n\n${OUTPUT_INSTRUCTIONS}`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

// Vision variant: same system framing as image_caption above, but the
// user message carries the image (as a base64 data URL) plus optional
// text context, using the OpenAI-compatible multimodal content format
// that OpenRouter also accepts for vision-capable models.
export function buildVisionMessages(tone: Tone, description: string, imageDataUrl: string) {
  const system = `${SYSTEM_PROMPTS.image_caption} Tone: ${TONE_GUIDANCE[tone]}`;
  const textPart = description
    ? `Additional context from the user: ${description}\n\n${OUTPUT_INSTRUCTIONS}`
    : OUTPUT_INSTRUCTIONS;

  return [
    { role: "system" as const, content: system },
    {
      role: "user" as const,
      content: [
        { type: "text" as const, text: textPart },
        { type: "image_url" as const, image_url: { url: imageDataUrl } },
      ],
    },
  ];
}

// Strips common LLM artifacts (code fences, leading/trailing quotes) from
// the raw completion before it's shown to the user / saved to the DB.
export function cleanOutput(raw: string): string {
  return raw
    .trim()
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/i, "")
    .trim();
}
