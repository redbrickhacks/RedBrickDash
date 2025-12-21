import { Text } from '@hibiscus/ui';
import { TeamServiceAPI } from '../../../common/api';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styled from 'styled-components';

const AcceptPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [teamName, setTeamName] = useState<string>('');

  useEffect(() => {
    const inviteId = router.query.inviteId as string;

    // Wait for router to be ready
    if (!router.isReady || !inviteId) return;

    TeamServiceAPI.acceptInvite(inviteId)
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setStatus('error');
          toast.error(error.message);
        } else {
          setStatus('success');
          setTeamName(data.teamName || 'your new team');
          toast.success('Successfully joined the team!');

          // Use reload to ensure fresh user context with updated teamId
          // Small delay to show success state
          setTimeout(() => {
            window.location.href = '/team';
          }, 1500);
        }
      })
      .catch((e) => {
        console.error(e);
        setStatus('error');
        toast.error(e.message || 'Failed to accept invite');
      });
  }, [router.isReady, router.query.inviteId]);

  return (
    <Container>
      {status === 'loading' && (
        <>
          <Spinner />
          <Text>Accepting invite...</Text>
        </>
      )}
      {status === 'success' && (
        <>
          <SuccessIcon>✓</SuccessIcon>
          <Text>Welcome to {teamName}!</Text>
          <SubText>Redirecting to your team page...</SubText>
        </>
      )}
      {status === 'error' && (
        <>
          <ErrorIcon>✕</ErrorIcon>
          <Text>Failed to accept invite</Text>
          <RetryLink href="/team">Go to Team Page</RetryLink>
        </>
      )}
    </Container>
  );
};

export default AcceptPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SuccessIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const ErrorIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const SubText = styled.span`
  color: #666;
  font-size: 0.875rem;
`;

const RetryLink = styled.a`
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
`;
