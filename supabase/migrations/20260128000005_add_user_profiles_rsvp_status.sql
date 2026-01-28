-- Migration: 20260128000005_add_user_profiles_rsvp_status.sql
-- Adds:
-- - rsvp_status lookup table (similar to application_status/submission_status)
-- - user_profiles.rsvp_status referencing rsvp_status(id)
--
-- States:
-- - PENDING
-- - DECLINED
-- - RSVP'D

CREATE TABLE IF NOT EXISTS public.rsvp_status (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL UNIQUE
);

-- Seed data (stable IDs)
INSERT INTO public.rsvp_status (id, status) VALUES
  (1, 'PENDING'),
  (2, 'DECLINED'),
  (3, 'RSVP''D')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (read-only to authenticated, like other status tables)
ALTER TABLE public.rsvp_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RSVP status is viewable by authenticated users"
  ON public.rsvp_status FOR SELECT
  TO authenticated
  USING (true);

-- Add column to user_profiles (default: PENDING)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS rsvp_status integer NOT NULL DEFAULT 1
REFERENCES public.rsvp_status(id);

-- Grant column permissions (follow existing pattern for other status columns)
GRANT UPDATE (rsvp_status) ON TABLE public.user_profiles TO authenticated;
GRANT UPDATE (rsvp_status) ON TABLE public.user_profiles TO anon;

CREATE INDEX IF NOT EXISTS idx_user_profiles_rsvp_status
  ON public.user_profiles (rsvp_status);

COMMENT ON TABLE public.rsvp_status IS '[Monkeytype Duel] RSVP status lookup';
COMMENT ON COLUMN public.user_profiles.rsvp_status IS '[Monkeytype Duel] RSVP status (FK to rsvp_status)';

