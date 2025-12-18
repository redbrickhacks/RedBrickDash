-- Migration: 20251218000002_create_submission_status_table.sql
-- Phase 1.2: Create submission_status table for team submission tracking

CREATE TABLE IF NOT EXISTS submission_status (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL UNIQUE
);

-- Seed data
INSERT INTO submission_status (id, status) VALUES
  (1, 'NOT_SUBMITTED'),
  (2, 'SUBMITTED'),
  (3, 'FINALIST'),
  (4, 'NOT_SELECTED');

-- Enable RLS
ALTER TABLE submission_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submission status is viewable by authenticated users"
  ON submission_status FOR SELECT
  TO authenticated
  USING (true);
