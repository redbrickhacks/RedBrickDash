-- Migration: 20251218000001_create_tracks_table.sql
-- Phase 1.1: Create tracks table for SDG track selection

CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sdg_number INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO tracks (name, sdg_number, description) VALUES
  ('Quality Education', 4, 'SDG 4 - Ensure inclusive and equitable quality education'),
  ('Sustainable Cities & Communities', 11, 'SDG 11 - Make cities inclusive, safe, resilient and sustainable'),
  ('Climate Action', 13, 'SDG 13 - Take urgent action to combat climate change');

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read tracks
CREATE POLICY "Tracks are viewable by authenticated users"
  ON tracks FOR SELECT
  TO authenticated
  USING (true);
