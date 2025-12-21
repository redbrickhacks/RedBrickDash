import React from 'react';
import styled from 'styled-components';
import { useTeam } from '../../hooks/use-team/use-team';
import { NeoCard, neoColors } from '../neo-ui';

function TeamHeader() {
  const { team } = useTeam();

  return (
    <HeaderCard accent={neoColors.accent.blue}>
      <TeamName>{team.name}</TeamName>
      {team.description && (
        <TeamDescription>{team.description}</TeamDescription>
      )}
    </HeaderCard>
  );
}

export default TeamHeader;

const HeaderCard = styled(NeoCard)`
  margin-bottom: 1.5rem;
`;

const TeamName = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${neoColors.text};
`;

const TeamDescription = styled.p`
  margin: 0.5rem 0 0 0;
  color: ${neoColors.textMuted};
  line-height: 1.5;
`;
