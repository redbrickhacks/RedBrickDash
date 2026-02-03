-- Create judging_notes table for two-pass judging system (MVP: single reviewer per pass)
-- Future: migrate to judging_reviews table if multiple reviewers needed per pass

BEGIN;

-- Ensure moddatetime extension is available (required for updated_at trigger)
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TABLE judging_notes (
  team_id UUID PRIMARY KEY REFERENCES teams(team_id) ON DELETE CASCADE,

  -- Pass 1: Initial review
  pass_1 TEXT CHECK (pass_1 IN ('yes', 'no', 'maybe')),
  pass_1_problem INT CHECK (pass_1_problem BETWEEN 1 AND 5),
  pass_1_solution INT CHECK (pass_1_solution BETWEEN 1 AND 5),
  pass_1_implementation INT CHECK (pass_1_implementation BETWEEN 1 AND 5),
  pass_1_roadmap INT CHECK (pass_1_roadmap BETWEEN 1 AND 5),
  pass_1_notes TEXT,
  pass_1_by UUID REFERENCES user_profiles(user_id),
  pass_1_at TIMESTAMPTZ,

  -- Pass 2: Second review
  pass_2 TEXT CHECK (pass_2 IN ('yes', 'no', 'waitlist')),
  pass_2_problem INT CHECK (pass_2_problem BETWEEN 1 AND 5),
  pass_2_solution INT CHECK (pass_2_solution BETWEEN 1 AND 5),
  pass_2_implementation INT CHECK (pass_2_implementation BETWEEN 1 AND 5),
  pass_2_roadmap INT CHECK (pass_2_roadmap BETWEEN 1 AND 5),
  pass_2_notes TEXT,
  pass_2_by UUID REFERENCES user_profiles(user_id),
  pass_2_at TIMESTAMPTZ,

  -- Final decision
  final_decision TEXT CHECK (final_decision IN ('finalist', 'waitlist', 'not_selected')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for filtering
CREATE INDEX idx_judging_notes_pass_1 ON judging_notes(pass_1);
CREATE INDEX idx_judging_notes_pass_2 ON judging_notes(pass_2);
CREATE INDEX idx_judging_notes_final_decision ON judging_notes(final_decision);

-- Enable RLS
ALTER TABLE judging_notes ENABLE ROW LEVEL SECURITY;

-- RLS: Admins (role=1) and judges (role=7) can read
CREATE POLICY "Admins and judges can read judging_notes"
  ON judging_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN (1, 7)
    )
  );

-- RLS: Admins and judges can insert
CREATE POLICY "Admins and judges can insert judging_notes"
  ON judging_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN (1, 7)
    )
  );

-- RLS: Admins and judges can update
CREATE POLICY "Admins and judges can update judging_notes"
  ON judging_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN (1, 7)
    )
  );

-- RLS: Only admins can delete
CREATE POLICY "Only admins can delete judging_notes"
  ON judging_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 1
    )
  );

-- Auto-update updated_at
CREATE TRIGGER trigger_judging_notes_updated_at
  BEFORE UPDATE ON judging_notes
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

COMMIT;
