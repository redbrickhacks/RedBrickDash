import { Colors2023 } from '@hibiscus/styles';
import { H3, Modal, Text } from '@hibiscus/ui';
import { Button, OneLineText } from '@hibiscus/ui-kit-2023';
import React, { useState } from 'react';
import styled from 'styled-components';
import {
  AiFillCrown,
  AiFillPlusCircle,
  AiOutlineWarning,
} from 'react-icons/ai';
import { FaRightFromBracket, FaTrash } from 'react-icons/fa6';
import { GrayBox } from '../gray-box/gray-box';
import { Invite, TeamMember } from '../../common/types';
import { toast } from 'react-hot-toast';
import { useTeam } from '../../hooks/use-team/use-team';
import { TeamServiceAPI } from '../../common/api';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { SpanRed } from '../red-span';
import { useRouter } from 'next/router';

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
  const router = useRouter();

  const isUserOrganizer = team.organizerId === user?.id;
  const memberCount = team.members?.length || 0;
  const maxMembers = 4;

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

  const InviteForm = () => {
    const formik = useFormik({
      initialValues: { emailInvitee: '' },
      validationSchema: Yup.object({
        emailInvitee: Yup.string()
          .email('Please enter a valid email')
          .required('This field is required'),
      }),
      onSubmit: async (values, formikHelpers) => {
        try {
          const { data, error } = await TeamServiceAPI.teamInviteUser(
            user.id,
            values.emailInvitee
          );
          if (error) {
            toast.error(error.message, { duration: 5000 });
          } else {
            if (data.emailFailed) {
              toast(
                (t) => (
                  <div>
                    <p>
                      <strong>Invite created!</strong> Email notification
                      failed.
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
                  id: data.invitee.id,
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
          setInviteModalOpen(false);
        }
      },
    });

    return (
      <form
        onSubmit={formik.handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <div>
          <OneLineText
            placeholder="User email"
            type="email"
            name="emailInvitee"
            id="emailInvitee"
            value={formik.values.emailInvitee}
            onChange={formik.handleChange}
            disabled={formik.isSubmitting}
          />{' '}
          <SpanRed>{'*'}</SpanRed>
        </div>
        <SpanRed>{formik.errors.emailInvitee}</SpanRed>
        <Button color="black" type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Sending...' : 'Send Invite'}
        </Button>
      </form>
    );
  };

  const SentInvites = () => {
    if (!team.invites?.length) return null;

    return (
      <div>
        {team.invites.map((item, i) => (
          <ListItemContainer key={i}>
            <LeftItemContainer>
              <Text style={{ color: 'gray' }}>
                {item.user_profiles.first_name} {item.user_profiles.last_name}
              </Text>
            </LeftItemContainer>
            <ItemButtonsContainer>
              <InviteBadge>Pending</InviteBadge>
              {isUserOrganizer && (
                <Button
                  color="red"
                  onClick={() => handleRemoveInviteClick(item)}
                >
                  Cancel
                </Button>
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
        <ListItemContainer key={i}>
          <LeftItemContainer>
            <Text>
              {item.first_name} {item.last_name}
            </Text>
            {team.organizerId === item.user_id && (
              <CrownIcon title="Team Organizer">
                <AiFillCrown />
              </CrownIcon>
            )}
          </LeftItemContainer>
          <ItemButtonsContainer>
            {isUserOrganizer && item.user_id !== user.id && (
              <Button color="red" onClick={() => handleKickClick(item)}>
                Remove
              </Button>
            )}
          </ItemButtonsContainer>
        </ListItemContainer>
      ))}
    </>
  );

  return (
    <Container>
      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        closeModal={() => setInviteModalOpen(false)}
      >
        <GrayBox>
          <H3>Invite Team Member</H3>
          <InviteForm />
        </GrayBox>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={!!confirmAction} closeModal={closeConfirmDialog}>
        <ConfirmBox>
          <WarningIcon>
            <AiOutlineWarning />
          </WarningIcon>
          <H3>Confirm Action</H3>
          <Text style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {confirmAction?.message}
          </Text>
          <ConfirmButtons>
            <Button
              color="red"
              onClick={executeConfirmedAction}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </Button>
            <Button color="black" onClick={closeConfirmDialog}>
              Cancel
            </Button>
          </ConfirmButtons>
        </ConfirmBox>
      </Modal>

      {/* Header with member count */}
      <TopContainer>
        <HeaderLeft>
          <H3 style={{ fontWeight: 600 }}>Members</H3>
          <MemberCount>
            {memberCount}/{maxMembers}
          </MemberCount>
        </HeaderLeft>
        {isUserOrganizer && memberCount < maxMembers && (
          <Button color="black" onClick={() => setInviteModalOpen(true)}>
            <AiFillPlusCircle /> Add Member
          </Button>
        )}
      </TopContainer>

      {/* Members List */}
      <GrayBox>
        <List>
          {user && (
            <>
              <Members />
              <SentInvites />
            </>
          )}
        </List>
      </GrayBox>

      {/* Team Actions */}
      <TeamActionsContainer>
        {isUserOrganizer ? (
          <DangerButton onClick={handleDisbandClick}>
            <FaTrash /> Disband Team
          </DangerButton>
        ) : (
          <DangerButton onClick={handleLeaveClick}>
            <FaRightFromBracket /> Leave Team
          </DangerButton>
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
  gap: 10px;

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
  gap: 0.5rem;
`;

const MemberCount = styled.span`
  background: ${Colors2023.GRAY.LIGHT};
  color: ${Colors2023.GRAY.DARK};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const List = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  width: 100%;
`;

const ListItemContainer = styled.div`
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
  border-bottom: 1px solid ${Colors2023.GRAY.MEDIUM};
  padding: 0.5rem 0;
`;

const ItemButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LeftItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CrownIcon = styled.span`
  color: #ffd700;
  display: flex;
  align-items: center;
`;

const InviteBadge = styled.span`
  background: ${Colors2023.BLUE.LIGHT};
  color: ${Colors2023.BLUE.DARK};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const TeamActionsContainer = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${Colors2023.GRAY.LIGHT};
`;

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: #dc3545;
    color: white;
  }
`;

const ConfirmBox = styled(GrayBox)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
`;

const WarningIcon = styled.div`
  font-size: 2.5rem;
  color: #ffc107;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 1rem;
`;
