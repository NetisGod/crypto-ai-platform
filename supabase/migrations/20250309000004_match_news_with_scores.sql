-- RPC that returns news rows with cosine distance for computing similarity (1 - distance).
-- Used by retrieve-news API to return similarity scores.
create or replace function public.match_news_items_with_scores(
  query_embedding vector(1536),
  match_limit int default 10
)
returns table (
  id uuid,
  title text,
  source text,
  url text,
  summary text,
  published_at timestamptz,
  distance float
)
language sql
stable
as $$
  select
    n.id,
    n.title,
    n.source,
    n.url,
    n.summary,
    n.published_at,
    (n.embedding <=> query_embedding) as distance
  from public.news_items n
  where n.embedding is not null
  order by n.embedding <=> query_embedding
  limit match_limit;
$$;
