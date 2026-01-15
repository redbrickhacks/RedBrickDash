import React from 'react';
import styled from 'styled-components';
import { neoColors, neoBorders, neoShadows } from '../neo-ui/theme';
import { FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa6';

interface SubmissionStatusBannerProps {
  submissionStatus: number;
  finalSubmittedAt: string | null;
  canSubmit: boolean;
}

const Banner = styled.div<{ $variant: 'success' | 'warning' | 'closed' }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: ${neoBorders.standard};
  box-shadow: ${({ $variant }) =>
    $variant === 'success'
      ? neoShadows.colored(neoColors.status.success)
      : $variant === 'warning'
      ? neoShadows.colored(neoColors.status.warning)
      : neoShadows.colored(neoColors.status.error)};
  background: ${neoColors.surface};

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  font-size: 1.5rem;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
`;

const Description = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${neoColors.textMuted};
`;

const Timestamp = styled.span`
  font-weight: 600;
  color: ${neoColors.text};
`;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

export function SubmissionStatusBanner({
  submissionStatus,
  finalSubmittedAt,
  canSubmit,
}: SubmissionStatusBannerProps) {
  // Submissions closed
  if (!canSubmit) {
    return (
      <Banner $variant="closed">
        <IconWrapper $color={neoColors.status.error}>
          <FaExclamationTriangle />
        </IconWrapper>
        <Content>
          <Title>Submissions Closed</Title>
          <Description>
            The submission deadline has passed. No further submissions are being
            accepted.
          </Description>
        </Content>
      </Banner>
    );
  }

  // Already submitted
  if (submissionStatus >= 2 && finalSubmittedAt) {
    return (
      <Banner $variant="success">
        <IconWrapper $color={neoColors.status.success}>
          <FaCheck />
        </IconWrapper>
        <Content>
          <Title>Submission Received</Title>
          <Description>
            Submitted on <Timestamp>{formatDate(finalSubmittedAt)}</Timestamp>.
            You can update your submission until the deadline.
          </Description>
        </Content>
      </Banner>
    );
  }

  // Not yet submitted
  return (
    <Banner $variant="warning">
      <IconWrapper $color={neoColors.status.warning}>
        <FaClock />
      </IconWrapper>
      <Content>
        <Title>Submission Pending</Title>
        <Description>
          Complete the form below and submit your project before the deadline.
        </Description>
      </Content>
    </Banner>
  );
}

export default SubmissionStatusBanner;
