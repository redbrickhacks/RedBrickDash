import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { SuperadminRepository } from '../../../../repository/superadmin.repository';
import { getSuperadminUser } from '../../../../common/superadmin-auth';

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
    const status = req.query.status
      ? parseInt(req.query.status as string, 10)
      : undefined;

    const { data, error } = await repo.getParticipantsForExport(status);

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data || []).map((p) => ({
      user_id: p.user_id,
      email: p.email || '',
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      application_status: p.application_status,
      team_id: p.team_id || '',
      team_name: p.teams?.name || '',
      created_at: p.created_at || '',
    }));

    const headers = [
      'user_id',
      'email',
      'first_name',
      'last_name',
      'application_status',
      'team_id',
      'team_name',
      'created_at',
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const value = String(row[h] || '');
            // Escape quotes and wrap in quotes if contains comma or quote
            if (value.includes(',') || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="participants-${
        new Date().toISOString().split('T')[0]
      }.csv"`
    );

    return res.status(200).send(csvContent);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
