-- Migration: Transfer team ownership or delete team when organizer is deleted
-- When a team organizer's user_profile is deleted:
-- 1. If other members exist, transfer ownership to the first one
-- 2. If no other members exist, delete the team

-- ============================================
-- First, fix the FK constraints that would block team deletion
-- ============================================

-- user_profiles.team_id -> When team is deleted, set to NULL
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_team_id_fkey;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_team_id_fkey
FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL;

-- invitations.team_id -> When team is deleted, delete the invitation
ALTER TABLE invitations
DROP CONSTRAINT IF EXISTS invitations_team_id_fkey;

ALTER TABLE invitations
ADD CONSTRAINT invitations_team_id_fkey
FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE;

-- ============================================
-- Now create the ownership transfer trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.transfer_team_ownership_on_organizer_delete()
RETURNS TRIGGER AS $$
DECLARE
  team_record RECORD;
  new_organizer_id UUID;
BEGIN
  -- Find teams where the deleted user is the organizer
  FOR team_record IN
    SELECT team_id FROM public.teams WHERE organizer_id = OLD.user_id
  LOOP
    -- Find another team member to become organizer
    -- Exclude the user being deleted
    SELECT user_id INTO new_organizer_id
    FROM public.user_profiles
    WHERE team_id = team_record.team_id
      AND user_id != OLD.user_id
    LIMIT 1;

    IF new_organizer_id IS NOT NULL THEN
      -- Transfer ownership to another member
      UPDATE public.teams
      SET organizer_id = new_organizer_id
      WHERE team_id = team_record.team_id;
    ELSE
      -- No other members - first clear this user's team_id, then delete team
      UPDATE public.user_profiles SET team_id = NULL WHERE user_id = OLD.user_id;
      DELETE FROM public.teams WHERE team_id = team_record.team_id;
    END IF;
  END LOOP;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Create trigger that fires BEFORE delete on user_profiles
DROP TRIGGER IF EXISTS trigger_transfer_team_ownership ON public.user_profiles;

CREATE TRIGGER trigger_transfer_team_ownership
BEFORE DELETE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.transfer_team_ownership_on_organizer_delete();

-- ============================================
-- Update teams.organizer_id FK
-- ============================================

ALTER TABLE teams
DROP CONSTRAINT IF EXISTS teams_organizer_id_fkey;

ALTER TABLE teams
ADD CONSTRAINT teams_organizer_id_fkey
FOREIGN KEY (organizer_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
