-- Migration: 20251220000003_add_user_submission_fields.sql
-- Add submission tracking fields to user_profiles for solo submission support

-- Add submission_status to user_profiles (references existing submission_status table)
-- 1 = NOT_SUBMITTED, 2 = SUBMITTED
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS submission_status integer DEFAULT 1
REFERENCES submission_status(id);

-- Add timestamp for when submission was made
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

-- Add Tally response ID for tracking
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS submission_id text;

-- Grant column permissions (following existing pattern from revoke_write_access migration)
GRANT UPDATE (submission_status, submitted_at, submission_id) ON TABLE user_profiles TO authenticated;
GRANT UPDATE (submission_status, submitted_at, submission_id) ON TABLE user_profiles TO anon;

-- Index for querying submitted users
CREATE INDEX IF NOT EXISTS idx_user_profiles_submission_status ON user_profiles(submission_status);
