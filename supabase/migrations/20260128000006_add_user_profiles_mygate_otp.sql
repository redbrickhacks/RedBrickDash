-- Migration: 20260128000006_add_user_profiles_mygate_otp.sql
-- Adds:
-- - mygate_otp: nullable integer OTP for MyGate check-in (kept NULL for now)

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS mygate_otp integer;

COMMENT ON COLUMN public.user_profiles.mygate_otp IS '[MyGate] OTP (nullable; unset by default)';

