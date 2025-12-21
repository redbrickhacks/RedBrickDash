import { useState, useEffect } from 'react';
import { RiTeamFill } from 'react-icons/ri';
import { FaEnvelope, FaCheck, FaXmark } from 'react-icons/fa6';
import styled from 'styled-components';
import TeamCreateForm from './team-create-form';
import { TeamServiceAPI } from '../../common/api';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { NeoButton, NeoCard, NeoModal, neoColors } from '../neo-ui';

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
        <Title>You&apos;re not part of any team yet!</Title>
        <Subtitle>
          Create a team to collaborate with others, or join an existing team via
          invite.
        </Subtitle>
        <NeoButton onClick={openModal}>
          <RiTeamFill /> Create a team
        </NeoButton>
        <NeoModal isOpen={isOpen} onClose={closeModal} title="Create your team">
          <TeamCreateForm closeModal={closeModal} />
        </NeoModal>
      </MainSection>

      {!isLoading && pendingInvites.length > 0 && (
        <InvitesCard accent={neoColors.accent.blue}>
          <InvitesHeader>
            <FaEnvelope />
            <InvitesTitle>Pending Invites</InvitesTitle>
          </InvitesHeader>
          <InvitesList>
            {pendingInvites.map((invite) => (
              <InviteItem key={invite.id}>
                <InviteInfo>
                  <TeamName>{invite.teams?.name || 'Unknown Team'}</TeamName>
                  <InviterInfo>
                    Invited by {invite.user_profiles?.first_name}{' '}
                    {invite.user_profiles?.last_name}
                  </InviterInfo>
                </InviteInfo>
                <InviteActions>
                  <NeoButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptInvite(invite.id)}
                    disabled={processingInviteId === invite.id}
                  >
                    <FaCheck /> Accept
                  </NeoButton>
                  <NeoButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectInvite(invite.id)}
                    disabled={processingInviteId === invite.id}
                  >
                    <FaXmark /> Decline
                  </NeoButton>
                </InviteActions>
              </InviteItem>
            ))}
          </InvitesList>
        </InvitesCard>
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
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${neoColors.text};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${neoColors.textMuted};
  line-height: 1.5;
`;

const InvitesCard = styled(NeoCard)``;

const InvitesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  svg {
    color: ${neoColors.accent.blue};
    font-size: 1.25rem;
  }
`;

const InvitesTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const InvitesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InviteItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 2px solid #000;
  background: ${neoColors.background};

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
  color: ${neoColors.textMuted};
  font-size: 0.875rem;
`;

const InviteActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;
