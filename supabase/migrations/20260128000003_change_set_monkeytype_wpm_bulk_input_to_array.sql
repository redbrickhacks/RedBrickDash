-- Migration: 20260128000003_change_set_monkeytype_wpm_bulk_input_to_array.sql
-- Adds/Defines:
-- - set_monkeytype_wpm_bulk(jsonb) expecting a JSON array of objects:
--   [{ "user_id": "<uuid>", "wpm": 123 }, ...]
--
-- Note: This migration supersedes the earlier json-map version and is intended
-- to be the single source of truth for this function.

CREATE OR REPLACE FUNCTION public.set_monkeytype_wpm_bulk(updates jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- NOTE: CTEs are scoped to a single statement in Postgres. Keep all uses of
  -- `input`/`updated` in one statement to avoid "relation does not exist" errors.
  WITH input AS (
    SELECT *
    FROM jsonb_to_recordset(updates) AS x(user_id uuid, wpm integer)
  ),
  updated AS (
    UPDATE public.user_profiles up
    SET monkeytype_wpm = input.wpm
    FROM input
    WHERE up.user_id = input.user_id
    RETURNING up.user_id
  ),
  missing AS (
    SELECT input.user_id
    FROM input
    LEFT JOIN updated ON updated.user_id = input.user_id
    WHERE updated.user_id IS NULL
  )
  SELECT jsonb_build_object(
    'updated',
    (SELECT count(*) FROM updated),
    'missing',
    COALESCE((SELECT array_agg(user_id) FROM missing), ARRAY[]::uuid[])
  )
  INTO result;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.set_monkeytype_wpm_bulk(jsonb) IS '[Monkeytype Duel] Bulk set monkeytype_wpm on user_profiles (JSON array input)';
