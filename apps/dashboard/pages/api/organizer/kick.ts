import 'reflect-metadata';
import { DashboardRepository } from '../../../repository/dashboard.repository';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { getAuthenticatedUser } from '../../../common/auth';

export default async function kickTeamMember(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const repo = container.resolve(DashboardRepository);
    const kickId: string = req.body.kickId;

    if (!kickId) {
      throw new Error('One or more of the required parameters is missing.');
    }

    // Get team info for the user being kicked
    const userTeamResponse = await repo.getUserTeam(kickId);
    if (userTeamResponse.error) {
      throw new Error(userTeamResponse.error.message);
    }
    const teamId = userTeamResponse.data.team_id;
    const teamInfoResponse = await repo.getTeamInfo(teamId);
    if (teamInfoResponse.error) {
      throw new Error(teamInfoResponse.error.message);
    }

    // Verify the authenticated user is the organizer of the team
    const organizerId = teamInfoResponse.data.organizer_id;
    if (user.user_id !== organizerId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    //find kickId in user_profiles and set team_id to null
    const result = await repo.updateKickedUser(kickId, teamId);

    if (result.error) {
      throw new Error(result.error.message);
    }

    //returns the kicked user in case wanted to display
    return res.status(200).json(result.data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}
