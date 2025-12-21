import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { StampRepository } from '../../../../repository/stamp.repository';
import { getAuthenticatedUser } from '../../../../common/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const repo = container.resolve(StampRepository);
    const { data, error } = await repo.getUserStamps(userId);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
