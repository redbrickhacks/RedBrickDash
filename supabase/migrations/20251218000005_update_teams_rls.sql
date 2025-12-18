-- Migration: 20251218000005_update_teams_rls.sql
-- Phase 1.5: Update RLS policies for teams to allow submission updates

-- Allow team members to update submission fields
CREATE POLICY "Team members can update submission"
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
  );

-- Allow authenticated users to read all teams (for invite system)
CREATE POLICY "Teams are viewable by authenticated users"
  ON teams FOR SELECT
  TO authenticated
  USING (true);
