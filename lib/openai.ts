// UNUSED — this specific file (a client that called OpenAI directly) isn't
// imported anywhere anymore. The app now calls OpenRouter instead (see
// lib/openrouter.ts) using the free tier, no billing required — but it
// still uses the `openai` npm package to do so, since OpenRouter's API is
// OpenAI-compatible. So: this file is safe to delete, but the `openai`
// package in package.json is NOT unused — leave that dependency alone.
