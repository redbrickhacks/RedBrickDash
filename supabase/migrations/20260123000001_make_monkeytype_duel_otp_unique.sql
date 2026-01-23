-- Migration: 20260123000001_make_monkeytype_duel_otp_unique.sql
-- Purpose:
-- - Ensure monkeytype_duel_otp is unique (used for authentication)
-- - De-dupe any existing collisions
-- - Prevent future collisions on INSERT/UPDATE by regenerating OTP

-- 1) Generate a unique 4-digit OTP (serialized via advisory lock to avoid races)
CREATE OR REPLACE FUNCTION public.gen_unique_monkeytype_otp()
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  candidate text;
BEGIN
  -- Serialize OTP generation to avoid concurrent collisions.
  PERFORM pg_advisory_xact_lock(hashtext('user_profiles.monkeytype_duel_otp'));

  LOOP
    candidate := public.gen_monkeytype_otp();
    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.monkeytype_duel_otp = candidate
    );
  END LOOP;

  RETURN candidate;
END;
$$;

-- 2) Trigger: if INSERT/UPDATE would result in a collision (or NULL/empty), regenerate
CREATE OR REPLACE FUNCTION public.ensure_unique_monkeytype_duel_otp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.monkeytype_duel_otp IS NULL OR NEW.monkeytype_duel_otp = '' THEN
    NEW.monkeytype_duel_otp := public.gen_unique_monkeytype_otp();
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.monkeytype_duel_otp = NEW.monkeytype_duel_otp
      AND up.user_id <> NEW.user_id
  ) THEN
    NEW.monkeytype_duel_otp := public.gen_unique_monkeytype_otp();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_unique_monkeytype_duel_otp ON public.user_profiles;
CREATE TRIGGER trg_ensure_unique_monkeytype_duel_otp
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_unique_monkeytype_duel_otp();

-- 3) Clean up existing data:
-- - Backfill NULL/empty OTPs
-- - Resolve collisions by regenerating for all but one row per duplicated OTP
DO $$
DECLARE
  r record;
BEGIN
  -- Backfill NULL/empty
  UPDATE public.user_profiles
  SET monkeytype_duel_otp = public.gen_unique_monkeytype_otp()
  WHERE monkeytype_duel_otp IS NULL OR monkeytype_duel_otp = '';

  -- De-dupe collisions (keep first by user_id)
  FOR r IN
    SELECT user_id
    FROM (
      SELECT
        user_id,
        monkeytype_duel_otp,
        row_number() OVER (
          PARTITION BY monkeytype_duel_otp
          ORDER BY user_id
        ) AS rn
      FROM public.user_profiles
      WHERE monkeytype_duel_otp IS NOT NULL AND monkeytype_duel_otp <> ''
    ) t
    WHERE t.rn > 1
  LOOP
    UPDATE public.user_profiles
    SET monkeytype_duel_otp = public.gen_unique_monkeytype_otp()
    WHERE user_id = r.user_id;
  END LOOP;
END $$;

-- 4) Enforce uniqueness at the database level
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_monkeytype_duel_otp_unique_idx
  ON public.user_profiles (monkeytype_duel_otp);

-- 5) Make it non-nullable and set a safe default going forward
ALTER TABLE public.user_profiles
  ALTER COLUMN monkeytype_duel_otp SET DEFAULT public.gen_unique_monkeytype_otp();

ALTER TABLE public.user_profiles
  ALTER COLUMN monkeytype_duel_otp SET NOT NULL;

