-- Migration: 20260120000001_add_user_profiles_otp_and_monkeytype_settings.sql
-- Adds:
-- - otp: 4-digit numeric code (stored as text to preserve leading zeros)
-- - monkeytype_duel_settings: jsonb blob for Monkeytype duel settings

CREATE OR REPLACE FUNCTION public.gen_monkeytype_otp()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT lpad((floor(random() * 10000))::int::text, 4, '0');
$$;


ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS monkeytype_duel_otp text;

-- Default: random 4-digit code (0000-9999) with leading zeros
ALTER TABLE user_profiles
ALTER COLUMN monkeytype_duel_otp
SET DEFAULT public.gen_monkeytype_otp();

-- Backfill existing rows that don't yet have an OTP
UPDATE user_profiles
SET monkeytype_duel_otp = lpad((floor(random() * 10000))::int::text, 4, '0')
WHERE monkeytype_duel_otp IS NULL;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS monkeytype_duel_settings jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN user_profiles.monkeytype_duel_otp IS '[Monkeytype Duel] Authentication OTP (regenerated on request)';
COMMENT ON COLUMN user_profiles.monkeytype_duel_settings IS '[Monkeytype Duel] Settings & customization';