"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { CONTENT_TYPES, TONES, MAX_IMAGE_UPLOAD_MB } from "@/lib/constants";
import { fileToCompressedDataUrl } from "@/lib/image";
import { useCachedData } from "@/lib/useCachedData";
import { TEMPLATES_KEY, USAGE_KEY, ANALYTICS_KEY, HISTORY_ALL_KEY } from "@/lib/warmAppData";
import { updateCached, invalidateCached } from "@/lib/clientCache";
import type { ContentType, Tone, TemplateRow } from "@/types/database";
import VariationsPanel from "./VariationsPanel";

interface TemplatesResponse {
  templates: TemplateRow[];
}

export default function GeneratorForm() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>("blog_outline");
  const [tone, setTone] = useState<Tone>("professional");
  const [variations, setVariations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templatesData = useCachedData<TemplatesResponse>(TEMPLATES_KEY, "/api/templates");
  const templates = templatesData?.templates ?? [];
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const isImageCaption = contentType === "image_caption";
  const fieldClass =
    "w-full rounded-sm border border-hairline bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none";
  const labelClass = "mb-1.5 block font-mono text-[11px] tracking-wide text-ink-faint";

  function applyTemplate(id: string) {
    const t = templates.find((tpl) => tpl.id === id);
    if (!t) return;
    setTopic(t.topic_input);
    setContentType(t.content_type);
    setTone(t.tone);
  }

  async function handleImageSelect(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_UPLOAD_MB * 1024 * 1024) {
      setError(`Image is too large — please use one under ${MAX_IMAGE_UPLOAD_MB}MB.`);
      return;
    }
    setImageProcessing(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setImageDataUrl(dataUrl);
    } catch {
      setError("Couldn't read that image — please try a different file.");
    } finally {
      setImageProcessing(false);
    }
  }

  function clearImage() {
    setImageDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isImageCaption && !imageDataUrl) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setVariations([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          content_type: contentType,
          tone,
          ...(isImageCaption ? { image: imageDataUrl } : {}),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setVariations(data.variations ?? []);

      // A generation changes usage count, analytics, and history — drop
      // those cached snapshots so the next visit to Settings/Analytics/
      // History fetches fresh instead of showing pre-generation numbers.
      invalidateCached(USAGE_KEY);
      invalidateCached(ANALYTICS_KEY);
      invalidateCached(HISTORY_ALL_KEY);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTemplate() {
    if (!topic.trim()) return;
    setSavingTemplate(true);
    const name = topic.trim().slice(0, 60);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content_type: contentType, tone, topic_input: topic.trim() }),
    });
    setSavingTemplate(false);
    if (res.ok) {
      const data = await res.json();
      updateCached<TemplatesResponse>(TEMPLATES_KEY, (prev) => ({
        templates: [data.template, ...(prev?.templates ?? [])],
      }));
      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 1500);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="editorial-card flex flex-col gap-5 p-6">
        {templates.length > 0 && !isImageCaption && (
          <div>
            <label className={labelClass}>START FROM A TEMPLATE</label>
            <select
              onChange={(e) => e.target.value && applyTemplate(e.target.value)}
              defaultValue=""
              className={fieldClass}
            >
              <option value="">— Select a saved template —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass}>CONTENT TYPE</label>
          <select
            value={contentType}
            onChange={(e) => {
              setContentType(e.target.value as ContentType);
              setVariations([]);
              setError(null);
            }}
            className={fieldClass}
          >
            {CONTENT_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-faint">
            {CONTENT_TYPES.find((c) => c.value === contentType)?.description}
          </p>
        </div>

        {isImageCaption ? (
          <div>
            <label className={labelClass}>PHOTO</label>
            {imageDataUrl ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageDataUrl}
                  alt="Selected upload"
                  className="max-h-56 w-auto border border-hairline object-contain"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-hairline bg-canvas text-ink-dim hover:border-accent hover:text-accent"
                  aria-label="Remove image"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageProcessing}
                className="flex w-full flex-col items-center gap-2 border border-dashed border-hairline py-8 text-ink-faint transition hover:border-accent hover:text-ink-dim"
              >
                <ImagePlus size={22} />
                <span className="text-sm">{imageProcessing ? "Processing…" : "Click to upload a photo"}</span>
                <span className="font-mono text-[11px] text-ink-faint">
                  JPEG, PNG, WEBP, OR GIF — UP TO {MAX_IMAGE_UPLOAD_MB}MB
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
            />
          </div>
        ) : null}

        <div>
          <label className={labelClass}>{isImageCaption ? "ADDITIONAL CONTEXT (OPTIONAL)" : "TOPIC"}</label>
          <textarea
            required={!isImageCaption}
            rows={isImageCaption ? 2 : 3}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              isImageCaption
                ? "e.g. This is from our product launch event last night"
                : "e.g. Launching our new productivity app for remote teams"
            }
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>TONE</label>
          <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className={`max-w-xs ${fieldClass}`}>
            {TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || imageProcessing}
            className="bg-accent px-6 py-2.5 font-mono text-xs tracking-wide text-canvas transition hover:bg-accent/90 disabled:opacity-60"
          >
            {loading ? "GENERATING…" : "GENERATE 3 VARIATIONS"}
          </button>
          {!isImageCaption && (
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={savingTemplate || !topic.trim()}
              className="border border-hairline px-4 py-2.5 font-mono text-xs tracking-wide text-ink-dim transition hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {templateSaved ? "SAVED!" : "SAVE AS TEMPLATE"}
            </button>
          )}
        </div>
      </form>

      {loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="editorial-card h-40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && variations.length > 0 && <VariationsPanel variations={variations} />}
    </div>
  );
}
