import React, { useEffect } from 'react';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { H3, Link } from '@hibiscus/ui';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { HackformTally } from '../../components/hackform-tally/hackform-tally';
import { useRouter } from 'next/router';
import { getEnv } from '@hibiscus/env';
import { ParsedUrlQuery } from 'querystring';
import { ApplicationStatus } from '@hibiscus/types';

function isQueryComplete(query: ParsedUrlQuery): boolean {
  return (
    'hibiscusUserId' in query &&
    'hibiscusUserNameFirst' in query &&
    'hibiscusUserNameLast' in query &&
    'hibiscusUserEmail' in query
  );
}

interface ServerSideProps {
  submissionsOpen: boolean;
  tallyFormUrl: string | null;
}

export function SubmitPage({ submissionsOpen, tallyFormUrl }: ServerSideProps) {
  const { user } = useHibiscusUser();
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && user !== null && !isQueryComplete(router.query)) {
      router.replace({
        query: {
          ...router.query,
          hibiscusUserId: user?.id,
          hibiscusUserNameFirst: user?.firstName,
          hibiscusUserNameLast: user?.lastName,
          hibiscusUserEmail: user?.email,
        },
      });
    }
  }, [router, user]);

  if (user === null || !isQueryComplete(router.query)) {
    return (
      <Container>
        <CenterContainer>
          <Heading>Loading...</Heading>
        </CenterContainer>
      </Container>
    );
  }

  if (router.query.hibiscusUserId !== user.id) {
    return (
      <Container>
        <CenterContainer>
          <Heading>Invalid user ID provided!</Heading>
        </CenterContainer>
      </Container>
    );
  }

  // Only REGISTERED users can submit
  if (user.applicationStatus === ApplicationStatus.NOT_APPLIED) {
    return (
      <Container>
        <CenterContainer>
          <Heading>Complete your profile first!</Heading>
          <SubText>
            You need to register before you can submit a project.
          </SubText>
          <Link
            href={'/apply'}
            passHref
            anchortagpropsoverride={{ target: '_self' }}
          >
            <ActionButton>Complete Profile</ActionButton>
          </Link>
        </CenterContainer>
      </Container>
    );
  }

  // Users past the online round can't submit
  if (
    user.applicationStatus === ApplicationStatus.FINALIST ||
    user.applicationStatus === ApplicationStatus.CONFIRMED ||
    user.applicationStatus === ApplicationStatus.DECLINED ||
    user.applicationStatus === ApplicationStatus.NOT_SELECTED
  ) {
    return (
      <Container>
        <CenterContainer>
          <Heading>Submissions are closed</Heading>
          <SubText>
            The online round has ended. Check your dashboard for updates.
          </SubText>
          <Link
            href={'/'}
            passHref
            anchortagpropsoverride={{ target: '_self' }}
          >
            <ActionButton>Go to Dashboard</ActionButton>
          </Link>
        </CenterContainer>
      </Container>
    );
  }

  // Submissions not open yet (no Tally form URL configured)
  if (!submissionsOpen || !tallyFormUrl) {
    return (
      <Container>
        <CenterContainer>
          <Heading>Submissions Opening Soon</Heading>
          <SubText>
            The submission form is being prepared. Check back soon or join our
            Discord for announcements.
          </SubText>
          <Link
            href={'/'}
            passHref
            anchortagpropsoverride={{ target: '_self' }}
          >
            <ActionButton>Go to Dashboard</ActionButton>
          </Link>
        </CenterContainer>
      </Container>
    );
  }

  // Build Tally URL with hibiscusUserId for webhook identification
  const tallyUrlWithUserId = `${tallyFormUrl}${
    tallyFormUrl.includes('?') ? '&' : '?'
  }hibiscusUserId=${user.id}`;

  return <HackformTally tallyUrl={tallyUrlWithUserId} />;
}

export default SubmitPage;

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CenterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Heading = styled(H3)`
  color: #ff6347;
`;

const SubText = styled.p`
  color: #666;
  text-align: center;
  max-width: 400px;
`;

const ActionButton = styled.button`
  padding: 12px 40px;
  border-radius: 8px;
  border: 3px solid black;
  background: #ffb1a3;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  color: black;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    background: #ff6347;
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px black;
  }

  &:active {
    transform: translate(0, 0);
    box-shadow: none;
  }
`;

export const getServerSideProps: GetServerSideProps = async () => {
  const tallyFormUrl =
    process.env.NEXT_PUBLIC_TALLY_SUBMISSION_FORM_URL || null;
  const submissionsOpen = !!tallyFormUrl;

  return {
    props: {
      submissionsOpen,
      tallyFormUrl,
    } as ServerSideProps,
  };
};
