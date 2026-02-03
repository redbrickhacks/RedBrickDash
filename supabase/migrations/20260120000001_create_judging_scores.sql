-- Create judging_scores table for multi-reviewer judging system
-- Supports 4 reviewers for Pass 1, 3 reviewers for Pass 2
-- Each reviewer scores independently; aggregates computed on read

BEGIN;

-- Ensure moddatetime extension is available
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- 1. Create the judging_scores table
CREATE TABLE judging_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  judge_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  pass INT NOT NULL CHECK (pass IN (1, 2)),

  -- Scoring criteria (1-5 scale)
  problem INT CHECK (problem BETWEEN 1 AND 5),
  solution INT CHECK (solution BETWEEN 1 AND 5),
  implementation INT CHECK (implementation BETWEEN 1 AND 5),
  roadmap INT CHECK (roadmap BETWEEN 1 AND 5),

  -- Decision: Pass 1 = yes/no/maybe, Pass 2 = yes/no/waitlist
  -- Using TEXT with CHECK constraint for flexibility
  decision TEXT CHECK (
    (pass = 1 AND decision IN ('yes', 'no', 'maybe')) OR
    (pass = 2 AND decision IN ('yes', 'no', 'waitlist')) OR
    decision IS NULL
  ),

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One score per judge per team per pass
  UNIQUE(team_id, judge_id, pass)
);

-- 2. Add indexes for common query patterns
CREATE INDEX idx_judging_scores_team_id ON judging_scores(team_id);
CREATE INDEX idx_judging_scores_judge_id ON judging_scores(judge_id);
CREATE INDEX idx_judging_scores_pass ON judging_scores(pass);
CREATE INDEX idx_judging_scores_team_pass ON judging_scores(team_id, pass);

-- 3. Auto-update updated_at trigger
CREATE TRIGGER trigger_judging_scores_updated_at
  BEFORE UPDATE ON judging_scores
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- 4. Enable RLS
ALTER TABLE judging_scores ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Role 1 = SUPERADMIN, Role 7 = JUDGE

-- Admins and judges can read all scores
CREATE POLICY "Admins and judges can read judging_scores"
  ON judging_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN (1, 7)
    )
  );

-- Admins and judges can insert scores
CREATE POLICY "Admins and judges can insert judging_scores"
  ON judging_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN (1, 7)
    )
  );

-- Judges can only update their own scores; admins can update any
CREATE POLICY "Judges update own scores, admins update any"
  ON judging_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (
        user_profiles.role = 1 OR
        (user_profiles.role = 7 AND judging_scores.judge_id = auth.uid())
      )
    )
  );

-- Only admins can delete scores
CREATE POLICY "Only admins can delete judging_scores"
  ON judging_scores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 1
    )
  );

-- 6. Migrate existing data from judging_notes to judging_scores
-- This preserves existing Pass 1 and Pass 2 reviews as the first reviewer's scores

-- Migrate Pass 1 scores (only if at least one score field is populated)
INSERT INTO judging_scores (team_id, judge_id, pass, problem, solution, implementation, roadmap, decision, notes, created_at, updated_at)
SELECT
  team_id,
  pass_1_by,
  1 AS pass,
  pass_1_problem,
  pass_1_solution,
  pass_1_implementation,
  pass_1_roadmap,
  pass_1 AS decision,
  pass_1_notes,
  COALESCE(pass_1_at, created_at) AS created_at,
  COALESCE(pass_1_at, updated_at) AS updated_at
FROM judging_notes
WHERE pass_1_by IS NOT NULL
   OR pass_1_problem IS NOT NULL
   OR pass_1_solution IS NOT NULL
   OR pass_1_implementation IS NOT NULL
   OR pass_1_roadmap IS NOT NULL
   OR pass_1 IS NOT NULL;

-- Migrate Pass 2 scores (only if at least one score field is populated)
INSERT INTO judging_scores (team_id, judge_id, pass, problem, solution, implementation, roadmap, decision, notes, created_at, updated_at)
SELECT
  team_id,
  pass_2_by,
  2 AS pass,
  pass_2_problem,
  pass_2_solution,
  pass_2_implementation,
  pass_2_roadmap,
  pass_2 AS decision,
  pass_2_notes,
  COALESCE(pass_2_at, created_at) AS created_at,
  COALESCE(pass_2_at, updated_at) AS updated_at
FROM judging_notes
WHERE pass_2_by IS NOT NULL
   OR pass_2_problem IS NOT NULL
   OR pass_2_solution IS NOT NULL
   OR pass_2_implementation IS NOT NULL
   OR pass_2_roadmap IS NOT NULL
   OR pass_2 IS NOT NULL;

COMMIT;

-- Note: We keep the existing judging_notes table for final_decision storage.
-- The pass_1_* and pass_2_* columns in judging_notes are now deprecated
-- but not removed for backward compatibility during transition.
