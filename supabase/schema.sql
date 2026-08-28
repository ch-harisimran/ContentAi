-- AI Content Generator: database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ============ users ============
-- Mirrors auth.users with app-specific fields (plan, etc).
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view their own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own row"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create a public.users row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- This function is only meant to run via the trigger above, not to be
-- callable directly as a public RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ============ generations ============
-- One row per AI variation. `batch_id` groups the N variations produced by a
-- single /api/generate call together; `variation_index` orders them (0-based).
-- Quota + analytics count distinct batches (variation_index = 0), not rows.
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  batch_id uuid not null default gen_random_uuid(),
  variation_index int not null default 0,
  content_type text not null check (content_type in (
    'social_caption', 'blog_outline', 'tweet_thread',
    'linkedin_post', 'product_description', 'email_subject_lines', 'video_script',
    'image_caption'
  )),
  tone text not null check (tone in ('professional', 'casual', 'funny', 'bold', 'inspirational')),
  topic_input text not null,
  output_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_id_created_at_idx
  on public.generations (user_id, created_at desc);
create index if not exists generations_batch_id_idx on public.generations (batch_id);
create index if not exists generations_user_id_variation0_idx
  on public.generations (user_id, created_at desc)
  where variation_index = 0;

alter table public.generations enable row level security;

create policy "Users can view their own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own generations"
  on public.generations for delete
  using (auth.uid() = user_id);

-- ============ templates ============
-- Saved topic + content_type + tone presets a user can re-run later.
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  content_type text not null check (content_type in (
    'social_caption', 'blog_outline', 'tweet_thread',
    'linkedin_post', 'product_description', 'email_subject_lines', 'video_script',
    'image_caption'
  )),
  tone text not null check (tone in ('professional', 'casual', 'funny', 'bold', 'inspirational')),
  topic_input text not null,
  created_at timestamptz not null default now()
);

create index if not exists templates_user_id_created_at_idx
  on public.templates (user_id, created_at desc);

alter table public.templates enable row level security;

create policy "Users can view their own templates"
  on public.templates for select
  using (auth.uid() = user_id);

create policy "Users can insert their own templates"
  on public.templates for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own templates"
  on public.templates for delete
  using (auth.uid() = user_id);

-- ============ subscriptions (optional, for real Stripe wiring) ============
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  stripe_customer_id text,
  status text,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
