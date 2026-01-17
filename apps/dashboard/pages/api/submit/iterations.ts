import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';
import { getEnv } from '@hibiscus/env';

const SUBMISSION_DEADLINE = new Date(
  getEnv().Hibiscus.Submission?.Deadline || '2026-01-17T23:59:59+05:30'
);

/**
 * GET /api/submit/iterations
 * Get the number of submission iterations (unique days submitted) for the user's team
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

  if (!user.team_id) {
    return res.status(200).json({
      iterationCount: 0,
      firstSubmittedAt: null,
      lastSubmittedAt: null,
    });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Fetch all submissions for this team before the deadline
    const { data: submissions, error } = await supabase
      .from('team_submissions')
      .select('submitted_at')
      .eq('team_id', user.team_id)
      .lte('submitted_at', SUBMISSION_DEADLINE.toISOString())
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('[submit/iterations] Fetch error:', error);
      return res.status(500).json({ message: 'Failed to fetch iterations' });
    }

    if (!submissions || submissions.length === 0) {
      return res.status(200).json({
        iterationCount: 0,
        firstSubmittedAt: null,
        lastSubmittedAt: null,
      });
    }

    // Count unique days (in IST timezone)
    const uniqueDays = new Set(
      submissions.map((s) => {
        const date = new Date(s.submitted_at);
        // Convert to IST (UTC+5:30) and get date string
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(date.getTime() + istOffset);
        return istDate.toISOString().split('T')[0];
      })
    );

    return res.status(200).json({
      iterationCount: uniqueDays.size,
      firstSubmittedAt: submissions[0].submitted_at,
      lastSubmittedAt: submissions[submissions.length - 1].submitted_at,
    });
  } catch (e) {
    console.error('[submit/iterations] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
