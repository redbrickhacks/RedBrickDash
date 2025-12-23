import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { StampRepository } from '../../../repository/stamp.repository';
import { getAuthenticatedUser } from '../../../common/auth';
import { isValidUUID } from '../../../common/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { stampId } = req.body;

    if (!stampId) {
      return res.status(400).json({ message: 'stampId is required' });
    }

    if (!isValidUUID(stampId)) {
      return res.status(400).json({ message: 'Invalid stampId format' });
    }

    const repo = container.resolve(StampRepository);

    // Delete only allows removing stamps from your own collection
    const { error } = await repo.deleteStamp(stampId, user.user_id);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ message: 'Stamp removed successfully' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
