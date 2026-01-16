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
    const [statusCounts, teamCount, soloCount] = await Promise.all([
      repo.getParticipantCountsByStatus(),
      repo.getTeamCount(),
      repo.getSoloUserCount(),
    ]);

    if (statusCounts.error) {
      throw new Error(statusCounts.error.message);
    }

    // Aggregate counts by status
    const byStatus: Record<number, number> = {};
    let total = 0;
    for (const row of statusCounts.data || []) {
      const status = row.application_status;
      byStatus[status] = (byStatus[status] || 0) + 1;
      total++;
    }

    return res.status(200).json({
      participants: {
        total,
        byStatus,
      },
      teams: {
        total: teamCount.count || 0,
      },
      soloUsers: soloCount.count || 0,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
