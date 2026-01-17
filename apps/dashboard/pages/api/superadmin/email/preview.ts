import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSuperadminUser } from '../../../../common/superadmin-auth';
import {
  SuperadminEmailService,
  EmailTemplateType,
} from '../../../../services/superadmin-email.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await getSuperadminUser(req);
  if (!user) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const { template, customBody } = req.body;

    if (!template) {
      return res.status(400).json({ message: 'template is required' });
    }

    // Preview doesn't need a real API key
    const emailService = new SuperadminEmailService('preview-key');
    const html = emailService.buildPreviewHtml(
      template as EmailTemplateType,
      customBody
    );

    return res.status(200).json({ html });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
