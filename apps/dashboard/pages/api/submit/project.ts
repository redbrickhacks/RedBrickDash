import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';
import { getEnv } from '@hibiscus/env';

// Submission deadline: January 16, 2026 11:59 PM IST
const SUBMISSION_DEADLINE = new Date(
  getEnv().Hibiscus.Submission?.Deadline || '2026-01-16T23:59:59+05:30'
);

/**
 * PUT /api/submit/project
 * Save project details (title, track, is_hardware) to teams table
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check deadline
  if (new Date() > SUBMISSION_DEADLINE) {
    return res.status(400).json({ message: 'Submission deadline has passed' });
  }

  // Validate user has a team
  if (!user.team_id) {
    return res.status(400).json({ message: 'You must have a team to submit' });
  }

  const { projectTitle, trackId, isHardware } = req.body;

  // Validate required fields
  if (!projectTitle || typeof projectTitle !== 'string') {
    return res.status(400).json({ message: 'Project title is required' });
  }

  if (projectTitle.length > 100) {
    return res
      .status(400)
      .json({ message: 'Project title must be 100 characters or less' });
  }

  if (!trackId || typeof trackId !== 'number') {
    return res.status(400).json({ message: 'Track selection is required' });
  }

  // Validate track_id exists (1, 2, or 3)
  if (![1, 2, 3].includes(trackId)) {
    return res.status(400).json({ message: 'Invalid track selection' });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Update team with project details
    const { data, error } = await supabase
      .from('teams')
      .update({
        project_title: projectTitle.trim(),
        track_id: trackId,
        is_hardware: Boolean(isHardware),
      })
      .eq('team_id', user.team_id)
      .select(
        'team_id, project_title, track_id, is_hardware, submission_status, final_submitted_at'
      )
      .single();

    if (error) {
      console.error('[submit/project] Update error:', error);
      return res
        .status(500)
        .json({ message: 'Failed to save project details' });
    }

    return res.status(200).json({
      message: 'Project details saved',
      team: data,
    });
  } catch (e) {
    console.error('[submit/project] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
