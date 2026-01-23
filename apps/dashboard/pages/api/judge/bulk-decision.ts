import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';

/**
 * Role IDs from the `roles` table:
 *   1 = SUPERADMIN
 *   7 = JUDGE
 */
const ALLOWED_ROLES = [1, 7];

const VALID_DECISIONS = ['finalist', 'waitlist', 'not_selected'] as const;
type FinalDecision = (typeof VALID_DECISIONS)[number];

interface BulkDecisionRequest {
  teamIds: string[];
  decision: FinalDecision;
}

/**
 * POST /api/judge/bulk-decision
 * Bulk update final_decision for multiple teams.
 * Only accessible by admins (role=1) and judges (role=7).
 *
 * Body: { teamIds: string[], decision: 'finalist' | 'waitlist' | 'not_selected' }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

  const body = req.body as BulkDecisionRequest;

  // Validate teamIds
  if (!Array.isArray(body.teamIds) || body.teamIds.length === 0) {
    return res
      .status(400)
      .json({ message: 'teamIds must be a non-empty array' });
  }

  if (body.teamIds.length > 500) {
    return res.status(400).json({ message: 'Maximum 500 teams per request' });
  }

  // Validate decision
  if (!VALID_DECISIONS.includes(body.decision)) {
    return res.status(400).json({
      message: 'decision must be one of: finalist, waitlist, not_selected',
    });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Build upsert payload for all teams
    const payload = body.teamIds.map((teamId) => ({
      team_id: teamId,
      final_decision: body.decision,
    }));

    // Bulk upsert
    const { error: upsertError } = await supabase
      .from('judging_notes')
      .upsert(payload, { onConflict: 'team_id' });

    if (upsertError) {
      console.error('[judge/bulk-decision] Upsert error:', upsertError);
      return res.status(500).json({ message: 'Failed to update decisions' });
    }

    return res.status(200).json({
      message: 'Decisions updated successfully',
      count: body.teamIds.length,
      decision: body.decision,
    });
  } catch (e) {
    console.error('[judge/bulk-decision] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
