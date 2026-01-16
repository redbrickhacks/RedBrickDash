import React from 'react';
import styled from 'styled-components';
import { StatCard } from './stat-card';
import { neoColors } from '../neo-ui';

// Application status IDs mapped to labels
const STATUS_LABELS: Record<number, string> = {
  1: 'Not Applied',
  2: 'Registered',
  3: 'Finalist',
  4: 'Confirmed',
  5: 'Declined',
  6: 'Not Selected',
};

const STATUS_ACCENTS: Record<number, string> = {
  1: neoColors.accent.gray,
  2: neoColors.accent.blue,
  3: neoColors.accent.yellow,
  4: neoColors.accent.green,
  5: neoColors.accent.red,
  6: neoColors.accent.gray,
};

interface Stats {
  participants: {
    total: number;
    byStatus: Record<number, number>;
  };
  teams: {
    total: number;
  };
  soloUsers: number;
}

interface OverviewTabProps {
  stats: Stats | null;
  isLoading: boolean;
}

export function OverviewTab({ stats, isLoading }: OverviewTabProps) {
  if (isLoading || !stats) {
    return <LoadingText>Loading stats...</LoadingText>;
  }

  return (
    <Container>
      <Section>
        <SectionTitle>Participants</SectionTitle>
        <StatsGrid>
          <StatCard
            label="Total"
            value={stats.participants.total}
            accent={neoColors.accent.blue}
          />
          {Object.entries(stats.participants.byStatus).map(
            ([statusId, count]) => (
              <StatCard
                key={statusId}
                label={STATUS_LABELS[Number(statusId)] || `Status ${statusId}`}
                value={count}
                accent={STATUS_ACCENTS[Number(statusId)]}
              />
            )
          )}
        </StatsGrid>
      </Section>

      <Section>
        <SectionTitle>Teams</SectionTitle>
        <StatsGrid>
          <StatCard
            label="Total Teams"
            value={stats.teams.total}
            accent={neoColors.accent.yellow}
          />
          <StatCard
            label="Solo Users"
            value={stats.soloUsers}
            accent={neoColors.accent.gray}
          />
        </StatsGrid>
      </Section>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div``;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${neoColors.text};
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-weight: 500;
`;
