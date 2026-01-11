-- Add referral tracking columns to user_profiles
-- For referral program: top 25 referrers get INR 1500, 5 random referred users get INR 1000

-- Add referral_code column (unique 6-char alphanumeric code per user)
-- UNIQUE constraint implicitly creates an index for lookups
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(6) UNIQUE;

-- Add referred_by column (who referred this user)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL;

-- Index for counting referrals per user (used for leaderboard queries)
CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by
  ON user_profiles(referred_by);

-- Prevent self-referral at database level (defense in depth)
ALTER TABLE user_profiles
ADD CONSTRAINT no_self_referral CHECK (referred_by IS NULL OR referred_by != user_id);

-- Grant INSERT permission for referral_code to authenticated users
-- (used by createUserProfile in hibiscus-supabase-client)
-- Note: referred_by is set via service key in /api/profile/create, no grant needed
GRANT INSERT (referral_code) ON TABLE user_profiles TO authenticated;
