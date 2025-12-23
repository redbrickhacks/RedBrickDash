import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { AiFillCrown, AiFillPlusCircle } from 'react-icons/ai';
import { FaRightFromBracket, FaTrash, FaStamp } from 'react-icons/fa6';
import { Invite, TeamMember } from '../../common/types';
import { toast } from 'react-hot-toast';
import { useTeam } from '../../hooks/use-team/use-team';
import { TeamServiceAPI } from '../../common/api';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { useRouter } from 'next/router';
import {
  NeoButton,
  NeoCard,
  NeoModal,
  NeoConfirmDialog,
  NeoInput,
  NeoBadge,
  neoColors,
} from '../neo-ui';
import { StampTable, StampPicker, Stamp } from '../stamps';

type ConfirmAction = {
  type: 'kick' | 'remove-invite' | 'leave' | 'disband';
  target?: TeamMember | Invite;
  message: string;
};

function TeamMembersWidget() {
  const { user, updateUser } = useHibiscusUser();
  const { team, updateTeam, removeMember } = useTeam();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailInvitee, setEmailInvitee] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Stamps state
  const [memberStamps, setMemberStamps] = useState<Record<string, Stamp[]>>({});
  const [stampPickerOpen, setStampPickerOpen] = useState(false);
  const [stampRecipient, setStampRecipient] = useState<TeamMember | null>(null);

  const isUserOrganizer = team.organizerId === user?.id;
  const memberCount = team.members?.length || 0;
  const maxMembers = 4;

  // Fetch stamps for all team members
  const fetchMemberStamps = useCallback(async () => {
    if (!team.members?.length) return;

    const stampsMap: Record<string, Stamp[]> = {};
    await Promise.all(
      team.members.map(async (member) => {
        try {
          const res = await fetch(`/api/stamps/user/${member.user_id}`);
          if (res.ok) {
            stampsMap[member.user_id] = await res.json();
          }
        } catch (e) {
          console.error(`Failed to fetch stamps for ${member.user_id}:`, e);
        }
      })
    );
    setMemberStamps(stampsMap);
  }, [team.members]);

  useEffect(() => {
    fetchMemberStamps();
  }, [fetchMemberStamps]);

  const handleGiveStampClick = (member: TeamMember) => {
    setStampRecipient(member);
    setStampPickerOpen(true);
  };

  const handleGiveStamp = async (
    stampTypeId: number,
    replaceSlotPosition?: number
  ) => {
    if (!stampRecipient) return;

    const isSwap = replaceSlotPosition !== undefined;
    const endpoint = isSwap ? '/api/stamps/swap' : '/api/stamps/give';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId: stampRecipient.user_id,
        stampTypeId,
        ...(isSwap && { replaceSlotPosition }),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to give stamp');
    }

    toast.success(
      isSwap
        ? `Stamp replaced for ${stampRecipient.first_name}!`
        : `Stamp given to ${stampRecipient.first_name}!`
    );
    // Refresh stamps
    fetchMemberStamps();
  };

  const handleDeleteStamp = async (stampId: string) => {
    const res = await fetch('/api/stamps/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stampId }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message || 'Failed to remove stamp');
      return;
    }

    toast.success('Stamp removed');
    fetchMemberStamps();
  };

  const showConfirmDialog = (action: ConfirmAction) => {
    setConfirmAction(action);
  };

  const closeConfirmDialog = () => {
    setConfirmAction(null);
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    setIsProcessing(true);
    try {
      switch (confirmAction.type) {
        case 'kick': {
          const member = confirmAction.target as TeamMember;
          const { error } = await TeamServiceAPI.kickUser(member.user_id);
          if (error) {
            toast.error('Failed to remove member: ' + error.message);
          } else {
            toast.success(
              `Removed ${member.first_name} ${member.last_name} from the team`
            );
            removeMember(member.user_id);
          }
          break;
        }
        case 'remove-invite': {
          const invite = confirmAction.target as Invite;
          const { error } = await TeamServiceAPI.removeInvite(invite.id);
          if (error) {
            toast.error('Failed to cancel invite: ' + error.message);
          } else {
            toast.success(
              `Cancelled invite for ${invite.user_profiles.first_name} ${invite.user_profiles.last_name}`
            );
            updateTeam({
              invites: team.invites.filter((i) => i.id !== invite.id),
            });
          }
          break;
        }
        case 'leave': {
          const { error } = await TeamServiceAPI.leaveTeam(user.id);
          if (error) {
            toast.error('Failed to leave team: ' + error.message);
          } else {
            toast.success('You have left the team');
            updateUser({ teamId: null });
            router.reload();
          }
          break;
        }
        case 'disband': {
          const { error } = await TeamServiceAPI.disbandTeam(team.id, user.id);
          if (error) {
            toast.error('Failed to disband team: ' + error.message);
          } else {
            toast.success('Team has been disbanded');
            updateUser({ teamId: null });
            router.reload();
          }
          break;
        }
      }
    } catch (e) {
      toast.error('An unexpected error occurred');
      console.error(e);
    } finally {
      setIsProcessing(false);
      closeConfirmDialog();
    }
  };

  const handleKickClick = (member: TeamMember) => {
    showConfirmDialog({
      type: 'kick',
      target: member,
      message: `Are you sure you want to remove ${member.first_name} ${member.last_name} from the team?`,
    });
  };

  const handleRemoveInviteClick = (invite: Invite) => {
    showConfirmDialog({
      type: 'remove-invite',
      target: invite,
      message: `Cancel the invite for ${invite.user_profiles.first_name} ${invite.user_profiles.last_name}?`,
    });
  };

  const handleLeaveClick = () => {
    showConfirmDialog({
      type: 'leave',
      message:
        'Are you sure you want to leave this team? You will need a new invite to rejoin.',
    });
  };

  const handleDisbandClick = () => {
    showConfirmDialog({
      type: 'disband',
      message:
        'Are you sure you want to disband this team? This will remove all members and cannot be undone.',
    });
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInvitee.trim()) {
      setEmailError('This field is required');
      return;
    }
    if (!emailRegex.test(emailInvitee)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');

    setIsSubmitting(true);
    try {
      const { data, error } = await TeamServiceAPI.teamInviteUser(
        user.id,
        emailInvitee
      );
      if (error) {
        toast.error(error.message, { duration: 5000 });
      } else {
        if (data.emailFailed) {
          toast(
            (t) => (
              <div>
                <p>
                  <strong>Invite created!</strong> Email notification failed.
                </p>
                <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
                  Share this link manually:
                </p>
                <input
                  type="text"
                  value={data.acceptLink}
                  readOnly
                  onClick={(e) => {
                    (e.target as HTMLInputElement).select();
                    navigator.clipboard.writeText(data.acceptLink);
                    toast.success('Link copied!', { duration: 2000 });
                  }}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    marginTop: '4px',
                    fontSize: '0.85em',
                    cursor: 'pointer',
                  }}
                />
              </div>
            ),
            { duration: 10000 }
          );
        } else {
          toast.success('Invite email sent!', { duration: 5000 });
        }
        updateTeam({
          invites: [
            ...team.invites,
            {
              id: data.inviteId, // Use inviteId, not invitee.id (user ID)
              created_at: data.createdAt,
              user_profiles: {
                first_name: data.invitee.firstName,
                last_name: data.invitee.lastName,
                email: data.invitee.email,
              },
            },
          ],
        });
      }
    } catch (e) {
      toast.error('Failed to send invite. Please try again.');
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setInviteModalOpen(false);
      setEmailInvitee('');
    }
  };

  const SentInvites = () => {
    if (!team.invites?.length) return null;

    return (
      <div>
        {team.invites.map((item, i) => (
          <ListItemContainer key={i}>
            <LeftItemContainer>
              <MemberName $muted>
                {item.user_profiles.first_name} {item.user_profiles.last_name}
              </MemberName>
            </LeftItemContainer>
            <ItemButtonsContainer>
              <NeoBadge variant="warning">Pending</NeoBadge>
              {isUserOrganizer && (
                <NeoButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveInviteClick(item)}
                >
                  Cancel
                </NeoButton>
              )}
            </ItemButtonsContainer>
          </ListItemContainer>
        ))}
      </div>
    );
  };

  const Members = () => (
    <>
      {team.members?.map((item, i) => (
        <MemberCard key={i}>
          <MemberHeader>
            <LeftItemContainer>
              <MemberName>
                {item.first_name} {item.last_name}
              </MemberName>
              {team.organizerId === item.user_id && (
                <CrownIcon title="Team Organizer">
                  <AiFillCrown />
                </CrownIcon>
              )}
            </LeftItemContainer>
            <ItemButtonsContainer>
              {item.user_id !== user?.id && (
                <NeoButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGiveStampClick(item)}
                  title={`Send ${item.first_name} a stamp`}
                >
                  <FaStamp />
                </NeoButton>
              )}
              {isUserOrganizer && item.user_id !== user.id && (
                <NeoButton
                  variant="danger"
                  size="sm"
                  onClick={() => handleKickClick(item)}
                >
                  Remove
                </NeoButton>
              )}
            </ItemButtonsContainer>
          </MemberHeader>
          <StampTableContainer>
            <StampTable
              stamps={memberStamps[item.user_id] || []}
              ownerName={item.first_name}
              showEmptyHint={item.user_id !== user?.id}
              isOwnCollection={item.user_id === user?.id}
              onDeleteStamp={
                item.user_id === user?.id ? handleDeleteStamp : undefined
              }
            />
          </StampTableContainer>
        </MemberCard>
      ))}
    </>
  );

  return (
    <Container>
      {/* Stamp Picker Modal */}
      <StampPicker
        isOpen={stampPickerOpen}
        onClose={() => {
          setStampPickerOpen(false);
          setStampRecipient(null);
        }}
        onGiveStamp={handleGiveStamp}
        recipientName={
          stampRecipient
            ? `${stampRecipient.first_name} ${stampRecipient.last_name}`
            : ''
        }
        recipientStamps={
          stampRecipient ? memberStamps[stampRecipient.user_id] || [] : []
        }
        currentUserId={user?.id}
      />

      {/* Invite Modal */}
      <NeoModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <InviteForm onSubmit={handleInviteSubmit}>
          <NeoInput
            label="Email"
            type="email"
            placeholder="teammate@example.com"
            value={emailInvitee}
            onChange={(e) =>
              setEmailInvitee((e.target as HTMLInputElement).value)
            }
            error={emailError}
            disabled={isSubmitting}
            required
          />
          <NeoButton type="submit" loading={isSubmitting}>
            Send Invite
          </NeoButton>
        </InviteForm>
      </NeoModal>

      {/* Confirmation Dialog */}
      <NeoConfirmDialog
        isOpen={!!confirmAction}
        onConfirm={executeConfirmedAction}
        onCancel={closeConfirmDialog}
        title="Confirm Action"
        message={confirmAction?.message || ''}
        confirmText={isProcessing ? 'Processing...' : 'Confirm'}
        isLoading={isProcessing}
        variant="danger"
      />

      {/* Header with member count */}
      <TopContainer>
        <HeaderLeft>
          <SectionTitle>Members</SectionTitle>
          <MemberCount>
            {memberCount}/{maxMembers}
          </MemberCount>
        </HeaderLeft>
        {isUserOrganizer && memberCount < maxMembers && (
          <NeoButton size="sm" onClick={() => setInviteModalOpen(true)}>
            <AiFillPlusCircle /> Add Member
          </NeoButton>
        )}
      </TopContainer>

      {/* Members List */}
      <MembersCard>
        <List>
          {user && (
            <>
              <Members />
              <SentInvites />
            </>
          )}
        </List>
      </MembersCard>

      {/* Team Actions */}
      <TeamActionsContainer>
        {isUserOrganizer ? (
          <NeoButton variant="danger" size="sm" onClick={handleDisbandClick}>
            <FaTrash /> Disband Team
          </NeoButton>
        ) : (
          <NeoButton variant="danger" size="sm" onClick={handleLeaveClick}>
            <FaRightFromBracket /> Leave Team
          </NeoButton>
        )}
      </TeamActionsContainer>
    </Container>
  );
}

export default TeamMembersWidget;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
  min-width: 400px;
  gap: 1rem;

  @media (max-width: 500px) {
    min-width: 100%;
  }
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const MemberCount = styled.span`
  background: ${neoColors.background};
  color: ${neoColors.textMuted};
  padding: 0.25rem 0.75rem;
  border: 2px solid #000;
  font-size: 0.875rem;
  font-weight: 600;
`;

const MembersCard = styled(NeoCard)``;

const List = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  width: 100%;
`;

const ListItemContainer = styled.div`
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  border-bottom: 2px solid ${neoColors.background};
  padding: 0.75rem 0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const ItemButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LeftItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MemberName = styled.span<{ $muted?: boolean }>`
  font-weight: 500;
  color: ${({ $muted }) => ($muted ? neoColors.textMuted : neoColors.text)};
`;

const CrownIcon = styled.span`
  color: #ffd700;
  display: flex;
  align-items: center;
  font-size: 1.25rem;
`;

const TeamActionsContainer = styled.div`
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid ${neoColors.background};
`;

const InviteForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MemberCard = styled.div`
  border-bottom: 2px solid ${neoColors.background};
  padding: 0.75rem 0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const MemberHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 2.5rem;
  margin-bottom: 0.5rem;
`;

const StampTableContainer = styled.div`
  margin-top: 0.25rem;
`;
