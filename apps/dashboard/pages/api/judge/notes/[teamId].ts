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

interface FinalDecisionUpdate {
  final_decision?: 'finalist' | 'waitlist' | 'not_selected' | null;
  // Optimistic locking - client sends the updated_at value they last saw
  expected_updated_at?: string | null;
}

/**
 * PATCH /api/judge/notes/[teamId]
 * Updates the final_decision for a team.
 * Only accessible by admins (role=1) and judges (role=7).
 *
 * Note: Pass 1/2 scores are now managed via /api/judge/scores/[teamId].
 * This endpoint only handles final_decision on judging_notes.
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

  const updates: FinalDecisionUpdate = req.body;

  // Validate final_decision value
  if (updates.final_decision !== undefined && updates.final_decision !== null) {
    if (
      !['finalist', 'waitlist', 'not_selected'].includes(updates.final_decision)
    ) {
      return res.status(400).json({
        message: 'final_decision must be finalist, waitlist, or not_selected',
      });
    }
  }

  // Check for legacy pass_1/pass_2 fields and return helpful error
  const body = req.body as Record<string, unknown>;
  const legacyFields = [
    'pass_1',
    'pass_1_problem',
    'pass_1_solution',
    'pass_1_implementation',
    'pass_1_roadmap',
    'pass_1_notes',
    'pass_2',
    'pass_2_problem',
    'pass_2_solution',
    'pass_2_implementation',
    'pass_2_roadmap',
    'pass_2_notes',
  ];
  const usedLegacyFields = legacyFields.filter((f) => body[f] !== undefined);
  if (usedLegacyFields.length > 0) {
    return res.status(400).json({
      message:
        'Pass 1/2 scores are now managed via /api/judge/scores/[teamId]. This endpoint only handles final_decision.',
      hint: 'Use PATCH /api/judge/scores/[teamId] with { pass: 1 | 2, problem, solution, implementation, roadmap, decision, notes }',
    });
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
      return res.status(400).json({
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
        const currentUpdatedAt = existingNotes.updated_at;
        if (expected_updated_at === null) {
          return res.status(409).json({
            message:
              'Another judge has already started reviewing this team. Please refresh.',
            currentUpdatedAt,
          });
        }
        if (currentUpdatedAt !== expected_updated_at) {
          return res.status(409).json({
            message:
              'Another judge has updated this record. Please refresh to see their changes.',
            currentUpdatedAt,
          });
        }
      } else if (expected_updated_at !== null) {
        return res.status(409).json({
          message: 'This judging record no longer exists. Please refresh.',
        });
      }
    }

    // Build update payload - only final_decision
    const payload: Record<string, unknown> = {
      team_id: teamId,
      final_decision: updates.final_decision,
    };

    // Upsert the judging notes
    const { error: upsertError } = await supabase
      .from('judging_notes')
      .upsert(payload, { onConflict: 'team_id' });

    if (upsertError) {
      console.error('[judge/notes] Upsert error:', upsertError);
      return res.status(500).json({ message: 'Failed to save final decision' });
    }

    // Fetch the updated record
    const { data: updatedNotes, error: fetchError } = await supabase
      .from('judging_notes')
      .select('team_id, final_decision, updated_at')
      .eq('team_id', teamId)
      .single();

    if (fetchError) {
      console.error('[judge/notes] Fetch error:', fetchError);
      return res.status(500).json({
        message: 'Final decision saved but failed to fetch updated record',
      });
    }

    return res.status(200).json({ notes: updatedNotes });
  } catch (e) {
    console.error('[judge/notes] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
