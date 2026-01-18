import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../../common/auth';

/**
 * Role IDs from the `roles` table:
 *   1 = SUPERADMIN
 *   7 = JUDGE
 * These are checked against user_profiles.role
 */
const ALLOWED_ROLES = [1, 7];

// Submission status that allows judging
const SUBMITTED_STATUS = 3;

interface JudgingNotesUpdate {
  // Pass 1
  pass_1?: 'yes' | 'no' | 'maybe' | null;
  pass_1_problem?: number | null;
  pass_1_solution?: number | null;
  pass_1_implementation?: number | null;
  pass_1_roadmap?: number | null;
  pass_1_notes?: string | null;
  // Pass 2
  pass_2?: 'yes' | 'no' | 'waitlist' | null;
  pass_2_problem?: number | null;
  pass_2_solution?: number | null;
  pass_2_implementation?: number | null;
  pass_2_roadmap?: number | null;
  pass_2_notes?: string | null;
  // Final
  final_decision?: 'finalist' | 'waitlist' | 'not_selected' | null;
  // Optimistic locking - client sends the updated_at value they last saw
  expected_updated_at?: string | null;
}

/**
 * PATCH /api/judge/notes/[teamId]
 * Upserts judging notes for a team.
 * Only accessible by admins (role=1) and judges (role=7).
 *
 * Optimistic locking:
 *   - Client should send `expected_updated_at` (the value from their last fetch)
 *   - If another judge updated the record, returns 409 Conflict
 *   - For new records, `expected_updated_at` should be null or omitted
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return res
      .status(403)
      .json({ message: 'Forbidden: Admin or Judge role required' });
  }

  const { teamId } = req.query;
  if (!teamId || typeof teamId !== 'string') {
    return res.status(400).json({ message: 'teamId is required' });
  }

  const updates: JudgingNotesUpdate = req.body;

  // Validate score values (1-5 if provided)
  const scoreFields = [
    'pass_1_problem',
    'pass_1_solution',
    'pass_1_implementation',
    'pass_1_roadmap',
    'pass_2_problem',
    'pass_2_solution',
    'pass_2_implementation',
    'pass_2_roadmap',
  ] as const;

  for (const field of scoreFields) {
    const value = updates[field];
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return res
          .status(400)
          .json({ message: `${field} must be between 1 and 5` });
      }
    }
  }

  // Validate decision values
  if (updates.pass_1 !== undefined && updates.pass_1 !== null) {
    if (!['yes', 'no', 'maybe'].includes(updates.pass_1)) {
      return res
        .status(400)
        .json({ message: 'pass_1 must be yes, no, or maybe' });
    }
  }
  if (updates.pass_2 !== undefined && updates.pass_2 !== null) {
    if (!['yes', 'no', 'waitlist'].includes(updates.pass_2)) {
      return res
        .status(400)
        .json({ message: 'pass_2 must be yes, no, or waitlist' });
    }
  }
  if (updates.final_decision !== undefined && updates.final_decision !== null) {
    if (
      !['finalist', 'waitlist', 'not_selected'].includes(updates.final_decision)
    ) {
      return res.status(400).json({
        message: 'final_decision must be finalist, waitlist, or not_selected',
      });
    }
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Verify team exists and has submitted
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('team_id, submission_status')
      .eq('team_id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.submission_status !== SUBMITTED_STATUS) {
      return res
        .status(400)
        .json({
          message:
            'Team has not submitted yet. Only submitted teams can be judged.',
        });
    }

    // Optimistic locking: check if another judge updated the record
    const { expected_updated_at } = updates;
    if (expected_updated_at !== undefined) {
      const { data: existingNotes } = await supabase
        .from('judging_notes')
        .select('updated_at')
        .eq('team_id', teamId)
        .single();

      if (existingNotes) {
        // Record exists - check for conflicts
        const currentUpdatedAt = existingNotes.updated_at;
        if (expected_updated_at === null) {
          // Client thought this was a new record, but it exists
          return res.status(409).json({
            message:
              'Another judge has already started reviewing this team. Please refresh.',
            currentUpdatedAt,
          });
        }
        if (currentUpdatedAt !== expected_updated_at) {
          // Record was updated since client last fetched
          return res.status(409).json({
            message:
              'Another judge has updated this record. Please refresh to see their changes.',
            currentUpdatedAt,
          });
        }
      } else if (expected_updated_at !== null) {
        // Client had a timestamp but record doesn't exist (was deleted?)
        return res.status(409).json({
          message: 'This judging record no longer exists. Please refresh.',
        });
      }
    }

    // Build update payload with timestamps
    const now = new Date().toISOString();
    const payload: Record<string, unknown> = { team_id: teamId };

    // Check if any pass_1 fields are being updated
    const pass1Fields = [
      'pass_1',
      'pass_1_problem',
      'pass_1_solution',
      'pass_1_implementation',
      'pass_1_roadmap',
      'pass_1_notes',
    ];
    const hasPass1Updates = pass1Fields.some(
      (f) => updates[f as keyof JudgingNotesUpdate] !== undefined
    );
    if (hasPass1Updates) {
      payload.pass_1_by = user.user_id;
      payload.pass_1_at = now;
    }

    // Check if any pass_2 fields are being updated
    const pass2Fields = [
      'pass_2',
      'pass_2_problem',
      'pass_2_solution',
      'pass_2_implementation',
      'pass_2_roadmap',
      'pass_2_notes',
    ];
    const hasPass2Updates = pass2Fields.some(
      (f) => updates[f as keyof JudgingNotesUpdate] !== undefined
    );
    if (hasPass2Updates) {
      payload.pass_2_by = user.user_id;
      payload.pass_2_at = now;
    }

    // Copy over provided updates (excluding client-only fields)
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'expected_updated_at') {
        payload[key] = value;
      }
    }

    // Upsert the judging notes
    const { error: upsertError } = await supabase
      .from('judging_notes')
      .upsert(payload, { onConflict: 'team_id' });

    if (upsertError) {
      console.error('[judge/notes] Upsert error:', upsertError);
      return res.status(500).json({ message: 'Failed to save judging notes' });
    }

    // Fetch the updated record
    const { data: updatedNotes, error: fetchError } = await supabase
      .from('judging_notes')
      .select('*')
      .eq('team_id', teamId)
      .single();

    if (fetchError) {
      console.error('[judge/notes] Fetch error:', fetchError);
      return res
        .status(500)
        .json({ message: 'Notes saved but failed to fetch updated record' });
    }

    return res.status(200).json({ notes: updatedNotes });
  } catch (e) {
    console.error('[judge/notes] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
