-- Add debug_json column to market_briefs for multi-agent pipeline debug data.
-- Stores per-agent outputs, validation results, and pipeline metadata (JSONB).
ALTER TABLE public.market_briefs
  ADD COLUMN IF NOT EXISTS debug_json jsonb;
