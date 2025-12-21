import React, { useEffect } from 'react';
import styled from 'styled-components';
import TeamHeader from '../../components/team/team-header';
import TeamMembersWidget from '../../components/team/team-members-widget';
import NoTeamPlaceholder from '../../components/team/no-team-placeholder';
import { useTeam } from '../../hooks/use-team/use-team';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { TeamServiceAPI } from '../../common/api';
import { neoColors } from '../../components/neo-ui';

const Index = () => {
  const { updateTeam, isLoading, noTeam, setNoTeam } = useTeam();
  const { user } = useHibiscusUser();

  useEffect(() => {
    if (!user) return;
    if (!user.teamId) {
      setNoTeam();
      return;
    }
    TeamServiceAPI.getTeamById(user.teamId).then(({ data, error }) => {
      if (error) {
        console.error(error.message);
        setNoTeam();
        return;
      }
      updateTeam({
        id: data.id,
        name: data.name,
        description: data.description,
        invites: data.invites,
        members: data.members,
        organizerId: data.organizer_id,
      });
    });
  }, [user]);

  return (
    <PageContainer>
      {isLoading ? (
        <LoadingText>Loading...</LoadingText>
      ) : !noTeam ? (
        <TeamContent>
          <TeamHeader />
          <TeamMembersWidget />
        </TeamContent>
      ) : (
        <NoTeamPlaceholder />
      )}
    </PageContainer>
  );
};

export default Index;

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${neoColors.background};
  padding: 2rem;

  @media (min-width: 768px) {
    padding: 4rem 6rem;
  }

  @media (min-width: 1200px) {
    padding: 4rem 12rem;
  }
`;

const TeamContent = styled.div`
  max-width: 600px;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-weight: 500;
`;
