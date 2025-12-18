-- Migration: 20251218000003_update_application_status.sql
-- Phase 1.3: Update application_status table for online round format
--
-- Current values (IDs 1-5):
--   1: NOT_APPLIED, 2: STARTED, 3: IN_REVIEW, 4: NOT_ADMITTED, 5: ADMITTED
--
-- New values (IDs 1-6):
--   1: NOT_APPLIED, 2: REGISTERED, 3: FINALIST, 4: CONFIRMED, 5: DECLINED, 6: NOT_SELECTED

-- Update existing statuses to new meanings
UPDATE application_status SET status = 'NOT_APPLIED' WHERE id = 1;
UPDATE application_status SET status = 'REGISTERED' WHERE id = 2;
UPDATE application_status SET status = 'FINALIST' WHERE id = 3;
UPDATE application_status SET status = 'CONFIRMED' WHERE id = 4;
UPDATE application_status SET status = 'DECLINED' WHERE id = 5;

-- Add new status
INSERT INTO application_status (id, status) VALUES (6, 'NOT_SELECTED')
  ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
