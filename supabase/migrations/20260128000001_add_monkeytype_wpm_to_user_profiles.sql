-- Migration: 20260128000001_add_monkeytype_wpm_to_user_profiles.sql
-- Adds:
-- - monkeytype_wpm: integer WPM for Monkeytype

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS monkeytype_wpm integer;

COMMENT ON COLUMN user_profiles.monkeytype_wpm IS '[Monkeytype] User WPM';
