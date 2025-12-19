-- Migration: 20251219000002_add_url_validation.sql
-- Security fix: Server-side URL validation (High #6)

-- Create a function to validate URLs
CREATE OR REPLACE FUNCTION is_valid_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if URL starts with http:// or https://
  IF url IS NULL THEN
    RETURN TRUE; -- Allow NULL values
  END IF;

  RETURN url ~ '^https?://[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+(/.*)?$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add constraints to validate URLs in teams table
ALTER TABLE teams
  DROP CONSTRAINT IF EXISTS teams_devpost_url_check,
  DROP CONSTRAINT IF EXISTS teams_pitch_video_url_check;

ALTER TABLE teams
  ADD CONSTRAINT teams_devpost_url_check
    CHECK (is_valid_url(devpost_url)),
  ADD CONSTRAINT teams_pitch_video_url_check
    CHECK (is_valid_url(pitch_video_url));
