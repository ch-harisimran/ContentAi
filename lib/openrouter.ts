import OpenAI from "openai";

let client: OpenAI | null = null;

// The model used for every generation, incl. vision (image_caption).
// A free, multimodal model on OpenRouter — no billing, no per-project
// account review, just an API key. OpenRouter's chat completions endpoint
// is OpenAI-compatible, so this reuses the `openai` SDK pointed at a
// different base URL instead of a separate provider SDK.
export const GENERATION_MODEL = "minimax/minimax-m3:free";

// Lazily instantiated so the app can still build/run without the key set
// (e.g. during local scaffolding before secrets are configured).
export function getOpenRouterClient() {
  if (!client) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Add it to .env.local — get a free key at https://openrouter.ai/keys"
      );
    }
    client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        // Optional, but OpenRouter asks for these so usage is attributed
        // to a real app rather than showing up as anonymous traffic.
        "HTTP-Referer": "https://contentai.app",
        "X-Title": "ContentAI",
      },
    });
  }
  return client;
}
