import OpenAI from "openai";

let client: OpenAI | null = null;

// Lazily instantiated so the app can still build/run without the key set
// (e.g. during local scaffolding before secrets are configured).
export function getOpenAIClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set. Add it to .env.local.");
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
