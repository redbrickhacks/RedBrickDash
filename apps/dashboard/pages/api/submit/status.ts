import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';
import { getEnv } from '@hibiscus/env';

// Submission deadline: January 17, 2026 11:59 PM IST - soft extension
const SUBMISSION_DEADLINE = new Date(
  getEnv().Hibiscus.Submission?.Deadline || '2026-01-17T23:59:59+05:30'
);

/**
 * GET /api/submit/status
 * Get team's submission status and project details
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const canSubmit = new Date() <= SUBMISSION_DEADLINE;

  // User has no team
  if (!user.team_id) {
    return res.status(200).json({
      hasTeam: false,
      team: null,
      canSubmit,
    });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Fetch team details with track info
    const { data: team, error } = await supabase
      .from('teams')
      .select(
        `
        team_id,
        name,
        project_title,
        track_id,
        is_hardware,
        submission_status,
        final_submitted_at,
        tracks (
          id,
          name,
          sdg_number
        )
      `
      )
      .eq('team_id', user.team_id)
      .single();

    if (error) {
      console.error('[submit/status] Fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch team status' });
    }

    return res.status(200).json({
      hasTeam: true,
      team: {
        teamId: team.team_id,
        name: team.name,
        projectTitle: team.project_title,
        trackId: team.track_id,
        track: team.tracks,
        isHardware: team.is_hardware ?? false,
        submissionStatus: team.submission_status ?? 1,
        finalSubmittedAt: team.final_submitted_at,
      },
      canSubmit,
    });
  } catch (e) {
    console.error('[submit/status] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
