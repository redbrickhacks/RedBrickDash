import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { SuperadminRepository } from '../../../../../../repository/superadmin.repository';
import { getSuperadminUser } from '../../../../../../common/superadmin-auth';
import {
  SuperadminEmailService,
  EmailTemplateType,
} from '../../../../../../services/superadmin-email.service';
import { getEnv } from '@hibiscus/env';

const BATCH_SIZE = 10;
const DELAY_BETWEEN_EMAILS_MS = 100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  const jobId = req.query.jobId as string;
  if (!jobId) {
    return res.status(400).json({ message: 'jobId is required' });
  }

  const repo = container.resolve(SuperadminRepository);

  try {
    const { data: job, error: jobError } = await repo.getEmailJob(jobId);

    if (jobError || !job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status === 'completed') {
      return res.status(400).json({ message: 'Job already completed' });
    }

    if (job.status === 'cancelled') {
      return res.status(400).json({ message: 'Job was cancelled' });
    }

    // Initialize email logs if this is first processing
    if (job.status === 'queued') {
      const { data: recipients } = await repo.getRecipientsForJob(
        jobId,
        job.target_status
      );

      if (recipients && recipients.length > 0) {
        await repo.createEmailLogs(
          jobId,
          recipients.map((r) => ({ userId: r.user_id, email: r.email }))
        );
      }

      await repo.updateEmailJobStatus(jobId, 'processing', {
        started_at: new Date().toISOString(),
      });
    }

    // Get pending logs to process
    const { data: pendingLogs } = await repo.getPendingEmailLogs(
      jobId,
      BATCH_SIZE
    );

    if (!pendingLogs || pendingLogs.length === 0) {
      await repo.updateEmailJobStatus(jobId, 'completed', {
        completed_at: new Date().toISOString(),
      });

      return res.status(200).json({
        processed: 0,
        remaining: 0,
        status: 'completed',
      });
    }

    // Initialize email service
    const apiKey = getEnv().Hibiscus.Resend?.apiKey;
    if (!apiKey) {
      return res.status(500).json({ message: 'Email service not configured' });
    }

    const emailService = new SuperadminEmailService(apiKey);

    // Process batch
    let processedCount = 0;
    for (const log of pendingLogs) {
      const { data: recipient } = await repo
        .getClient()
        .from('user_profiles')
        .select('first_name')
        .eq('user_id', log.recipient_id)
        .single();

      const recipientName = recipient?.first_name || 'Participant';

      const result = await emailService.sendEmail({
        toEmail: log.recipient_email,
        recipientName,
        template: job.template as EmailTemplateType,
        customSubject: job.subject,
        customBody: job.custom_body,
      });

      if (result.success) {
        await repo.updateEmailLogSent(log.id, result.resendId || '');
        await repo.incrementJobSentCount(jobId);
      } else {
        await repo.updateEmailLogFailed(
          log.id,
          result.error || 'Unknown error'
        );
        await repo.incrementJobFailedCount(jobId);
      }

      processedCount++;

      // Delay between emails to respect rate limits
      if (processedCount < pendingLogs.length) {
        await sleep(DELAY_BETWEEN_EMAILS_MS);
      }
    }

    // Check remaining
    const { count: remainingCount } = await repo.getPendingLogCount(jobId);

    const newStatus = remainingCount === 0 ? 'completed' : 'processing';
    if (newStatus === 'completed') {
      await repo.updateEmailJobStatus(jobId, 'completed', {
        completed_at: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      processed: processedCount,
      remaining: remainingCount || 0,
      status: newStatus,
    });
  } catch (e) {
    await repo.updateEmailJobStatus(jobId, 'failed', {
      error_message: e.message,
    });
    return res.status(500).json({ message: e.message });
  }
}
