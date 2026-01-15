-- Migration: 20260115000003_sync_team_submission_status.sql
-- Create trigger to sync teams.submission_status to user_profiles.submission_status

CREATE OR REPLACE FUNCTION sync_team_submission_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: sync if status is non-default (defense-in-depth)
  IF TG_OP = 'INSERT' THEN
    IF NEW.submission_status IS NOT NULL AND NEW.submission_status != 1 THEN
      UPDATE user_profiles
      SET submission_status = NEW.submission_status
      WHERE team_id = NEW.team_id;
    END IF;
  -- Handle UPDATE: sync only if status actually changed
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.submission_status IS DISTINCT FROM NEW.submission_status THEN
      UPDATE user_profiles
      SET submission_status = NEW.submission_status
      WHERE team_id = NEW.team_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire on both INSERT and UPDATE of submission_status
CREATE TRIGGER trigger_sync_team_submission_status
AFTER INSERT OR UPDATE OF submission_status ON teams
FOR EACH ROW
EXECUTE FUNCTION sync_team_submission_status();

COMMENT ON FUNCTION sync_team_submission_status IS 'Syncs submission_status from teams table to all team members in user_profiles. Rolls back on failure for strict consistency.';
