import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { SuperadminRepository } from '../../../repository/superadmin.repository';
import { getSuperadminUser } from '../../../common/superadmin-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await getSuperadminUser(req);
  if (!user) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const repo = container.resolve(SuperadminRepository);

  try {
    const { data, error } = await repo.getTeamsWithMembers();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ data });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
