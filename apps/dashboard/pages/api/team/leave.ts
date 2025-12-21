import 'reflect-metadata';
import { DashboardRepository } from '../../../repository/dashboard.repository';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { getAuthenticatedUser } from '../../../common/auth';

/**
 * Allows a team member (non-organizer) to leave their team
 * @param req - { userId: string }
 * @param res - JSON response
 * @return 400 if user is organizer (must disband instead), 200 if left successfully
 */
export default async function leaveTeam(
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

  try {
    const repo = container.resolve(DashboardRepository);
    const userId: string = req.body.userId;

    if (!userId) {
      throw new Error('User ID is missing.');
    }

    if (user.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if user has a team
    if (!user.team_id) {
      throw new Error('You are not in a team.');
    }

    // Check if user is the organizer - organizers must disband, not leave
    const team = await repo.getTeamInfo(user.team_id);
    if (team.error) {
      throw new Error(team.error.message);
    }

    if (team.data.organizer_id === userId) {
      throw new Error(
        'As the team organizer, you cannot leave. You must disband the team instead.'
      );
    }

    // Remove user from team by setting their team_id to null
    const result = await repo.updateUserTeamId(userId, null);
    if (result.error) {
      throw new Error(result.error.message);
    }

    return res.status(200).json({ message: 'Successfully left the team.' });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}
