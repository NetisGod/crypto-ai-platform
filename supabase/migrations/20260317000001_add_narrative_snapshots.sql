-- narrative_snapshots: AI-generated narrative analysis snapshots.
-- Mirrors market_briefs structure: content (text/JSON), debug_json (jsonb).
create table public.narrative_snapshots (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  debug_json jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_narrative_snapshots_generated_at
  on public.narrative_snapshots(generated_at desc);
