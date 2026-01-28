import React from 'react';
import { NeoButton } from '../neo-ui/NeoButton';
import { neoColors } from '../neo-ui/theme';
import {
  ButtonRow,
  Card,
  CardHeader,
  CardSubtitle,
  CardTitle,
  MemberList,
  MemberName,
  MemberRow,
  MemberStatus,
  SmallMuted,
} from './common';

export interface RsvpMember {
  readonly name: string;
  readonly email: string;
  readonly attendanceConfirmed: boolean | null;
}

export interface RsvpCardProps {
  teamName: string;
  deadline: string;
  members: readonly RsvpMember[];
}

export function RsvpCard(props: RsvpCardProps) {
  return (
    <Card accent={neoColors.accent.yellow}>
      <CardHeader>
        <CardTitle>RSVP</CardTitle>
        <CardSubtitle>
          Deadline: <b>{props.deadline}</b>.
        </CardSubtitle>
      </CardHeader>

      <HeaderRow>
        <TeamName>{props.teamName}</TeamName>
        <SmallMuted>{props.members.length} members</SmallMuted>
      </HeaderRow>

      <MemberList>
        {props.members.map((m) => (
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
      </ButtonRow>
    </Card>
  );
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

const HeaderRow = (props: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
    }}
  >
    {props.children}
  </div>
);

const TeamName = (props: { children: React.ReactNode }) => (
  <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>{props.children}</div>
);

export default RsvpCard;
