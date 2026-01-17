import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { SuperadminRepository } from '../../../../repository/superadmin.repository';
import { getSuperadminUser } from '../../../../common/superadmin-auth';

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
    return handleGet(res, repo);
  } else if (req.method === 'POST') {
    return handlePost(req, res, repo, user.user_id);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(res: NextApiResponse, repo: SuperadminRepository) {
  try {
    const { data, error } = await repo.getEmailJobs();

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ data });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  repo: SuperadminRepository,
  userId: string
) {
  try {
    const { template, subject, customBody, targetStatus } = req.body;

    if (!template || !subject || !Array.isArray(targetStatus)) {
      return res.status(400).json({
        message: 'template, subject, and targetStatus are required',
      });
    }

    if (template === 'custom' && !customBody) {
      return res.status(400).json({
        message: 'customBody is required for custom template',
      });
    }

    const { data, error } = await repo.createEmailJob({
      createdBy: userId,
      template,
      subject,
      customBody,
      targetStatus,
    });

    if (error) {
      throw new Error(error.message);
    }

    return res.status(201).json({
      id: data.id,
      totalRecipients: data.total_recipients,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
