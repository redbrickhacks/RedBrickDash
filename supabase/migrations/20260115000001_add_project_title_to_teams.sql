-- Migration: 20260115000001_add_project_title_to_teams.sql
-- Add project_title column to teams table for submission portal

ALTER TABLE teams ADD COLUMN IF NOT EXISTS project_title TEXT;

-- Add comment for documentation
COMMENT ON COLUMN teams.project_title IS 'Project title entered during online round submission';
