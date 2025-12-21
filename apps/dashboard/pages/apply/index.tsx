import React, { useEffect } from 'react';
import 'nprogress/nprogress.css';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { HackformTally } from '../../components/hackform-tally/hackform-tally';
import { useRouter } from 'next/router';
import { getEnv } from '@hibiscus/env';
import { ParsedUrlQuery } from 'querystring';
import { ApplicationStatus } from '@hibiscus/types';
import Link from 'next/link';
import { FaCheck } from 'react-icons/fa6';

function isQueryComplete(query: ParsedUrlQuery): boolean {
  return (
    'hibiscusUserId' in query &&
    'hibiscusUserNameFirst' in query &&
    'hibiscusUserNameLast' in query &&
    'hibiscusUserEmail' in query
  );
}

interface ServerSideProps {
  appsOpen: boolean;
}

export function Index({ appsOpen }: ServerSideProps) {
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

  if (user.applicationStatus !== ApplicationStatus.NOT_APPLIED) {
    return (
      <Container>
        <CompletedCard>
          <IconWrapper>
            <FaCheck />
          </IconWrapper>
          <CardContent>
            <CardTitle>You have filled your details</CardTitle>
            <CardDescription>
              Your profile is complete. You can view your dashboard to check
              your status and next steps.
            </CardDescription>
          </CardContent>
          <Link href="/" passHref legacyBehavior>
            <HomeButton>Go to Dashboard</HomeButton>
          </Link>
        </CompletedCard>
      </Container>
    );
  }

  if (!appsOpen) {
    return (
      <Container>
        <CenterContainer>
          <Heading>Registration has closed!</Heading>
          <Link href="/" passHref legacyBehavior>
            <RedButton>Go back to home</RedButton>
          </Link>
        </CenterContainer>
      </Container>
    );
  }

  // Build Tally URL with hibiscusUserId for webhook identification
  const baseTallyUrl = getEnv().Hibiscus.Hackform.TallyApps2024Url;
  const tallyUrlWithUserId = `${baseTallyUrl}${
    baseTallyUrl.includes('?') ? '&' : '?'
  }hibiscusUserId=${user.id}`;

  return <HackformTally tallyUrl={tallyUrlWithUserId} />;
}

export default Index;

const Container = styled.div`
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #fffdf7;
`;

const CompletedCard = styled.div`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 6px 6px 0 #22c55e;
  padding: 2rem;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #22c55e;
  border: 2px solid #000;
  color: #fff;
  font-size: 1.75rem;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
`;

const CardDescription = styled.p`
  margin: 0;
  color: #555;
  line-height: 1.5;
`;

const HomeButton = styled.a`
  background: #22c55e;
  color: #fff;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 #000;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
  }

  &:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }
`;

const CenterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Heading = styled.h3`
  color: #ff6347;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const RedButton = styled.a`
  background: #ff5c5c;
  color: #fff;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 #000;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
  }

  &:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }
`;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const appsOpen = process.env.APPS_OPEN === 'true';
  return {
    props: {
      appsOpen,
    } as ServerSideProps,
  };
};
