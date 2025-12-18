-- Migration: 20251218000004_add_team_submission_fields.sql
-- Phase 1.4: Add submission fields to teams table for online round

-- Add track reference
ALTER TABLE teams ADD COLUMN IF NOT EXISTS track_id INTEGER REFERENCES tracks(id);

-- Add hardware track flag
ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_hardware BOOLEAN DEFAULT FALSE;

-- Add submission URLs
ALTER TABLE teams ADD COLUMN IF NOT EXISTS devpost_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pitch_video_url TEXT;

-- Add submission timestamp
ALTER TABLE teams ADD COLUMN IF NOT EXISTS final_submitted_at TIMESTAMPTZ;

-- Add submission status (defaults to NOT_SUBMITTED = 1)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS submission_status INTEGER DEFAULT 1 REFERENCES submission_status(id);

-- Create index for querying by submission status
CREATE INDEX IF NOT EXISTS idx_teams_submission_status ON teams(submission_status);
