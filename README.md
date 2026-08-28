# ✍️ ContentAI
**Say it once. Ship it eight ways.**
One topic, five tones, three takes to choose from. A content generator built for people who write daily — captions, threads, outlines, product copy — not for a demo reel.
<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14.2-000000?logo=nextdotjs&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white">
  <img alt="OpenRouter" src="https://img.shields.io/badge/OpenRouter-free%20tier%20LLM-8A63D2">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white">
</p>

> [!NOTE]
> **A personal project, not a commercial product.** Built and run by one person. Every account gets the same flat free quota — there's no paid tier, no billing, nothing to upsell. Generation runs on OpenRouter's free-tier models; not affiliated with OpenRouter or any model provider.

---

## 📑 Table of contents

- [Why it exists](#-why-it-exists)
- [Features](#-features)
- [Tech stack](#-tech-stack)
- [How the core features work](#-how-the-core-features-work)
- [Architecture](#-architecture)
- [Security model](#-security-model)
- [Getting started](#-getting-started)
- [Known limitations](#-known-limitations)

---

## 🎯 Why it exists

Most AI writing tools either lock the good models behind a subscription or hand you one generic answer and call it done. ContentAI does neither: every generation fires three variations in parallel so there's actually something to choose between, and it runs entirely on free-tier infrastructure — no OpenAI key, no credit card, no plan to upgrade out of.

It also treats a photo as a valid starting point, not just a topic string. Upload an image and a vision-capable model reads the actual scene — subject, setting, mood — before writing the caption, instead of guessing from a text description of it.

---

## ✨ Features

### 📝 Generation

| Feature | What it does |
|---|---|
| **8 content types** | Social captions, blog outlines, tweet threads, LinkedIn posts, product descriptions, email subject lines, video scripts, and image captions — each with its own system prompt tuned to that format's actual conventions (hashtag count, character limits, section structure). |
| **5 tones** | Professional, casual, funny, bold, inspirational. Blended into every prompt, not just appended as a label. |
| **3 variations per request** | Every generation fires three parallel model calls and shows all three side by side. Free-tier models don't reliably support asking one call for multiple candidates, so this is three independent requests raced with `Promise.allSettled` — a partial failure still returns whatever succeeded. |
| **Vision captions** | Upload a JPEG/PNG/WEBP/GIF and the model receives the image directly (as a multimodal message) plus your optional context, and writes a caption grounded in what's actually in the photo. |

### 🗂 Organize & track

| Feature | What it does |
|---|---|
| **History** | Every generation, paginated and filterable by content type, with all its variations grouped under one batch. Delete any batch you don't want kept. |
| **Templates** | Save a topic + content type + tone combination you reuse, and reload it into the generator in one click instead of retyping it. |
| **Analytics** | Generations over the last 30 days, breakdown by content type, and a day-streak — all computed from the generation log itself, not a separate counter that can drift from it. |
| **Usage** | A live bar showing generations used against the monthly quota, so the limit is never a surprise at generation time. |

### 🔐 Account & security

| Feature | What it does |
|---|---|
| **Email + password auth** | Sign up, log in, forgot-password email flow, and an in-app change-password form — all through Supabase Auth. |
| **Session-aware routing** | Middleware protects every dashboard route and API route; signed-out requests are redirected (pages) or rejected with 401 (API), before any handler runs. |
| **Data isolation** | Every row a user can see is scoped to their own `auth.uid()` — enforced by Postgres Row Level Security, not by application-layer filtering that a bug could bypass. |

---

## 🛠 Tech stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14.2 (App Router) | Route Handlers for the API, Server Components for the shell, one `maxDuration` override for the one route that needs it. |
| **UI** | React 18.3, Tailwind CSS 3.4 | A single dark editorial theme — near-black canvas, warm off-white ink, one accent color — driven entirely by tokens in `tailwind.config.ts`. |
| **Language** | TypeScript 5 (strict) | |
| **Auth + DB** | Supabase (Auth, Postgres, RLS) | Row Level Security is the access boundary; no service-role client is used anywhere in the app. |
| **AI provider** | OpenRouter, via the `openai` SDK pointed at a custom `baseURL` | OpenRouter's API is OpenAI-compatible, so the same SDK reaches a free-tier multimodal model without OpenAI billing. |
| **Charts** | Recharts | Analytics page's day-by-day and content-type breakdowns. |
| **Icons** | lucide-react | |
| **Hosting** | Vercel | |

---

## ⚙️ How the core features work

### 🎲 Three variations, one batch

`/api/generate` doesn't ask the model for multiple candidates in one call — free-tier OpenRouter models don't support that reliably. Instead it fires `VARIATIONS_PER_GENERATION` (3) independent completion calls in parallel via `Promise.allSettled`, keeps whichever succeeded, and saves every variation under one shared `batch_id`. History and the generator group by that id, so a batch always reads back as one generation event with its variations attached — never as three unrelated rows.

### 👁 Vision captions are a real image read, not a text guess

For the `image_caption` content type, the uploaded photo is sent as an `image_url` content part in the same OpenAI-compatible message format used for text prompts — the vision-capable model receives the actual pixels, not a paraphrased description of them. The image itself is never stored; only the derived caption is written to the database.

### 📊 Quota is derived, not tracked separately

There's no `usage` counter that could drift from reality. `MONTHLY_GENERATION_LIMIT` (10 by default) is enforced by counting the user's own `generations` rows created since the start of the current calendar month, at request time, before any model call is made — so the limit and the history it's based on can never disagree.

### ⚡ Client-side cache, warmed on login

Dashboard tabs (History, Templates, Analytics) are separate top-level routes, not panels in a shared layout, so switching between them would normally re-fetch every time. A module-level cache (`lib/clientCache.ts`) plus a `warmAppData()` prefetch fired on login/dashboard mount fills the cache once, up front — so the first visit to any tab reads from memory instead of showing a loading flash.

---

## 🏗 Architecture

```
app/
├── page.tsx              Landing page
├── login/                Sign in
├── signup/                Sign up
├── forgot-password/      Request a reset email
├── reset-password/       Set a new password
├── auth/callback/        Supabase auth redirect target
├── auth/signout/         Sign-out route handler
├── dashboard/            Generator — the main app screen
├── history/              Paginated generation log
├── templates/            Saved topic/type/tone presets
├── analytics/            Usage charts + streak
├── settings/             Change password
└── api/
    ├── generate/         Fires the 3 parallel LLM calls, enforces quota
    ├── history/          Paginated read + delete
    ├── templates/        CRUD for saved presets
    ├── analytics/        Aggregates the generation log
    └── usage/            Current-month count vs. limit

lib/
├── openrouter.ts         OpenRouter client (OpenAI SDK, custom baseURL)
├── prompts.ts            Per-content-type system prompts, tone guidance
├── supabase/             Server, browser, and middleware Supabase clients
├── constants.ts          Content types, tones, limits
├── rateLimit.ts          In-memory per-user request cooldown
└── clientCache.ts         Module-level cache + prefetch-on-login

components/                Generator, Output, History, Templates,
                            Analytics, Navbar, LogoMark, etc.
```

### Data model

| Table | Columns | Access |
|---|---|---|
| `generations` | `user_id, batch_id, variation_index, content_type, tone, topic_input, output_text, created_at` | User-owned. RLS scoped to `auth.uid()`. |
| `templates` | `user_id, name, content_type, tone, topic_input, created_at` | User-owned. RLS scoped to `auth.uid()`. |

---

## 🛡 Security model

| Control | Implementation |
|---|---|
| **Row Level Security** | Enabled on `generations` and `templates`, every policy scoped to `auth.uid()` — a user can only ever see or modify their own rows. |
| **No raw SQL** | All access goes through the Supabase client's query builder; there is no hand-written SQL string anywhere in the app, so there's no injection surface. |
| **Secrets stay server-side** | Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed to the browser. `OPENROUTER_API_KEY` is read only in the `/api/generate` Route Handler. |
| **Auth gate on every protected route** | `middleware.ts` checks the session before any dashboard page or API route runs — signed-out access is redirected or rejected, not left to each handler to check individually. |
| **Request cooldown** | A minimum gap between `/api/generate` calls from the same user, as a cheap guard against runaway client loops. |

---

## 🚀 Getting started

**Prerequisites:** Node 18+, a Supabase project, a free [OpenRouter](https://openrouter.ai/keys) API key.

```bash
git clone https://github.com/ch-harisimran/ContentAi.git
cd ContentAi
npm install
cp .env.example .env.local     # then fill it in
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## ⚠️ Known limitations

Stated plainly rather than hidden:

- **The request cooldown is in-memory.** On Vercel, each serverless instance holds its own copy, so the "generating too fast" guard is best-effort, not airtight across instances. The actual monthly quota is enforced separately, against the database, and is unaffected by this.
- **Free-tier model latency varies.** Three parallel calls exist specifically because a single free-tier call can be slow or occasionally fail — a partial batch (2 of 3, or fewer) is still returned rather than failing the whole request.
- **No paid tier, by design.** Every account shares the same flat monthly limit. There's no billing code to audit because there's no billing.
- **Uploaded images aren't stored.** Only the caption text a model derives from an image is saved — the photo itself is discarded after the request completes.
- **One theme.** The editorial dark palette is the only theme; there's no light mode toggle.

---

<p align="center">
  <sub>A personal project · Free-tier only · Not affiliated with OpenRouter or any model provider</sub>
</p>
