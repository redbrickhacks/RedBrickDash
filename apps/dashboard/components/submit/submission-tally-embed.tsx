import React, { useEffect } from 'react';
import Script from 'next/script';
import styled from 'styled-components';
import { NeoCard } from '../neo-ui/NeoCard';
import { neoColors, neoBorders } from '../neo-ui/theme';
import { getEnv } from '@hibiscus/env';

interface SubmissionTallyEmbedProps {
  teamId: string;
  isUnlocked: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const LockedOverlay = styled.div`
  background: ${neoColors.background};
  border: ${neoBorders.standard};
  border-style: dashed;
  padding: 2rem;
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const LockedTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${neoColors.textMuted};
`;

const LockedDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${neoColors.textMuted};
`;

const TallyContainer = styled.div`
  width: 100%;
  min-height: 500px;
  height: calc(100vh - 400px);
  max-height: 700px;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};

  @media (max-width: 768px) {
    height: calc(100vh - 350px);
    min-height: 400px;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const HelpText = styled.p`
  font-size: 0.8rem;
  color: ${neoColors.textMuted};
  margin: 0;
  text-align: center;
`;

export function SubmissionTallyEmbed({
  teamId,
  isUnlocked,
}: SubmissionTallyEmbedProps) {
  useEffect(() => {
    if (isUnlocked) {
      try {
        // @ts-expect-error Tally is loaded in the linked script
        Tally?.loadEmbeds();
      } catch {
        // Tally script not yet loaded
      }
    }
  }, [isUnlocked]);

  // Build Tally URL with teamId for webhook identification
  const baseTallyUrl = getEnv().Hibiscus.Submission?.TallyProjectFormUrl || '';
  const tallyUrlWithTeamId = baseTallyUrl
    ? `${baseTallyUrl}${
        baseTallyUrl.includes('?') ? '&' : '?'
      }hibiscusTeamId=${teamId}`
    : '';

  return (
    <NeoCard>
      <Container>
        <Header>
          <Title>Final Submission</Title>
        </Header>

        {!isUnlocked ? (
          <LockedOverlay>
            <LockedTitle>Complete Project Details First</LockedTitle>
            <LockedDescription>
              Fill in your project title and select a track above to unlock the
              final submission form.
            </LockedDescription>
          </LockedOverlay>
        ) : !tallyUrlWithTeamId ? (
          <LockedOverlay>
            <LockedTitle>Submission Form Not Configured</LockedTitle>
            <LockedDescription>
              The submission form is not yet available. Please check back later.
            </LockedDescription>
          </LockedOverlay>
        ) : (
          <>
            <TallyContainer>
              <iframe
                data-tally-src={tallyUrlWithTeamId}
                loading="lazy"
                width="100%"
                height="100%"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Project Submission Form"
              />
            </TallyContainer>

            <HelpText>
              Submit your PDF report, demo video (90 seconds max), and GitHub
              repository link.
            </HelpText>

            <Script
              id="tally-js"
              src="https://tally.so/widgets/embed.js"
              onLoad={() => {
                // @ts-expect-error Tally is loaded in the linked script
                Tally?.loadEmbeds();
              }}
            />
          </>
        )}
      </Container>
    </NeoCard>
  );
}

export default SubmissionTallyEmbed;
