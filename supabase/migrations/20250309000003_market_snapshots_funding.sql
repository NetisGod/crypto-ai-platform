-- Add funding and open interest to market_snapshots (filled by Binance ingestion)
alter table public.market_snapshots
  add column if not exists funding_rate numeric,
  add column if not exists open_interest numeric;
