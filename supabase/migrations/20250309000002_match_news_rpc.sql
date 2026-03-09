-- Optional: RPC for semantic search on news_items using the HNSW index.
-- Call from app via getDb().rpc('match_news_items', { query_embedding: [...], match_limit: 10 })
create or replace function public.match_news_items(
  query_embedding vector(1536),
  match_limit int default 10
)
returns setof public.news_items
language sql
stable
as $$
  select *
  from public.news_items
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_limit;
$$;
