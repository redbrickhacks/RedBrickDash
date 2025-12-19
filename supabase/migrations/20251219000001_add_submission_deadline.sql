-- Migration: 20251219000001_add_submission_deadline.sql
-- Security fixes: Deadline enforcement (High #4) and restrict team visibility (High #5)

-- Store deadline in a config table for easy updates
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT
);

-- Insert submission deadline (January 14, 2026 11:59 PM PST = UTC-8)
INSERT INTO app_config (key, value, description)
VALUES ('submission_deadline', '2026-01-15T07:59:00Z', 'Online round submission deadline in UTC')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;

-- Create restrictive SELECT policy - only team members can see their team
CREATE POLICY "Team members can view their team"
  ON teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.team_id = teams.team_id
      AND user_profiles.user_id = auth.uid()
    )
  );

-- Drop the old update policy without deadline
DROP POLICY IF EXISTS "Team members can update submission" ON teams;

-- Create new update policy WITH deadline enforcement
CREATE POLICY "Team members can update submission before deadline"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.team_id = teams.team_id
      AND user_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.team_id = teams.team_id
      AND user_profiles.user_id = auth.uid()
    )
    AND NOW() < (SELECT value::timestamptz FROM app_config WHERE key = 'submission_deadline')
  );
