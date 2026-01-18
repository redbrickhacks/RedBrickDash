-- Fix migration for judging_notes table
-- Addresses: reviewer FK delete behavior, NOT NULL timestamps, reviewer indexes

BEGIN;

-- 1. Ensure moddatetime extension is available
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- 2. Add ON DELETE SET NULL for reviewer foreign keys
-- Constraint names verified via information_schema query
DO $$
BEGIN
  -- Drop pass_1_by FK if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'judging_notes'
    AND constraint_name = 'judging_notes_pass_1_by_fkey'
  ) THEN
    ALTER TABLE judging_notes DROP CONSTRAINT judging_notes_pass_1_by_fkey;
  END IF;

  -- Drop pass_2_by FK if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'judging_notes'
    AND constraint_name = 'judging_notes_pass_2_by_fkey'
  ) THEN
    ALTER TABLE judging_notes DROP CONSTRAINT judging_notes_pass_2_by_fkey;
  END IF;
END $$;

ALTER TABLE judging_notes
  ADD CONSTRAINT judging_notes_pass_1_by_fkey
    FOREIGN KEY (pass_1_by) REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  ADD CONSTRAINT judging_notes_pass_2_by_fkey
    FOREIGN KEY (pass_2_by) REFERENCES user_profiles(user_id) ON DELETE SET NULL;

-- 3. Backfill NULL timestamps before adding NOT NULL constraint
UPDATE judging_notes SET created_at = NOW() WHERE created_at IS NULL;
UPDATE judging_notes SET updated_at = NOW() WHERE updated_at IS NULL;

ALTER TABLE judging_notes
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- 4. Add indexes for reviewer lookups
CREATE INDEX IF NOT EXISTS idx_judging_notes_pass_1_by ON judging_notes(pass_1_by);
CREATE INDEX IF NOT EXISTS idx_judging_notes_pass_2_by ON judging_notes(pass_2_by);

COMMIT;

-- Note: Magic numbers in RLS policies (role IN (1, 7)) are intentionally not changed.
-- For this hackathon tool, hardcoded IDs are acceptable. Document here:
--   Role 1 = SUPERADMIN
--   Role 7 = JUDGE
