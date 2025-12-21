import { H2, H3, Modal, Text } from '@hibiscus/ui';
import { useState, useEffect } from 'react';
import { Button } from '@hibiscus/ui-kit-2023';
import { RiTeamFill } from 'react-icons/ri';
import { FaEnvelope, FaCheck, FaXmark } from 'react-icons/fa6';
import styled from 'styled-components';
import TeamCreateForm from './team-create-form';
import { TeamServiceAPI } from '../../common/api';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { Colors2023 } from '@hibiscus/styles';

interface PendingInvite {
  id: string;
  created_at: string;
  teams: {
    team_id: string;
    name: string;
    description: string;
  };
  user_profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

function NoTeamPlaceholder() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(
    null
  );
  const { user } = useHibiscusUser();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;

    TeamServiceAPI.getPendingInvitesForUser(user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch pending invites:', error.message);
        } else {
          setPendingInvites(data.invites || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const handleAcceptInvite = async (inviteId: string) => {
    setProcessingInviteId(inviteId);
    const { error } = await TeamServiceAPI.acceptInvite(inviteId);
    if (error) {
      toast.error(error.message);
      setProcessingInviteId(null);
    } else {
      toast.success('Successfully joined the team!');
      router.reload();
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    setProcessingInviteId(inviteId);
    const { error } = await TeamServiceAPI.rejectInvite(inviteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Invite declined');
      setPendingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    }
    setProcessingInviteId(null);
  };

  return (
    <Container>
      <MainSection>
        <H2>You&apos;re not part of any team yet!</H2>
        <Text style={{ color: Colors2023.GRAY.MEDIUM, marginBottom: '1rem' }}>
          Create a team to collaborate with others, or join an existing team via
          invite.
        </Text>
        <Button color="black" onClick={openModal}>
          <RiTeamFill /> Create a team
        </Button>
        <Modal isOpen={isOpen} closeModal={closeModal}>
          <TeamCreateForm closeModal={closeModal} />
        </Modal>
      </MainSection>

      {!isLoading && pendingInvites.length > 0 && (
        <InvitesSection>
          <InvitesHeader>
            <FaEnvelope />
            <H3>Pending Invites</H3>
          </InvitesHeader>
          <InvitesList>
            {pendingInvites.map((invite) => (
              <InviteCard key={invite.id}>
                <InviteInfo>
                  <TeamName>{invite.teams?.name || 'Unknown Team'}</TeamName>
                  <InviterInfo>
                    Invited by {invite.user_profiles?.first_name}{' '}
                    {invite.user_profiles?.last_name}
                  </InviterInfo>
                </InviteInfo>
                <InviteActions>
                  <Button
                    color="blue"
                    onClick={() => handleAcceptInvite(invite.id)}
                    disabled={processingInviteId === invite.id}
                  >
                    <FaCheck /> Accept
                  </Button>
                  <Button
                    color="red"
                    onClick={() => handleRejectInvite(invite.id)}
                    disabled={processingInviteId === invite.id}
                  >
                    <FaXmark /> Decline
                  </Button>
                </InviteActions>
              </InviteCard>
            ))}
          </InvitesList>
        </InvitesSection>
      )}
    </Container>
  );
}

export default NoTeamPlaceholder;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InvitesSection = styled.div`
  background: #f8f9fa;
  border: 1px solid ${Colors2023.GRAY.LIGHT};
  border-radius: 8px;
  padding: 1.5rem;
`;

const InvitesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  svg {
    color: ${Colors2023.BLUE.STANDARD};
  }
`;

const InvitesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InviteCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid ${Colors2023.GRAY.LIGHT};
  border-radius: 6px;
  padding: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const InviteInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TeamName = styled.span`
  font-weight: 600;
  font-size: 1rem;
`;

const InviterInfo = styled.span`
  color: ${Colors2023.GRAY.MEDIUM};
  font-size: 0.875rem;
`;

const InviteActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;
