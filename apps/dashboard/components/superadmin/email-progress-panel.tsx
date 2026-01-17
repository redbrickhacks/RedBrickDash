import React from 'react';
import styled from 'styled-components';
import { NeoButton, neoColors, neoBorders, neoShadows } from '../neo-ui';

interface EmailJob {
  id: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  pending_count: number;
}

interface EmailProgressPanelProps {
  job: EmailJob;
  onProcessBatch: () => Promise<void>;
  isProcessing: boolean;
  onClose: () => void;
}

export function EmailProgressPanel({
  job,
  onProcessBatch,
  isProcessing,
  onClose,
}: EmailProgressPanelProps) {
  const progressPercent =
    job.total_recipients > 0
      ? Math.round(
          ((job.sent_count + job.failed_count) / job.total_recipients) * 100
        )
      : 0;

  const isComplete = job.status === 'completed';
  const isFailed = job.status === 'failed';

  return (
    <Container>
      <Header>
        <Title>
          {isComplete
            ? 'Job Complete'
            : isFailed
            ? 'Job Failed'
            : 'Processing Job'}
        </Title>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </Header>

      <Content>
        <ProgressBarContainer>
          <ProgressBar $percent={progressPercent} $failed={isFailed} />
        </ProgressBarContainer>
        <ProgressLabel>{progressPercent}%</ProgressLabel>

        <StatsGrid>
          <StatItem>
            <StatValue>{job.total_recipients}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue $color={neoColors.status.success}>
              {job.sent_count}
            </StatValue>
            <StatLabel>Sent</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue $color={neoColors.status.error}>
              {job.failed_count}
            </StatValue>
            <StatLabel>Failed</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{job.pending_count}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatItem>
        </StatsGrid>

        {!isComplete && !isFailed && (
          <ButtonRow>
            <NeoButton
              variant="primary"
              onClick={onProcessBatch}
              loading={isProcessing}
            >
              Process Next Batch
            </NeoButton>
          </ButtonRow>
        )}

        {isComplete && (
          <SuccessMessage>
            All emails have been processed successfully.
          </SuccessMessage>
        )}

        {isFailed && (
          <ErrorMessage>Job failed. Check logs for details.</ErrorMessage>
        )}
      </Content>
    </Container>
  );
}

const Container = styled.div`
  background: ${neoColors.surface};
  border: ${neoBorders.thick};
  box-shadow: ${neoShadows.medium};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: ${neoBorders.standard};
  background: ${neoColors.accent.yellow};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${neoColors.text};
`;

const CloseButton = styled.button`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${neoColors.text};
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Content = styled.div`
  padding: 1.25rem;
`;

const ProgressBarContainer = styled.div`
  height: 24px;
  background: ${neoColors.background};
  border: ${neoBorders.standard};
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $percent: number; $failed: boolean }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $failed }) =>
    $failed ? neoColors.status.error : neoColors.accent.green};
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.div`
  text-align: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: ${neoColors.text};
  margin-top: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1.25rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div<{ $color?: string }>`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ $color }) => $color || neoColors.text};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${neoColors.textMuted};
  text-transform: uppercase;
`;

const ButtonRow = styled.div`
  margin-top: 1.25rem;
  text-align: center;
`;

const SuccessMessage = styled.p`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e8f5e9;
  border: 2px solid ${neoColors.status.success};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${neoColors.status.success};
  text-align: center;
`;

const ErrorMessage = styled.p`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #ffebee;
  border: 2px solid ${neoColors.status.error};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${neoColors.status.error};
  text-align: center;
`;
