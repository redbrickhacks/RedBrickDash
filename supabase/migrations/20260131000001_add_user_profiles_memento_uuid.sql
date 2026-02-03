-- Migration: 20260131000001_add_user_profiles_memento_uuid.sql
-- Adds:
-- - memento_uuid: stable public identifier for QR-code memento pages

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS memento_uuid uuid;

-- Backfill existing rows
UPDATE public.user_profiles
SET memento_uuid = gen_random_uuid()
WHERE memento_uuid IS NULL;

-- Enforce invariants going forward
ALTER TABLE public.user_profiles
ALTER COLUMN memento_uuid SET DEFAULT gen_random_uuid();

ALTER TABLE public.user_profiles
ALTER COLUMN memento_uuid SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_memento_uuid_unique
ON public.user_profiles (memento_uuid);

COMMENT ON COLUMN public.user_profiles.memento_uuid IS '[Memento] Public UUID used as a QR-code lookup key';

