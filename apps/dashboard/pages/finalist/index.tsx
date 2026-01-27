import { HibiscusRole } from '@hibiscus/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { NeoCard } from '../../components/neo-ui/NeoCard';
import { NeoButton } from '../../components/neo-ui/NeoButton';
import { neoBorders, neoColors } from '../../components/neo-ui/theme';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';

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
      applicationStatus: 4 as number,
    },
    {
      name: 'Riya',
      email: 'riya@example.com',
      attendanceConfirmed: true as boolean | null,
      applicationStatus: 4 as number,
    },
    {
      name: 'Harshit',
      email: 'harshit@example.com',
      attendanceConfirmed: false as boolean | null,
      applicationStatus: 5 as number,
    },
    {
      name: 'Zoya',
      email: 'zoya@example.com',
      attendanceConfirmed: null as boolean | null,
      applicationStatus: 3 as number,
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
            Event info, arrival instructions, RSVP status, and Monkeytype setup.
          </PageSubtitle>
        </div>
        <CountdownChip>
          <CountdownValue>{countdownText}</CountdownValue>
          <CountdownHint>to kickoff</CountdownHint>
        </CountdownChip>
      </HeaderRow>

      <HeroBanner>
        <HeroMeta>
          <MetaItem>
            <MetaLabel>Date</MetaLabel>
            <MetaValue>{hackathon.date}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Check-in</MetaLabel>
            <MetaValue>{hackathon.checkIn}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Kickoff</MetaLabel>
            <MetaValue>{hackathon.kickoff}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Venue</MetaLabel>
            <MetaValue>
              {hackathon.venueName}
              <br />
              <span style={{ color: neoColors.textMuted }}>
                {hackathon.venueLine}
              </span>
            </MetaValue>
          </MetaItem>
        </HeroMeta>
      </HeroBanner>

      <FullWidthCard accent={neoColors.accent.blue}>
        <TravelGrid>
          <TravelLeft>
            <CardTitle>Travelling to Ashoka University</CardTitle>

            <SectionLabel>STEP 1: Reaching Azadpur</SectionLabel>
            <RouteGrid>
              <RouteBox>
                <RouteTitle>From NDLS (New Delhi Railway Station)</RouteTitle>
                <List>
                  <li>
                    Take the <b>Yellow Line</b> (towards <b>Samaypur Badli</b>).
                  </li>
                  <li>
                    Get off at <b>Azadpur</b>.
                  </li>
                  <li>Follow signs for the main exit + shuttle pickup.</li>
                </List>
              </RouteBox>
              <RouteBox>
                <RouteTitle>From IGI Airport (T3)</RouteTitle>
                <List>
                  <li>
                    Take the <b>Airport Express</b> to <b>New Delhi</b>.
                  </li>
                  <li>
                    Switch to the <b>Yellow Line</b> towards{' '}
                    <b>Samaypur Badli</b>.
                  </li>
                  <li>
                    Get off at <b>Azadpur</b>.
                  </li>
                </List>
              </RouteBox>
            </RouteGrid>

            <SectionLabel>STEP 2: From Azadpur → Ashoka</SectionLabel>
            <List>
              <li>
                Board the <b>Ashoka University shuttle</b> (Force Traveller).
              </li>
              <li>
                On arrival, go to the <b>Main Gate</b>.
              </li>
              <li>
                Show your <b>MyGate OTP</b> at the gate and enter campus.
              </li>
              <li>Head to the help desk for your badge + Wi‑Fi.</li>
            </List>

            <SectionLabel>Alternative: Cab</SectionLabel>
            <List>
              <li>
                Book an Uber/Ola to <b>Ashoka University (Main Gate)</b>.
              </li>
              <li>
                Tell the driver: <b>Rajiv Gandhi Education City, Sonipat</b>.
              </li>
              <li>
                At the gate, show your <b>MyGate OTP</b> to enter campus.
              </li>
            </List>
          </TravelLeft>

          <RightStack>
            <MapWrap>
              <MapFrame
                title="Ashoka University map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.0985%2C28.9390%2C77.1165%2C28.9495&layer=mapnik&marker=28.9442%2C77.1075"
              />
              <MapOverlay>
                <MapOverlayButton
                  type="button"
                  onClick={() =>
                    window.open(
                      'https://www.google.com/maps/search/?api=1&query=Ashoka%20University%2C%20Sonipat',
                      '_blank'
                    )
                  }
                >
                  Open in Google Maps
                </MapOverlayButton>
              </MapOverlay>
            </MapWrap>

            <OtpInline style={{ marginTop: 0 }}>
              <div>
                <OtpInlineLabel>MyGate OTP</OtpInlineLabel>
                <OtpInlineValue>{myGateOtp}</OtpInlineValue>
              </div>
              <NeoButton
                variant="secondary"
                onClick={() => alert('Copy coming soon')}
              >
                Copy
              </NeoButton>
            </OtpInline>
          </RightStack>
        </TravelGrid>
      </FullWidthCard>

      <TwoColumn>
        <Column>
          <Card accent={neoColors.accent.yellow}>
            <CardHeader>
              <CardTitle>RSVP</CardTitle>
              <CardSubtitle>
                Status is based on <b>attendance_confirmed</b>. Deadline:{' '}
                <b>{teamRsvp.deadline}</b>.
              </CardSubtitle>
            </CardHeader>

            <TeamHeaderRow>
              <TeamName>{teamRsvp.teamName}</TeamName>
              <SmallMuted>4 members</SmallMuted>
            </TeamHeaderRow>

            <MemberList>
              {teamRsvp.members.map((m) => (
                <MemberRow key={m.email}>
                  <MemberName>{m.name}</MemberName>
                  <MemberStatus $status={toRsvpStatus(m.attendanceConfirmed)}>
                    {toRsvpLabel(m.attendanceConfirmed)}
                  </MemberStatus>
                </MemberRow>
              ))}
            </MemberList>

            <ButtonRow>
              <NeoButton
                variant="primary"
                onClick={() => alert('RSVP form integration coming soon')}
              >
                Open RSVP form
              </NeoButton>
              <NeoButton
                variant="secondary"
                onClick={() => alert('Reminder flow coming soon')}
              >
                Remind pending
              </NeoButton>
            </ButtonRow>
          </Card>
        </Column>

        <Column>
          <Card accent={neoColors.accent.green}>
            <CardHeader>
              <CardTitle>Travel reimbursement</CardTitle>
              <CardSubtitle>
                Submit via Tally + track a simple status.
              </CardSubtitle>
            </CardHeader>

            <StatusRow>
              <StatusBadge $tone={travelReimbursement.currentStatus}>
                {humanizeStatus(travelReimbursement.currentStatus)}
              </StatusBadge>
              <SmallMuted>
                Ref <b>{travelReimbursement.referenceId}</b> •{' '}
                {travelReimbursement.lastUpdated}
              </SmallMuted>
            </StatusRow>

            <SmallMuted>
              {travelReimbursement.currentStatus === 'UNDER_REVIEW'
                ? 'We received your form. Ops is verifying receipts — expect an update soon.'
                : travelReimbursement.currentStatus === 'APPROVED'
                ? 'Approved. Payout will be processed shortly.'
                : travelReimbursement.currentStatus === 'REJECTED'
                ? 'Needs changes. Please re-submit with corrected details.'
                : 'Submit the form to start your reimbursement request.'}
            </SmallMuted>

            <EmbedShell>
              <EmbedFrame
                title="Travel reimbursement form"
                loading="lazy"
                src={travelReimbursementTallyUrl}
              />
            </EmbedShell>

            <ButtonRow>
              <NeoButton
                variant="primary"
                onClick={() => alert('Open reimbursement form (Tally)')}
              >
                Open form
              </NeoButton>
              <NeoButton
                variant="secondary"
                onClick={() => alert('Status details coming soon')}
              >
                View status
              </NeoButton>
            </ButtonRow>
          </Card>

          <Card accent={neoColors.accent.red}>
            <CardHeader>
              <CardTitle>Monkeytype</CardTitle>
              <CardSubtitle>
                Authenticate using your OTP, then pick a theme.
              </CardSubtitle>
            </CardHeader>

            <OtpInline>
              <div>
                <OtpInlineLabel>Monkeytype Duel OTP</OtpInlineLabel>
                <OtpInlineValue>0421</OtpInlineValue>
                <SmallMuted>
                  Stored as user_profiles.monkeytype_duel_otp
                </SmallMuted>
              </div>
              <ButtonRow>
                <NeoButton
                  variant="secondary"
                  onClick={() => alert('Copy coming soon')}
                >
                  Copy
                </NeoButton>
                <NeoButton
                  variant="secondary"
                  onClick={() => alert('Reset OTP coming soon')}
                >
                  Reset
                </NeoButton>
              </ButtonRow>
            </OtpInline>

            <Divider />

            <CardHeader style={{ gap: '0.25rem' }}>
              <CardTitle style={{ fontSize: '1.05rem' }}>Theme</CardTitle>
              <CardSubtitle>Hardcoded for now.</CardSubtitle>
            </CardHeader>

            <ThemeGrid>
              {monkeytypeThemes.map((t) => {
                const selected = selectedMonkeytypeTheme === t.id;
                return (
                  <ThemeOption
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedMonkeytypeTheme(t.id)}
                    $selected={selected}
                  >
                    <ThemeSwatch style={{ background: t.swatch }} />
                    <div>
                      <ThemeName>{t.name}</ThemeName>
                      <SmallMuted>
                        {selected ? 'Selected' : 'Click to select'}
                      </SmallMuted>
                    </div>
                  </ThemeOption>
                );
              })}
            </ThemeGrid>
          </Card>
        </Column>
      </TwoColumn>

      <FootNote>
        Dummy UI only (for screenshot). Data + Tally wiring will come next.
      </FootNote>
    </PageContainer>
  );
}

function humanizeStatus(
  status:
    | 'NOT_STARTED'
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
) {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not started';
    case 'DRAFT':
      return 'Draft';
    case 'SUBMITTED':
      return 'Submitted';
    case 'UNDER_REVIEW':
      return 'Under review';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
  }
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

function toRsvpStatus(
  attendanceConfirmed: boolean | null
): 'YES' | 'NO' | 'PENDING' {
  if (attendanceConfirmed === true) return 'YES';
  if (attendanceConfirmed === false) return 'NO';
  return 'PENDING';
}

function toRsvpLabel(attendanceConfirmed: boolean | null) {
  if (attendanceConfirmed === true) return 'RSVP’d';
  if (attendanceConfirmed === false) return 'Declined';
  return 'Pending';
}

const PageContainer = styled.div`
  max-width: 1050px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CountdownChip = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  padding: 0.75rem 0.9rem;
  min-width: 220px;
`;

const CountdownValue = styled.div`
  font-size: 1.05rem;
  font-weight: 900;
  margin-top: 0.15rem;
`;

const CountdownHint = styled.div`
  font-size: 0.8rem;
  color: ${neoColors.textMuted};
  margin-top: 0.15rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
`;

const PageSubtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${neoColors.textMuted};
  font-weight: 500;
  max-width: 55ch;
`;

const HeroBanner = styled(NeoCard).attrs({ accent: neoColors.accent.yellow })`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HeroMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const MetaItem = styled.div`
  background: ${neoColors.background};
  border: ${neoBorders.standard};
  padding: 0.75rem;
`;

const MetaLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
  margin-bottom: 0.25rem;
`;

const MetaValue = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.25;
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled(NeoCard)<{ accent?: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const FullWidthCard = styled(Card)`
  width: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
`;

const CardSubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: ${neoColors.textMuted};
`;

const TravelGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TravelLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
`;

const RightStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    line-height: 1.4;
  }
`;

const SectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
  margin: 0.25rem 0 0.35rem;
`;

const RouteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.5rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const RouteBox = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.background};
  padding: 0.75rem;
`;

const RouteTitle = styled.div`
  font-weight: 900;
  margin-bottom: 0.35rem;
  line-height: 1.2;
`;

const MapWrap = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1 1 auto;
  min-height: 320px;
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
  background: ${neoColors.background};
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const MapOverlayButton = styled.button`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  font-weight: 900;
  padding: 0.45rem 0.65rem;
  cursor: pointer;
  box-shadow: 3px 3px 0 #000;

  &:hover {
    background: ${neoColors.background};
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
  }
`;

const OtpInline = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.background};
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const OtpInlineLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
`;

const OtpInlineValue = styled.div`
  font-weight: 900;
  font-size: 1.6rem;
  letter-spacing: 0.08em;
  line-height: 1.1;
`;

const SmallMuted = styled.div`
  font-size: 0.85rem;
  color: ${neoColors.textMuted};
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const StatusBadge = styled.div<{
  $tone:
    | 'NOT_STARTED'
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED';
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border: ${neoBorders.standard};
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.75rem;
  background: ${({ $tone }) => {
    switch ($tone) {
      case 'APPROVED':
        return `${neoColors.status.success}22`;
      case 'REJECTED':
        return `${neoColors.status.error}22`;
      case 'UNDER_REVIEW':
        return `${neoColors.accent.yellow}55`;
      case 'SUBMITTED':
        return `${neoColors.accent.blue}22`;
      default:
        return `${neoColors.background}`;
    }
  }};
`;

const EmbedShell = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  overflow: hidden;
`;

const EmbedFrame = styled.iframe`
  width: 100%;
  height: 320px;
  border: 0;
  background: ${neoColors.background};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const TeamHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const TeamName = styled.div`
  font-weight: 900;
  font-size: 1.05rem;
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MemberRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: ${neoBorders.standard};
  background: ${neoColors.background};
`;

const MemberName = styled.div`
  font-weight: 900;
`;

const MemberStatus = styled.div<{ $status: 'YES' | 'NO' | 'PENDING' }>`
  border: ${neoBorders.standard};
  font-weight: 900;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: ${({ $status }) =>
    $status === 'YES'
      ? `${neoColors.status.success}22`
      : $status === 'NO'
      ? `${neoColors.status.error}22`
      : `${neoColors.accent.yellow}55`};
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  border-top: ${neoBorders.standard};
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const ThemeOption = styled.button<{ $selected: boolean }>`
  border: ${neoBorders.standard};
  background: ${({ $selected }) =>
    $selected ? `${neoColors.accent.yellow}55` : neoColors.background};
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${neoColors.accent.yellow}55;
  }
`;

const ThemeSwatch = styled.div`
  width: 18px;
  height: 18px;
  border: ${neoBorders.standard};
  flex: 0 0 auto;
`;

const ThemeName = styled.div`
  font-weight: 900;
  line-height: 1.2;
`;

const FootNote = styled.div`
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: ${neoColors.textMuted};
  text-align: center;
`;
