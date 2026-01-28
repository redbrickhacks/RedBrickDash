import { HibiscusRole } from '@hibiscus/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import {
  Column,
  CountdownChip,
  CountdownHint,
  CountdownValue,
  HeaderRow,
  PageContainer,
  PageSubtitle,
  PageTitle,
  TwoColumn,
} from '../../components/finalist-dashboard/common';
import { EventInfoCard } from '../../components/finalist-dashboard/EventInfoCard';
import { TravelCard } from '../../components/finalist-dashboard/TravelCard';
import { RsvpCard } from '../../components/finalist-dashboard/RsvpCard';
import { TravelReimbursementCard } from '../../components/finalist-dashboard/TravelReimbursementCard';
import { MonkeytypeCard } from '../../components/finalist-dashboard/MonkeytypeCard';

const HACKATHON_START_ISO = '2026-02-05T10:00:00+05:30';

const hackathon = {
  title: 'Red Brick Hackathon — Finals',
  date: 'February 5, 2026',
  checkIn: '8:30 AM IST',
  kickoff: '10:00 AM IST',
  venueName: 'Ashoka University',
  venueLine: 'Rajiv Gandhi Education City, Sonipat, Haryana',
} as const;

const myGateOtp = '742913' as const;

const travelReimbursement = {
  currentStatus: 'UNDER_REVIEW' as
    | 'NOT_STARTED'
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED',
  lastUpdated: 'Jan 24, 2026',
  referenceId: 'RB-TRAVEL-0182',
} as const;

const travelReimbursementTallyUrl =
  'https://tally.so/r/3qYB8Z?transparentBackground=1' as const;

const teamRsvp = {
  teamName: 'Team Bricklayers',
  deadline: 'Feb 1, 2026',
  members: [
    {
      name: 'Angad',
      email: 'angad@example.com',
      attendanceConfirmed: true as boolean | null,
    },
    {
      name: 'Riya',
      email: 'riya@example.com',
      attendanceConfirmed: true as boolean | null,
    },
    {
      name: 'Harshit',
      email: 'harshit@example.com',
      attendanceConfirmed: false as boolean | null,
    },
    {
      name: 'Zoya',
      email: 'zoya@example.com',
      attendanceConfirmed: null as boolean | null,
    },
  ],
} as const;

const monkeytypeThemes = [
  { id: 'neo-brutal', name: 'Neo Brutal (default)', swatch: '#FFE566' },
  { id: 'midnight', name: 'Midnight', swatch: '#0077B6' },
  { id: 'forest', name: 'Forest', swatch: '#2D6A4F' },
  { id: 'tomato', name: 'Tomato', swatch: '#FF5C5C' },
  { id: 'mono', name: 'Mono', swatch: '#666' },
] as const;

export default function FinalistPage() {
  const { user } = useHibiscusUser();
  const router = useRouter();
  const [selectedMonkeytypeTheme, setSelectedMonkeytypeTheme] =
    useState<string>('neo-brutal');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (user == null) return;
    if (![HibiscusRole.FINALIST, HibiscusRole.SUPERADMIN].includes(user.role)) {
      router.replace('/');
    }
  }, [router, user]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (user == null) return <>Loading</>;

  if (![HibiscusRole.FINALIST, HibiscusRole.SUPERADMIN].includes(user.role)) {
    return null;
  }

  const countdownText = formatCountdown(
    new Date(HACKATHON_START_ISO).getTime() - nowMs
  );

  return (
    <PageContainer>
      <HeaderRow>
        <div>
          <PageTitle>Finalist Dashboard</PageTitle>
          <PageSubtitle>
            Event info, arrival instructions, RSVP status.
          </PageSubtitle>
        </div>
        <CountdownChip>
          <CountdownValue>{countdownText}</CountdownValue>
          <CountdownHint>to kickoff</CountdownHint>
        </CountdownChip>
      </HeaderRow>

      <EventInfoCard
        date={hackathon.date}
        checkIn={hackathon.checkIn}
        kickoff={hackathon.kickoff}
        venueName={hackathon.venueName}
        venueLine={hackathon.venueLine}
      />

      <TravelCard myGateOtp={myGateOtp} />

      <TwoColumn>
        <Column>
          <RsvpCard
            teamName={teamRsvp.teamName}
            deadline={teamRsvp.deadline}
            members={teamRsvp.members}
          />
        </Column>

        <Column>
          <TravelReimbursementCard
            status={travelReimbursement.currentStatus}
            lastUpdated={travelReimbursement.lastUpdated}
            tallyUrl={travelReimbursementTallyUrl}
          />

          <MonkeytypeCard
            otp="0421"
            themes={[...monkeytypeThemes]}
            selectedThemeId={selectedMonkeytypeTheme}
            onSelectTheme={setSelectedMonkeytypeTheme}
          />
        </Column>
      </TwoColumn>
    </PageContainer>
  );
}

function formatCountdown(diffMs: number) {
  if (Number.isNaN(diffMs)) return '—';
  if (diffMs <= 0) return 'Happening now';
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${days}d ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`;
}
