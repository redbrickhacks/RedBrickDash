import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { isSuperadmin } from '../../common/superadmin-auth';
import { OverviewTab } from '../../components/superadmin/overview-tab';
import {
  NeoButton,
  neoColors,
  neoBorders,
  neoShadows,
} from '../../components/neo-ui';

type TabType = 'overview' | 'participants' | 'teams' | 'email';

const TABS: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'participants', label: 'Participants' },
  { id: 'teams', label: 'Teams' },
  { id: 'email', label: 'Email' },
];

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

export default function SuperadminPage() {
  const { user } = useHibiscusUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && !isSuperadmin(user.email)) {
      router.replace('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && isSuperadmin(user.email)) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/superadmin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !isSuperadmin(user.email)) {
    return <LoadingText>Loading...</LoadingText>;
  }

  return (
    <Container>
      <Header>
        <Title>Superadmin Dashboard</Title>
        <RefreshButton variant="secondary" size="sm" onClick={fetchStats}>
          Refresh
        </RefreshButton>
      </Header>

      <TabBar>
        {TABS.map((tab) => (
          <Tab
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabBar>

      <TabContent>
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} isLoading={isLoading} />
        )}
        {activeTab === 'participants' && (
          <PlaceholderText>Participants tab coming soon...</PlaceholderText>
        )}
        {activeTab === 'teams' && (
          <PlaceholderText>Teams tab coming soon...</PlaceholderText>
        )}
        {activeTab === 'email' && (
          <PlaceholderText>Email tab coming soon...</PlaceholderText>
        )}
      </TabContent>
    </Container>
  );
}

const Container = styled.div`
  max-width: 1200px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: ${neoColors.text};
`;

const RefreshButton = styled(NeoButton)``;

const TabBar = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border: ${neoBorders.thick};
  width: fit-content;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  transition: all 0.1s ease;

  background: ${({ $active }) =>
    $active ? neoColors.accent.yellow : neoColors.surface};
  color: ${neoColors.text};

  &:not(:last-child) {
    border-right: ${neoBorders.thick};
  }

  &:hover {
    background: ${({ $active }) =>
      $active ? neoColors.accent.yellow : '#f5f5f5'};
  }
`;

const TabContent = styled.div``;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-weight: 500;
`;

const PlaceholderText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-style: italic;
`;
