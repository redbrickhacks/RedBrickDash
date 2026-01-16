-- Migration: 20260118000001_create_email_system.sql
-- Create email_jobs and email_logs tables for batched email sending
--
-- Design decisions:
-- 1. ON DELETE SET NULL for user FKs to preserve audit trail
-- 2. target_status as INTEGER[] for flexibility (validated at app layer against application_status.id)
-- 3. Composite index on (job_id, status) for efficient batch processing
-- 4. Partial index on pending logs for common query pattern

-- Email Jobs Table
-- Stores email job definitions, targeting criteria, and execution progress
CREATE TABLE IF NOT EXISTS email_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,

    -- Job definition
    template VARCHAR(50) NOT NULL CHECK (template IN ('finalist_selected', 'not_selected', 'rsvp_reminder', 'custom')),
    subject VARCHAR(255) NOT NULL,
    custom_body TEXT,

    -- Target audience: array of application_status IDs (1-6)
    -- Validated at application layer against application_status table
    target_status INTEGER[] NOT NULL,

    -- Execution state machine: draft -> queued -> processing -> completed/failed
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'processing', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Progress tracking with non-negative constraints
    total_recipients INTEGER NOT NULL DEFAULT 0 CHECK (total_recipients >= 0),
    sent_count INTEGER NOT NULL DEFAULT 0 CHECK (sent_count >= 0),
    failed_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
    error_message TEXT
);

COMMENT ON TABLE email_jobs IS 'Stores batched email job definitions and execution progress for superadmin bulk emails';
COMMENT ON COLUMN email_jobs.target_status IS 'Array of application_status IDs to target (1=NOT_APPLIED, 2=REGISTERED, 3=FINALIST, 4=CONFIRMED, 5=DECLINED, 6=NOT_SELECTED)';

-- Email Logs Table
-- Individual email send records for audit trail and retry handling
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES email_jobs(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,

    -- Resend API response metadata
    resend_id VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE email_logs IS 'Individual email send records for audit trail. Preserved even if recipient user is deleted.';

-- Indexes for common query patterns

-- Job listing sorted by creation time
CREATE INDEX IF NOT EXISTS idx_email_jobs_created_at ON email_jobs(created_at DESC);

-- Find jobs by status (for processing queue)
CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON email_jobs(status);

-- Composite index for batch processing: "get pending logs for job X"
CREATE INDEX IF NOT EXISTS idx_email_logs_job_status ON email_logs(job_id, status);

-- Partial index for the most common query during processing
CREATE INDEX IF NOT EXISTS idx_email_logs_pending ON email_logs(job_id)
    WHERE status = 'pending';

-- Lookup logs by recipient for admin queries
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_id)
    WHERE recipient_id IS NOT NULL;

-- Enable RLS
ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access (superadmin uses service key)
CREATE POLICY "Service role full access on email_jobs" ON email_jobs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on email_logs" ON email_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Admins (role=1) can view jobs for transparency
CREATE POLICY "Admins can view email_jobs" ON email_jobs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 1
        )
    );

CREATE POLICY "Admins can view email_logs" ON email_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 1
        )
    );
