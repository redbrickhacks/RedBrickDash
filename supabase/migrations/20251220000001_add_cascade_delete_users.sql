-- Migration: 20251220000001_add_cascade_delete_users.sql
-- Add CASCADE DELETE to all user-related foreign keys
-- This ensures deleting a user from auth.users cleans up all related data

-- ============================================
-- 1. user_profiles -> auth.users
-- ============================================
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 2. Tables referencing user_profiles
-- ============================================

-- discord_invites
ALTER TABLE discord_invites
DROP CONSTRAINT IF EXISTS discord_invites_user_profile_id_fkey;

ALTER TABLE discord_invites
ADD CONSTRAINT discord_invites_user_profile_id_fkey
FOREIGN KEY (user_profile_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- invitations (invited_id)
ALTER TABLE invitations
DROP CONSTRAINT IF EXISTS invitations_invited_id_fkey;

ALTER TABLE invitations
ADD CONSTRAINT invitations_invited_id_fkey
FOREIGN KEY (invited_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- invitations (organizer_id)
ALTER TABLE invitations
DROP CONSTRAINT IF EXISTS invitations_organizer_id_fkey;

ALTER TABLE invitations
ADD CONSTRAINT invitations_organizer_id_fkey
FOREIGN KEY (organizer_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- leaderboard
ALTER TABLE leaderboard
DROP CONSTRAINT IF EXISTS leaderboard_user_id_fkey;

ALTER TABLE leaderboard
ADD CONSTRAINT leaderboard_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- pinned_events
ALTER TABLE pinned_events
DROP CONSTRAINT IF EXISTS pinned_events_user_id_fkey;

ALTER TABLE pinned_events
ADD CONSTRAINT pinned_events_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- sponsor_user_bridge_company
ALTER TABLE sponsor_user_bridge_company
DROP CONSTRAINT IF EXISTS sponsor_user_bridge_company_user_id_fkey;

ALTER TABLE sponsor_user_bridge_company
ADD CONSTRAINT sponsor_user_bridge_company_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- teams (organizer_id)
ALTER TABLE teams
DROP CONSTRAINT IF EXISTS teams_organizer_id_fkey;

ALTER TABLE teams
ADD CONSTRAINT teams_organizer_id_fkey
FOREIGN KEY (organizer_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL;

-- ============================================
-- 3. Tables referencing participants (which references user_profiles)
-- ============================================

-- participants -> user_profiles
ALTER TABLE participants
DROP CONSTRAINT IF EXISTS participants_id_fkey;

ALTER TABLE participants
ADD CONSTRAINT participants_id_fkey
FOREIGN KEY (id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- bonus_points_log -> user_profiles
ALTER TABLE bonus_points_log
DROP CONSTRAINT IF EXISTS bonus_points_log_user_id_fkey;

ALTER TABLE bonus_points_log
ADD CONSTRAINT bonus_points_log_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- Note: discord_profiles does not have user_id column, skipped
