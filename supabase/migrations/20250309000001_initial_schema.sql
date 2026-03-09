-- Enable pgvector extension (Supabase has it available)
create extension if not exists vector;

-- 1. assets: crypto assets/tokens
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  symbol text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_assets_symbol on public.assets(symbol);

-- 2. market_snapshots: price/volume snapshots per asset
create table public.market_snapshots (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  price numeric not null,
  volume_24h numeric,
  market_cap numeric,
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_market_snapshots_asset_id on public.market_snapshots(asset_id);
create index idx_market_snapshots_snapshot_at on public.market_snapshots(snapshot_at desc);

-- 3. news_items: with pgvector embedding
create table public.news_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text not null,
  summary text,
  url text,
  sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
  related_tokens text[] default '{}',
  embedding vector(1536),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_news_items_published_at on public.news_items(published_at desc nulls last);
create index idx_news_items_embedding_hnsw on public.news_items
  using hnsw (embedding vector_cosine_ops);

-- 4. narratives
create table public.narratives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  strength smallint not null default 0 check (strength >= 0 and strength <= 100),
  trend text not null default 'neutral' check (trend in ('up', 'down', 'neutral')),
  sentiment smallint not null default 0 check (sentiment >= 0 and sentiment <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_narratives_trend on public.narratives(trend);

-- 5. narrative_news: junction table
create table public.narrative_news (
  narrative_id uuid not null references public.narratives(id) on delete cascade,
  news_item_id uuid not null references public.news_items(id) on delete cascade,
  primary key (narrative_id, news_item_id)
);

create index idx_narrative_news_news_item_id on public.narrative_news(news_item_id);

-- 6. market_briefs
create table public.market_briefs (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_market_briefs_generated_at on public.market_briefs(generated_at desc);

-- 7. ai_runs
create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null,
  status text not null check (status in ('pending', 'running', 'completed', 'failed')),
  input_snapshot jsonb,
  output_snapshot jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_ai_runs_status on public.ai_runs(status);
create index idx_ai_runs_created_at on public.ai_runs(created_at desc);

-- 8. eval_runs
create table public.eval_runs (
  id uuid primary key default gen_random_uuid(),
  ai_run_id uuid references public.ai_runs(id) on delete set null,
  metrics jsonb not null default '{}',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_eval_runs_ai_run_id on public.eval_runs(ai_run_id);
create index idx_eval_runs_started_at on public.eval_runs(started_at desc);

-- RLS: enable row level security (optional; uncomment and adapt policies as needed)
-- alter table public.assets enable row level security;
-- alter table public.market_snapshots enable row level security;
-- alter table public.news_items enable row level security;
-- alter table public.narratives enable row level security;
-- alter table public.narrative_news enable row level security;
-- alter table public.market_briefs enable row level security;
-- alter table public.ai_runs enable row level security;
-- alter table public.eval_runs enable row level security;
