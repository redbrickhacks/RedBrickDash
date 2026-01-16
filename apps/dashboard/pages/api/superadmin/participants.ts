import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { SuperadminRepository } from '../../../repository/superadmin.repository';
import { getSuperadminUser } from '../../../common/superadmin-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getSuperadminUser(req);
  if (!user) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const repo = container.resolve(SuperadminRepository);

  if (req.method === 'GET') {
    return handleGet(req, res, repo);
  } else if (req.method === 'POST') {
    return handlePost(req, res, repo);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  repo: SuperadminRepository
) {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status
      ? parseInt(req.query.status as string, 10)
      : undefined;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = Math.min(
      parseInt((req.query.limit as string) || '50', 10),
      100
    );

    const { data, error, count } = await repo.getParticipants({
      search,
      status,
      page,
      limit,
    });

    if (error) {
      throw new Error(error.message);
    }

    const participants = (data || []).map((p) => ({
      user_id: p.user_id,
      email: p.email,
      first_name: p.first_name,
      last_name: p.last_name,
      application_status: p.application_status,
      team_id: p.team_id,
      team_name: p.teams?.name || null,
      created_at: p.created_at,
      submission_status: p.submission_status,
    }));

    return res.status(200).json({
      data: participants,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  repo: SuperadminRepository
) {
  try {
    const { userIds, newStatus } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'userIds must be a non-empty array' });
    }

    if (typeof newStatus !== 'number' || newStatus < 1 || newStatus > 6) {
      return res
        .status(400)
        .json({ message: 'newStatus must be a number between 1 and 6' });
    }

    const { data, error } = await repo.bulkUpdateStatus(userIds, newStatus);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({
      success: true,
      updated: data?.length || 0,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
