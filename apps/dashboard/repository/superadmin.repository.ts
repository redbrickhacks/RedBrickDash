import { injectable } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';

@injectable()
export class SuperadminRepository {
  private client: SupabaseClient;

  constructor(private readonly hbc: HibiscusSupabaseClient) {
    hbc.setOptions({ useServiceKey: true });
    this.client = hbc.getClient();
  }

  getClient() {
    return this.client;
  }

  // Stats queries

  async getParticipantCountsByStatus() {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('application_status')
      .not('application_status', 'is', null);
    return { data, error };
  }

  async getTeamCount() {
    const { count, error } = await this.client
      .from('teams')
      .select('*', { count: 'exact', head: true });
    return { count, error };
  }

  async getSoloUserCount() {
    // Users with REGISTERED status (2) but no team
    const { count, error } = await this.client
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('application_status', 2)
      .is('team_id', null);
    return { count, error };
  }

  // Participants queries

  async getParticipants(options: {
    search?: string;
    status?: number;
    page: number;
    limit: number;
  }) {
    let query = this.client.from('user_profiles').select(
      `
        user_id,
        email,
        first_name,
        last_name,
        application_status,
        team_id,
        created_at,
        submission_status,
        teams!user_profiles_team_id_fkey (name)
      `,
      { count: 'exact' }
    );

    if (options.search) {
      const searchTerm = `%${options.search}%`;
      query = query.or(
        `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`
      );
    }

    if (options.status !== undefined) {
      query = query.eq('application_status', options.status);
    }

    const offset = (options.page - 1) * options.limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + options.limit - 1);

    const { data, error, count } = await query;
    return { data, error, count };
  }

  async bulkUpdateStatus(userIds: string[], newStatus: number) {
    const { data, error } = await this.client
      .from('user_profiles')
      .update({
        application_status: newStatus,
        application_status_last_changed: new Date().toISOString(),
      })
      .in('user_id', userIds)
      .select('user_id');
    return { data, error };
  }

  async getParticipantsForExport(status?: number) {
    let query = this.client.from('user_profiles').select(`
        user_id,
        email,
        first_name,
        last_name,
        application_status,
        team_id,
        created_at,
        teams!user_profiles_team_id_fkey (name)
      `);

    if (status !== undefined) {
      query = query.eq('application_status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
  }

  // Teams queries

  async getTeamsWithMembers() {
    const { data: teams, error: teamsError } = await this.client
      .from('teams')
      .select(
        `
        team_id,
        name,
        description,
        organizer_id,
        project_title,
        submission_status,
        created_at
      `
      )
      .order('created_at', { ascending: false });

    if (teamsError) {
      return { data: null, error: teamsError };
    }

    // Fetch members for each team
    const teamsWithMembers = await Promise.all(
      teams.map(async (team) => {
        const { data: members } = await this.client
          .from('user_profiles')
          .select('user_id, first_name, last_name, email, application_status')
          .eq('team_id', team.team_id);
        return { ...team, members: members || [] };
      })
    );

    return { data: teamsWithMembers, error: null };
  }

  // Email job queries

  async createEmailJob(job: {
    createdBy: string;
    template: string;
    subject: string;
    customBody?: string;
    targetStatus: number[];
  }) {
    // Count recipients first
    const { count } = await this.client
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .in('application_status', job.targetStatus);

    const { data, error } = await this.client
      .from('email_jobs')
      .insert({
        created_by: job.createdBy,
        template: job.template,
        subject: job.subject,
        custom_body: job.customBody,
        target_status: job.targetStatus,
        total_recipients: count || 0,
        status: 'queued',
      })
      .select()
      .single();

    return { data, error };
  }

  async getEmailJobs() {
    const { data, error } = await this.client
      .from('email_jobs')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async getEmailJob(jobId: string) {
    const { data, error } = await this.client
      .from('email_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    return { data, error };
  }

  async updateEmailJobStatus(
    jobId: string,
    status: string,
    extras?: {
      started_at?: string;
      completed_at?: string;
      error_message?: string;
    }
  ) {
    const { data, error } = await this.client
      .from('email_jobs')
      .update({ status, ...extras })
      .eq('id', jobId)
      .select()
      .single();
    return { data, error };
  }

  async getRecipientsForJob(jobId: string, targetStatus: number[]) {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('user_id, email, first_name, last_name')
      .in('application_status', targetStatus);
    return { data, error };
  }

  async createEmailLogs(
    jobId: string,
    recipients: { userId: string; email: string }[]
  ) {
    const logs = recipients.map((r) => ({
      job_id: jobId,
      recipient_id: r.userId,
      recipient_email: r.email,
      status: 'pending',
    }));

    const { data, error } = await this.client
      .from('email_logs')
      .insert(logs)
      .select();
    return { data, error };
  }

  async getPendingEmailLogs(jobId: string, limit: number) {
    const { data, error } = await this.client
      .from('email_logs')
      .select('*')
      .eq('job_id', jobId)
      .eq('status', 'pending')
      .limit(limit);
    return { data, error };
  }

  async updateEmailLogSent(logId: string, resendId: string) {
    const { error } = await this.client
      .from('email_logs')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        resend_id: resendId,
      })
      .eq('id', logId);
    return { error };
  }

  async updateEmailLogFailed(logId: string, errorMessage: string) {
    const { error } = await this.client
      .from('email_logs')
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('id', logId);
    return { error };
  }

  async incrementJobSentCount(jobId: string) {
    const { data: job } = await this.getEmailJob(jobId);
    if (!job) return;

    await this.client
      .from('email_jobs')
      .update({ sent_count: job.sent_count + 1 })
      .eq('id', jobId);
  }

  async incrementJobFailedCount(jobId: string) {
    const { data: job } = await this.getEmailJob(jobId);
    if (!job) return;

    await this.client
      .from('email_jobs')
      .update({ failed_count: job.failed_count + 1 })
      .eq('id', jobId);
  }

  async getPendingLogCount(jobId: string) {
    const { count, error } = await this.client
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('status', 'pending');
    return { count, error };
  }
}
