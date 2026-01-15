-- Migration: 20260116000001_add_hw_bom_url.sql
-- Add hardware BOM URL column to team_submissions

ALTER TABLE team_submissions
ADD COLUMN IF NOT EXISTS hw_bom_url TEXT;

COMMENT ON COLUMN team_submissions.hw_bom_url IS 'Public Google Sheet URL for hardware track Bill of Materials';
