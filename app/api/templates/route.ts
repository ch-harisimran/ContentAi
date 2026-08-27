import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_TYPES, TONES } from "@/lib/constants";
import type { ContentType, Tone } from "@/types/database";

const VALID_CONTENT_TYPES: ContentType[] = CONTENT_TYPES.map((c) => c.value);
const VALID_TONES: Tone[] = TONES.map((t) => t.value);

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load templates." }, { status: 500 });
  }

  return NextResponse.json({ templates: data });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const { name, content_type, tone, topic_input } = body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Template name is required." }, { status: 400 });
  }
  if (!content_type || !VALID_CONTENT_TYPES.includes(content_type)) {
    return NextResponse.json({ error: "Invalid content_type." }, { status: 400 });
  }
  if (!tone || !VALID_TONES.includes(tone)) {
    return NextResponse.json({ error: "Invalid tone." }, { status: 400 });
  }
  if (!topic_input || typeof topic_input !== "string" || !topic_input.trim()) {
    return NextResponse.json({ error: "Topic is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: user.id,
      name: name.trim(),
      content_type,
      tone,
      topic_input: topic_input.trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save template." }, { status: 500 });
  }

  return NextResponse.json({ template: data });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const { error } = await supabase.from("templates").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete template." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
