import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { useSubmission } from '../../hooks/use-submission/use-submission';
import { SoloConfirmationModal } from '../../components/submit/solo-confirmation-modal';
import { ProjectDetailsForm } from '../../components/submit/project-details-form';
import { SubmissionStatusBanner } from '../../components/submit/submission-status-banner';
import { SubmissionTallyEmbed } from '../../components/submit/submission-tally-embed';
import { SubmissionGuide } from '../../components/submit/submission-guide';
import { neoColors, neoBorders } from '../../components/neo-ui/theme';
import { ApplicationStatus } from '@hibiscus/types';
import { NeoButton } from '../../components/neo-ui/NeoButton';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1rem;
  color: ${neoColors.textMuted};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: ${neoColors.status.error};
`;

const ErrorMessage = styled.p`
  color: ${neoColors.textMuted};
  margin: 0;
  max-width: 400px;
`;

const DeadlineBanner = styled.div`
  background: ${neoColors.accent.yellow}40;
  border: ${neoBorders.standard};
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DeadlineTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${neoColors.text};
`;

const DeadlineSubtext = styled.div`
  font-size: 0.9rem;
  color: ${neoColors.textMuted};
`;

export function SubmitPage() {
  const { user } = useHibiscusUser();
  const router = useRouter();
  const {
    status,
    isLoading,
    isSaving,
    error,
    fetchStatus,
    saveProjectDetails,
    hasTeam,
    canSubmit,
    isFormComplete,
  } = useSubmission();

  const [showSoloModal, setShowSoloModal] = useState(false);

  // Loading state
  if (user === null || isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>Loading...</LoadingContainer>
      </PageContainer>
    );
  }

  // User must complete profile first
  if (user.applicationStatus === ApplicationStatus.NOT_APPLIED) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorTitle>Complete your profile first</ErrorTitle>
          <ErrorMessage>
            You need to register before you can submit a project.
          </ErrorMessage>
          <NeoButton variant="primary" onClick={() => router.push('/apply')}>
            Complete Profile
          </NeoButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Users past online round cannot submit
  if (
    user.applicationStatus === ApplicationStatus.FINALIST ||
    user.applicationStatus === ApplicationStatus.CONFIRMED ||
    user.applicationStatus === ApplicationStatus.DECLINED ||
    user.applicationStatus === ApplicationStatus.NOT_SELECTED
  ) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorTitle>Submissions Closed</ErrorTitle>
          <ErrorMessage>
            The online round has ended. Check your dashboard for updates.
          </ErrorMessage>
          <NeoButton variant="primary" onClick={() => router.push('/')}>
            Go to Dashboard
          </NeoButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Error loading submission status
  if (error && !status) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorTitle>Error Loading Submission</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
          <NeoButton variant="primary" onClick={fetchStatus}>
            Try Again
          </NeoButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // User has no team - prompt for solo submission
  if (!hasTeam) {
    return (
      <PageContainer>
        <PageTitle>Submit Project</PageTitle>
        <ErrorContainer>
          <ErrorTitle>No Team Found</ErrorTitle>
          <ErrorMessage>
            You are not part of a team. You can either join a team first, or
            submit as a solo participant.
          </ErrorMessage>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <NeoButton variant="secondary" onClick={() => router.push('/team')}>
              Go to Team Page
            </NeoButton>
            <NeoButton variant="primary" onClick={() => setShowSoloModal(true)}>
              Submit Solo
            </NeoButton>
          </div>
        </ErrorContainer>

        <SoloConfirmationModal
          isOpen={showSoloModal}
          onClose={() => setShowSoloModal(false)}
          onConfirm={() => {
            setShowSoloModal(false);
            fetchStatus();
          }}
          userId={user.id}
        />
      </PageContainer>
    );
  }

  // User has team - show submission flow
  const team = status?.team;

  return (
    <PageContainer>
      <PageTitle>Submit Project</PageTitle>

      <DeadlineBanner>
        <DeadlineTitle>Deadline: January 16, 2026, 11:59 PM IST</DeadlineTitle>
        <DeadlineSubtext>
          Submit now, perfect later. You can update everything until the
          deadline.
        </DeadlineSubtext>
      </DeadlineBanner>

      <SubmissionGuide />

      <SubmissionStatusBanner
        submissionStatus={team?.submissionStatus ?? 1}
        finalSubmittedAt={team?.finalSubmittedAt ?? null}
        canSubmit={canSubmit}
      />

      <ProjectDetailsForm
        team={team!}
        onSave={saveProjectDetails}
        isSaving={isSaving}
        disabled={!canSubmit}
      />

      <SubmissionTallyEmbed
        teamId={team?.teamId ?? ''}
        userId={user.id}
        isUnlocked={isFormComplete && canSubmit}
        isHardware={team?.isHardware ?? false}
      />
    </PageContainer>
  );
}

export default SubmitPage;
