-- User stamps table
-- Tracks stamps given to users, with 9-slot limit per user

CREATE TABLE IF NOT EXISTS user_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  stamp_type_id INTEGER NOT NULL REFERENCES stamp_types(id) ON DELETE CASCADE,
  giver_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  is_system_gift BOOLEAN DEFAULT FALSE,
  slot_position INTEGER NOT NULL CHECK (slot_position >= 0 AND slot_position < 9),
  message TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (recipient_id, slot_position)
);

-- Enable RLS
ALTER TABLE user_stamps ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view stamps
CREATE POLICY "Stamps viewable by authenticated"
  ON user_stamps FOR SELECT
  TO authenticated
  USING (true);

-- Users can give stamps
CREATE POLICY "Authenticated can give stamps"
  ON user_stamps FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = giver_id
    OR is_system_gift = true
  );

-- Only recipient can delete their stamps
CREATE POLICY "Recipients can clear own stamps"
  ON user_stamps FOR DELETE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Index for fast lookups by recipient
CREATE INDEX idx_user_stamps_recipient ON user_stamps(recipient_id);
