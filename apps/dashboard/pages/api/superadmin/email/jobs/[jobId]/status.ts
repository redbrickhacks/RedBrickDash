import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { SuperadminRepository } from '../../../../../../repository/superadmin.repository';
import { getSuperadminUser } from '../../../../../../common/superadmin-auth';

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

  const jobId = req.query.jobId as string;
  if (!jobId) {
    return res.status(400).json({ message: 'jobId is required' });
  }

  const repo = container.resolve(SuperadminRepository);

  try {
    const { data, error } = await repo.getEmailJob(jobId);

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const { count: pendingCount } = await repo.getPendingLogCount(jobId);

    return res.status(200).json({
      id: data.id,
      status: data.status,
      total_recipients: data.total_recipients,
      sent_count: data.sent_count,
      failed_count: data.failed_count,
      pending_count: pendingCount || 0,
      error_message: data.error_message,
      started_at: data.started_at,
      completed_at: data.completed_at,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
