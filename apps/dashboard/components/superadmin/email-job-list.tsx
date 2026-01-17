import React from 'react';
import styled from 'styled-components';
import { NeoBadge, NeoButton, neoColors, neoBorders } from '../neo-ui';

interface EmailJob {
  id: string;
  template: string;
  subject: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  completed_at: string | null;
}

const STATUS_VARIANT: Record<
  string,
  'info' | 'success' | 'warning' | 'error' | 'neutral'
> = {
  draft: 'neutral',
  queued: 'info',
  processing: 'warning',
  completed: 'success',
  failed: 'error',
  cancelled: 'neutral',
};

const TEMPLATE_LABELS: Record<string, string> = {
  finalist_selected: 'Finalist Selected',
  not_selected: 'Not Selected',
  rsvp_reminder: 'RSVP Reminder',
  custom: 'Custom',
};

interface EmailJobListProps {
  jobs: EmailJob[];
  onProcess: (jobId: string) => void;
  processingJobId: string | null;
}

export function EmailJobList({
  jobs,
  onProcess,
  processingJobId,
}: EmailJobListProps) {
  if (jobs.length === 0) {
    return <EmptyText>No email jobs yet.</EmptyText>;
  }

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <Th>Template</Th>
            <Th>Subject</Th>
            <Th>Status</Th>
            <Th>Progress</Th>
            <Th>Created</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <Td>{TEMPLATE_LABELS[job.template] || job.template}</Td>
              <Td>
                <SubjectCell title={job.subject}>{job.subject}</SubjectCell>
              </Td>
              <Td>
                <NeoBadge variant={STATUS_VARIANT[job.status] || 'neutral'}>
                  {job.status}
                </NeoBadge>
              </Td>
              <Td>
                <ProgressCell>
                  <span>
                    {job.sent_count}/{job.total_recipients}
                  </span>
                  {job.failed_count > 0 && (
                    <FailedCount>({job.failed_count} failed)</FailedCount>
                  )}
                </ProgressCell>
              </Td>
              <Td>{new Date(job.created_at).toLocaleDateString()}</Td>
              <Td>
                {(job.status === 'queued' || job.status === 'processing') && (
                  <NeoButton
                    variant="primary"
                    size="sm"
                    onClick={() => onProcess(job.id)}
                    loading={processingJobId === job.id}
                    disabled={processingJobId !== null}
                  >
                    Process
                  </NeoButton>
                )}
                {job.status === 'completed' && (
                  <CompletedText>Done</CompletedText>
                )}
                {job.status === 'failed' && <FailedText>Failed</FailedText>}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

const Container = styled.div`
  overflow-x: auto;
  border: ${neoBorders.thick};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${neoColors.surface};
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${neoColors.text};
  background: ${neoColors.background};
  border-bottom: ${neoBorders.thick};
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: ${neoColors.text};
  border-bottom: 1px solid #eee;
`;

const SubjectCell = styled.span`
  display: block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProgressCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FailedCount = styled.span`
  font-size: 0.75rem;
  color: ${neoColors.status.error};
`;

const CompletedText = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${neoColors.status.success};
`;

const FailedText = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${neoColors.status.error};
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-style: italic;
`;
