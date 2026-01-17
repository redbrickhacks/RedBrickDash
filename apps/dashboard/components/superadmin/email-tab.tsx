import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { EmailJobForm } from './email-job-form';
import { EmailJobList } from './email-job-list';
import { EmailProgressPanel } from './email-progress-panel';
import { NeoButton, neoColors } from '../neo-ui';

interface EmailJob {
  id: string;
  template: string;
  subject: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  pending_count?: number;
  created_at: string;
  completed_at: string | null;
}

export function EmailTab() {
  const [jobs, setJobs] = useState<EmailJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<EmailJob | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/superadmin/email/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const fetchJobStatus = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/superadmin/email/jobs/${jobId}/status`);
      if (res.ok) {
        const data = await res.json();
        setActiveJob(data);
      }
    } catch (err) {
      console.error('Failed to fetch job status:', err);
    }
  }, []);

  const handleCreateJob = async (job: {
    template: string;
    subject: string;
    customBody?: string;
    targetStatus: number[];
  }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/superadmin/email/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });

      if (res.ok) {
        await fetchJobs();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to create job');
      }
    } catch (err) {
      console.error('Failed to create job:', err);
      alert('Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessJob = async (jobId: string) => {
    setProcessingJobId(jobId);
    await fetchJobStatus(jobId);
  };

  const handleProcessBatch = async () => {
    if (!activeJob) return;

    setProcessingJobId(activeJob.id);
    try {
      const res = await fetch(
        `/api/superadmin/email/jobs/${activeJob.id}/process`,
        { method: 'POST' }
      );

      if (res.ok) {
        await fetchJobStatus(activeJob.id);
        await fetchJobs();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to process batch');
      }
    } catch (err) {
      console.error('Failed to process batch:', err);
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleCloseProgress = () => {
    setActiveJob(null);
    setProcessingJobId(null);
  };

  if (isLoading) {
    return <LoadingText>Loading email jobs...</LoadingText>;
  }

  return (
    <Container>
      {activeJob ? (
        <EmailProgressPanel
          job={activeJob}
          onProcessBatch={handleProcessBatch}
          isProcessing={processingJobId !== null}
          onClose={handleCloseProgress}
        />
      ) : (
        <>
          <Section>
            <SectionHeader>
              <SectionTitle>Create Email Job</SectionTitle>
            </SectionHeader>
            <EmailJobForm
              onSubmit={handleCreateJob}
              isSubmitting={isSubmitting}
            />
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>Email Jobs</SectionTitle>
              <NeoButton variant="secondary" size="sm" onClick={fetchJobs}>
                Refresh
              </NeoButton>
            </SectionHeader>
            <EmailJobList
              jobs={jobs}
              onProcess={handleProcessJob}
              processingJobId={processingJobId}
            />
          </Section>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${neoColors.text};
  margin: 0;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-weight: 500;
`;
