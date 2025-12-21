import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { getAuthenticatedUser } from '../../../common/auth';
import { InviteRepository } from '../../../repository/invite.repository';

/**
 * Get pending invites for a user
 * @param req - { userId: string } as query param
 * @param res - JSON response with pending invites
 */
export default async function getPendingInvites(
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

  try {
    const inviteRepo = container.resolve(InviteRepository);
    const userId = req.query.userId as string;

    if (!userId) {
      throw new Error('User ID is missing.');
    }

    if (user.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await inviteRepo.getInvitesForUser(userId);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ invites: data || [] });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}
