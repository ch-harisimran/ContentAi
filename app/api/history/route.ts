import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GenerationBatch, GenerationRow } from "@/types/database";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const contentType = searchParams.get("content_type");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Step 1: page through batches using the variation_index = 0 row as the
  // batch's representative row (one per generate call).
  let batchQuery = supabase
    .from("generations")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .eq("variation_index", 0)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (contentType && contentType !== "all") {
    batchQuery = batchQuery.eq("content_type", contentType);
  }

  const { data: batchRows, error: batchError, count } = await batchQuery;

  if (batchError) {
    return NextResponse.json({ error: "Failed to load history." }, { status: 500 });
  }

  const batchIds = (batchRows ?? []).map((r) => r.batch_id);

  // Step 2: fetch every variation for those batches.
  let variations: GenerationRow[] = [];
  if (batchIds.length > 0) {
    const { data: variationRows, error: variationError } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .in("batch_id", batchIds)
      .order("variation_index", { ascending: true });

    if (variationError) {
      return NextResponse.json({ error: "Failed to load history." }, { status: 500 });
    }
    variations = variationRows ?? [];
  }

  const batches: GenerationBatch[] = (batchRows ?? []).map((b) => ({
    batch_id: b.batch_id,
    content_type: b.content_type,
    tone: b.tone,
    topic_input: b.topic_input,
    created_at: b.created_at,
    variations: variations.filter((v) => v.batch_id === b.batch_id),
  }));

  return NextResponse.json({
    batches,
    page,
    pageSize: PAGE_SIZE,
    total: count ?? 0,
  });
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
  const batchId = searchParams.get("batch_id");

  if (!batchId) {
    return NextResponse.json({ error: "Missing batch_id." }, { status: 400 });
  }

  const { error } = await supabase
    .from("generations")
    .delete()
    .eq("batch_id", batchId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
