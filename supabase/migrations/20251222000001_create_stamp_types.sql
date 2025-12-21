-- Stamp types master table
-- Defines available stamps users can give each other

CREATE TABLE IF NOT EXISTS stamp_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  description TEXT,
  is_system_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed stamp types
INSERT INTO stamp_types (name, emoji, description, is_system_only) VALUES
  ('coffee', '☕', 'Fuel up!', false),
  ('star', '⭐', 'You''re a star', false),
  ('rocket', '🚀', 'To the moon', false),
  ('heart', '❤️', 'Sending love', false),
  ('fire', '🔥', 'On fire!', false),
  ('lightbulb', '💡', 'Great idea', false),
  ('fistbump', '👊', 'Solidarity', false),
  ('pizza', '🍕', 'Fuel up!', false),
  ('owl', '🦉', 'Night owl', false),
  ('moon', '🌙', 'Burning midnight oil', false),
  ('sparkles', '✨', 'Magic', false),
  ('music', '🎵', 'In the zone', false),
  ('bug', '🐛', 'Debugging solidarity', false),
  ('ribbon', '🎗️', 'You got this', false),
  ('rbh-special', '🎁', 'From RedBrick Hacks', true);

-- Enable RLS
ALTER TABLE stamp_types ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read stamp types
CREATE POLICY "Stamp types readable by authenticated"
  ON stamp_types FOR SELECT
  TO authenticated
  USING (true);
