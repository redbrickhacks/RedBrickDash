import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NeoAccordion, NeoBadge, neoColors } from '../neo-ui';

const STATUS_LABELS: Record<number, string> = {
  1: 'Not Applied',
  2: 'Registered',
  3: 'Finalist',
  4: 'Confirmed',
  5: 'Declined',
  6: 'Not Selected',
};

const STATUS_VARIANTS: Record<
  number,
  'info' | 'success' | 'warning' | 'error' | 'neutral'
> = {
  1: 'neutral',
  2: 'info',
  3: 'warning',
  4: 'success',
  5: 'error',
  6: 'neutral',
};

interface Member {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  application_status: number;
}

interface Team {
  team_id: string;
  name: string;
  description: string;
  organizer_id: string;
  project_title: string | null;
  submission_status: number | null;
  members: Member[];
}

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/superadmin/teams');
      if (res.ok) {
        const data = await res.json();
        setTeams(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingText>Loading teams...</LoadingText>;
  }

  if (teams.length === 0) {
    return <EmptyText>No teams found.</EmptyText>;
  }

  return (
    <Container>
      <Summary>
        <strong>{teams.length}</strong> team{teams.length !== 1 ? 's' : ''}
      </Summary>
      <TeamList>
        {teams.map((team) => (
          <NeoAccordion
            key={team.team_id}
            id={`team-${team.team_id}`}
            title={`${team.name} (${team.members.length}/4)`}
            accent={neoColors.accent.yellow}
            persistState={false}
          >
            <TeamContent>
              {team.project_title && (
                <ProjectTitle>{team.project_title}</ProjectTitle>
              )}
              {team.description && (
                <Description>{team.description}</Description>
              )}
              <MemberList>
                {team.members.map((member) => (
                  <MemberRow key={member.user_id}>
                    <MemberInfo>
                      <MemberName>
                        {member.first_name} {member.last_name}
                        {member.user_id === team.organizer_id && (
                          <OrganizerBadge>Organizer</OrganizerBadge>
                        )}
                      </MemberName>
                      <MemberEmail>{member.email}</MemberEmail>
                    </MemberInfo>
                    <NeoBadge
                      variant={STATUS_VARIANTS[member.application_status]}
                    >
                      {STATUS_LABELS[member.application_status] || 'Unknown'}
                    </NeoBadge>
                  </MemberRow>
                ))}
              </MemberList>
            </TeamContent>
          </NeoAccordion>
        ))}
      </TeamList>
    </Container>
  );
}

const Container = styled.div``;

const Summary = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  margin-bottom: 1rem;
`;

const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TeamContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ProjectTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${neoColors.text};
  margin: 0;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${neoColors.textMuted};
  margin: 0;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const MemberRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const MemberInfo = styled.div``;

const MemberName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${neoColors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MemberEmail = styled.div`
  font-size: 0.75rem;
  color: ${neoColors.textMuted};
`;

const OrganizerBadge = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  color: ${neoColors.accent.blue};
  background: #e3f2fd;
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-weight: 500;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-style: italic;
`;
