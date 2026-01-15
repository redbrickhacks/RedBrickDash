-- Migration: 20260115000002_create_team_submissions.sql
-- Create team_submissions table to track all Tally submission entries for audit

CREATE TABLE IF NOT EXISTS team_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  tally_response_id TEXT NOT NULL UNIQUE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  -- Store key Tally fields explicitly for queries
  youtube_url TEXT,
  github_url TEXT,
  live_url TEXT,
  pdf_url TEXT,
  -- Store full Tally response for debugging/audit
  tally_data JSONB
);

-- Composite index for "latest submission per team" queries
CREATE INDEX IF NOT EXISTS idx_team_submissions_team_submitted
  ON team_submissions(team_id, submitted_at DESC);

-- Enable RLS
ALTER TABLE team_submissions ENABLE ROW LEVEL SECURITY;

-- Team members can view their own team's submissions
CREATE POLICY "Team members can view their submissions"
  ON team_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.team_id = team_submissions.team_id
      AND user_profiles.user_id = auth.uid()
    )
  );

-- Admins (role=1) and Judges (role=7) can view all submissions
CREATE POLICY "Admins and judges can view all submissions"
  ON team_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN (1, 7)
    )
  );

COMMENT ON TABLE team_submissions IS 'Tracks all Tally submission entries for audit trail. Multiple submissions per team allowed until deadline.';
