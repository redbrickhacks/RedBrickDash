import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import { Button } from '@hibiscus/ui-kit-2023';
import Link from 'next/link';

interface TeamMember {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Invitation {
  id: string;
  teams: { name: string };
}

interface TeamSectionProps {
  team: any;
  userId: string;
}

export function TeamSection({ team, userId }: TeamSectionProps) {
  const { supabase } = useHibiscusSupabase();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (team) {
        const { data: members } = await supabase
          .getClient()
          .from('user_profiles')
          .select('user_id, first_name, last_name, email')
          .eq('team_id', team.team_id);

        setTeamMembers(members || []);
      } else {
        const { data: invites } = await supabase
          .getClient()
          .from('invitations')
          .select('id, teams(name)')
          .eq('invited_id', userId);

        setPendingInvites((invites as any) || []);
      }
    }
    fetchData();
  }, [team, userId, supabase]);

  if (!team) {
    return (
      <NoTeamContainer>
        <h2>You&apos;re not in a team yet</h2>
        <p>Create a team or accept an invite to submit your project.</p>

        <ButtonGroup>
          <Link href="/team">
            <Button color="black">Create Team</Button>
          </Link>
        </ButtonGroup>

        {pendingInvites.length > 0 && (
          <InvitesSection>
            <h3>Pending Invites</h3>
            {pendingInvites.map((invite) => (
              <InviteCard key={invite.id}>
                <span>{invite.teams?.name}</span>
                <Link href={`/team/invite/accept?inviteId=${invite.id}`}>
                  <Button color="yellow">Accept</Button>
                </Link>
              </InviteCard>
            ))}
          </InvitesSection>
        )}
      </NoTeamContainer>
    );
  }

  return (
    <TeamContainer>
      <h2>Team: {team.name}</h2>
      <MembersList>
        {teamMembers.map((member) => (
          <MemberCard key={member.user_id}>
            <span>
              {member.first_name} {member.last_name}
            </span>
            <span className="email">{member.email}</span>
            {member.user_id === team.organizer_id && (
              <span className="badge">Organizer</span>
            )}
          </MemberCard>
        ))}
      </MembersList>

      <Link href="/team">
        <Button color="black">Manage Team</Button>
      </Link>
    </TeamContainer>
  );
}

const NoTeamContainer = styled.div`
  background: #f5f5f5;
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
`;

const TeamContainer = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const InvitesSection = styled.div`
  margin-top: 2rem;
  text-align: left;
`;

const InviteCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const MembersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
`;

const MemberCard = styled.div`
  background: #f9f9f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;

  .email {
    color: #888;
    font-size: 0.875rem;
    margin-left: 0.5rem;
  }

  .badge {
    background: #ff6347;
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    margin-left: 0.5rem;
  }
`;

export default TeamSection;
