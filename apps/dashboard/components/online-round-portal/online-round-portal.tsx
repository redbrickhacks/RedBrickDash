import { useState, useEffect } from 'react';
import styled from 'styled-components';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import TeamSection from './team-section';
import SubmissionSection from './submission-section';
import InstructionsSection from './instructions-section';

export function OnlineRoundPortal() {
  const { user } = useHibiscusUser();
  const { supabase } = useHibiscusSupabase();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      if (user?.teamId) {
        const { data, error } = await supabase
          .getClient()
          .from('teams')
          .select('*, tracks(*)')
          .eq('team_id', user.teamId)
          .single();

        if (!error) {
          setTeam(data);
        }
      }
      setLoading(false);
    }
    fetchTeam();
  }, [user?.teamId, supabase]);

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <WelcomeHeader>
        <h1>Welcome, {user?.firstName}!</h1>
        <p>Online Round - Submit by January 14, 2026</p>
      </WelcomeHeader>

      <InstructionsSection />

      <TeamSection team={team} userId={user?.id || ''} />

      {team && <SubmissionSection team={team} onUpdate={setTeam} />}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
`;

const WelcomeHeader = styled.div`
  h1 {
    color: #ff6347;
    margin: 0;
  }
  p {
    color: #888;
  }
`;

export default OnlineRoundPortal;
