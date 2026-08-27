import type { ContentType, Tone } from "@/types/database";

export const CONTENT_TYPES: { value: ContentType; label: string; description: string }[] = [
  {
    value: "image_caption",
    label: "Image Caption (AI Vision)",
    description: "Upload a photo — AI reads the scene, subject, and mood, and writes the caption",
  },
  { value: "social_caption", label: "Social Caption", description: "Instagram/Facebook-ready caption with hashtags" },
  { value: "blog_outline", label: "Blog Outline", description: "Title + structured section headers" },
  { value: "tweet_thread", label: "Tweet Thread", description: "Numbered X/Twitter thread with a hook" },
  { value: "linkedin_post", label: "LinkedIn Post", description: "Professional, story-driven post" },
  { value: "product_description", label: "Product Description", description: "Persuasive e-commerce copy" },
  { value: "email_subject_lines", label: "Email Subject Lines", description: "5 subject line options for a campaign" },
  { value: "video_script", label: "Video Script", description: "Short-form video script with hook + beats" },
];

export const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "funny", label: "Funny" },
  { value: "bold", label: "Bold" },
  { value: "inspirational", label: "Inspirational" },
];

// Single flat quota — every account gets this many generations per calendar
// month, no paid tier. Resets automatically at the start of each month
// (see the created_at >= startOfMonth check in /api/generate and /api/usage).
export const MONTHLY_GENERATION_LIMIT = Number(process.env.MONTHLY_GENERATION_LIMIT ?? 10);

// Every /api/generate call produces this many AI variations in one request
// (via OpenAI's `n` parameter) so the user can pick the best one.
export const VARIATIONS_PER_GENERATION = 3;

// Client-side cap on uploaded image size (before base64 encoding) for the
// image_caption flow. Images are resized/compressed client-side, but this
// keeps the raw file — and the base64 payload sent to /api/generate — well
// under typical serverless request-body limits (~4.5MB on Vercel).
export const MAX_IMAGE_UPLOAD_MB = 8;

// Minimum milliseconds between two /api/generate calls from the same user,
// as a cheap guard against runaway client loops / abuse.
export const MIN_MS_BETWEEN_GENERATIONS = 3000;
