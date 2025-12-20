-- Restructure discord_profiles table for Discord verification tracking
-- The existing table was never properly implemented (no FK, unstructured text field)

-- Drop the old poorly-designed table
DROP TABLE IF EXISTS public.discord_profiles;

-- Create new discord_profiles table with proper structure
CREATE TABLE public.discord_profiles (
  user_profile_id uuid PRIMARY KEY REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  discord_user_id text NOT NULL,
  discord_username text,
  verified_at timestamptz NOT NULL DEFAULT NOW(),

  -- One Discord account can only link to one Hibiscus account
  CONSTRAINT discord_profiles_discord_user_id_key UNIQUE (discord_user_id),

  -- Discord snowflake IDs are 17-19 digit numbers
  CONSTRAINT discord_user_id_format CHECK (discord_user_id ~ '^\d{17,19}$')
);

-- Enable Row Level Security
ALTER TABLE public.discord_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own Discord profile
CREATE POLICY "Users can view own discord profile"
  ON public.discord_profiles
  FOR SELECT
  USING (auth.uid() = user_profile_id);

-- Volunteers can view all discord profiles (admin purposes)
CREATE POLICY "Volunteers can view all discord profiles"
  ON public.discord_profiles
  FOR SELECT
  USING (auth.uid() IN (SELECT get_volunteers()));

-- No INSERT/UPDATE/DELETE policies for regular users
-- Only service_role (bot) can modify this table

-- Index for checking if Discord account is already linked
CREATE INDEX idx_discord_profiles_discord_user_id ON public.discord_profiles(discord_user_id);
