import React, { useEffect, useMemo, useState } from 'react';
import { NeoButton } from '../neo-ui/NeoButton';
import { neoColors } from '../neo-ui/theme';
import { NeoConfirmDialog } from '../neo-ui/NeoConfirmDialog';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ApplicationStatus } from 'libs/types/src/lib/application-status';
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
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { toast } from 'react-hot-toast';

export interface RsvpMember {
  readonly name: string;
  readonly email: string;
  readonly attendanceConfirmed: boolean | null;
}

export function RsvpCard() {
  const { user, updateUser } = useHibiscusUser();
  const [choice, setChoice] = useState<'ACCEPT' | 'DECLINE' | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('Your team');
  const [deadline, setDeadline] = useState('—');
  const [members, setMembers] = useState<RsvpMember[]>([]);

  const fetchTeamRsvp = async () => {
    const res = await fetch('/api/finalist/rsvp');
    if (!res.ok) return;
    const body = (await res.json()) as {
      data?: { teamName: string; deadline: string; members: RsvpMember[] };
    };
    if (!body.data) return;
    setTeamName(body.data.teamName);
    setDeadline(body.data.deadline);
    setMembers(body.data.members);
  };

  useEffect(() => {
    fetchTeamRsvp().catch(() => null);
  }, []);

  const canRespond = useMemo(() => {
    if (!user?.applicationStatus) return false;
    // Allow responses unless they've already confirmed/declined.
    return (
      user.applicationStatus !== ApplicationStatus.CONFIRMED &&
      user.applicationStatus !== ApplicationStatus.DECLINED
    );
  }, [user?.applicationStatus]);

  const hasResponded = useMemo(() => {
    if (!user?.applicationStatus) return false;
    return (
      user.applicationStatus === ApplicationStatus.CONFIRMED ||
      user.applicationStatus === ApplicationStatus.DECLINED
    );
  }, [user?.applicationStatus]);

  const handleConfirm = async () => {
    if (!choice) return;
    setLoading(true);

    try {
      const res = await fetch('/api/finalist/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to update RSVP');
      }

      if (choice === 'ACCEPT') {
        toast.success(
          'Congratulations! You are confirmed for the National Finals!'
        );
        updateUser({
          applicationStatus: ApplicationStatus.CONFIRMED,
          attendanceConfirmed: true,
        });
      } else {
        toast.success('Your response has been recorded.');
        updateUser({
          applicationStatus: ApplicationStatus.DECLINED,
          attendanceConfirmed: false,
        });
      }
      await fetchTeamRsvp();
      setChoice(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to update RSVP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card accent={neoColors.accent.yellow}>
      <CardHeader>
        <CardTitle>RSVP</CardTitle>
        <CardSubtitle>
          Deadline: <b>{deadline}</b>.
        </CardSubtitle>
      </CardHeader>

      <HeaderRow>
        <TeamName>{teamName}</TeamName>
        <SmallMuted>{members.length} members</SmallMuted>
      </HeaderRow>

      <MemberList>
        {members.map((m) => (
          <MemberRow key={m.email}>
            <MemberName>{m.name}</MemberName>
            <MemberStatus $status={toRsvpStatus(m.attendanceConfirmed)}>
              {toRsvpLabel(m.attendanceConfirmed)}
            </MemberStatus>
          </MemberRow>
        ))}
      </MemberList>

      <ButtonRow>
        {canRespond ? (
          <>
            <NeoButton
              variant="secondary"
              size="sm"
              onClick={() => setChoice('ACCEPT')}
              style={{
                background: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Confirm
            </NeoButton>
            <NeoButton
              variant="danger"
              size="sm"
              onClick={() => setChoice('DECLINE')}
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Decline
            </NeoButton>
          </>
        ) : hasResponded ? (
          <></>
        ) : (
          <NeoButton variant="secondary" disabled>
            RSVP not available
          </NeoButton>
        )}
      </ButtonRow>

      <NeoConfirmDialog
        isOpen={choice != null}
        onCancel={() => setChoice(null)}
        onConfirm={handleConfirm}
        isLoading={loading}
        title={choice === 'ACCEPT' ? 'Confirm your spot' : 'Decline your spot'}
        message={
          choice === 'ACCEPT'
            ? 'By confirming, you commit to attending the National Finals in person.'
            : 'Are you sure? This action cannot be undone.'
        }
        confirmText={choice === 'ACCEPT' ? 'Confirm' : 'Decline'}
        cancelText="Cancel"
        variant={choice === 'ACCEPT' ? 'info' : 'danger'}
      />
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
