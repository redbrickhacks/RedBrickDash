import 'reflect-metadata';
import { DashboardRepository } from '../../../repository/dashboard.repository';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { getAuthenticatedUser } from '../../../common/auth';

export default async function cancelInvite(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const repo = container.resolve(DashboardRepository);
    const { inviteId } = req.query;

    if (!inviteId || typeof inviteId !== 'string') {
      return res.status(400).json({ message: 'inviteId is required' });
    }

    // Get invite info to verify ownership
    const { data: inviteData, error: inviteError } = await repo.getInviteInfo(
      inviteId
    );

    if (inviteError || !inviteData || inviteData.length === 0) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    const invite = inviteData[0];
    const teamId = invite.team_id;

    // Verify user is the team organizer
    const isOrganizer = await repo.verifyUserIsOrganizer(user.user_id, teamId);
    if (!isOrganizer) {
      return res.status(403).json({
        message: 'Only the team organizer can cancel invites',
      });
    }

    // Delete the invite
    const { error: deleteError } = await repo.deleteAcceptedInvite(inviteId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return res.status(200).json({
      message: 'Invite cancelled successfully',
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: e.message });
  }
}
