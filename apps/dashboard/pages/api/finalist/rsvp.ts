import { getEnv } from '@hibiscus/env';
import { getCookie } from 'cookies-next';
import { createClient } from '@supabase/supabase-js';
import type { NextApiHandler } from 'next';

type Choice = 'ACCEPT' | 'DECLINE';

type RequestBody = {
  choice: Choice;
};

type TeamRsvpMember = {
  name: string;
  email: string;
  attendanceConfirmed: boolean | null;
};

type TeamRsvpData = {
  teamName: string;
  deadline: string;
  members: TeamRsvpMember[];
};

type UserProfileMemberRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  rsvp_status: number | null;
  attendance_confirmed: boolean | null;
};

const RSVP_DEADLINE = 'Feb 1, 2026';

function createAnonClient() {
  return createClient(
    getEnv().Hibiscus.Supabase.apiUrl,
    getEnv().Hibiscus.Supabase.anonKey
  );
}

function createServiceClient() {
  return createClient(
    getEnv().Hibiscus.Supabase.apiUrl,
    getEnv().Hibiscus.Supabase.serviceKey
  );
}

async function getUserIdFromRequest(
  req: Parameters<NextApiHandler>[0],
  res: Parameters<NextApiHandler>[1]
): Promise<string | null> {
  const accessToken = getCookie(getEnv().Hibiscus.Cookies.accessTokenName, {
    req,
    res,
  }) as string | undefined;

  if (!accessToken) return null;

  const anon = createAnonClient();
  const { data, error } = await anon.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user.id;
}

function toAttendanceConfirmed(row: UserProfileMemberRow): boolean | null {
  // Prefer rsvp_status if present; fall back to attendance_confirmed.
  if (row.rsvp_status === 3) return true; // RSVP'D
  if (row.rsvp_status === 2) return false; // DECLINED
  if (row.rsvp_status === 1) return null; // PENDING
  return row.attendance_confirmed ?? null;
}

function toDisplayName(row: UserProfileMemberRow): string {
  const first = (row.first_name ?? '').toString().trim();
  const last = (row.last_name ?? '').toString().trim();
  const name = `${first} ${last}`.trim();
  return name || row.email || '—';
}

async function handleGetTeamRsvp(userId: string): Promise<TeamRsvpData> {
  const service = createServiceClient();

  const profileRes = await service
    .from('user_profiles')
    .select('team_id')
    .eq('user_id', userId)
    .single();
  if (profileRes.error) throw new Error(profileRes.error.message);

  const teamId = profileRes.data?.team_id as string | null;
  if (!teamId) throw new Error('User is not on a team');

  const teamRes = await service
    .from('teams')
    .select('team_id,name')
    .eq('team_id', teamId)
    .single();
  if (teamRes.error) throw new Error(teamRes.error.message);

  const membersRes = await service
    .from('user_profiles')
    .select(
      'user_id,first_name,last_name,email,rsvp_status,attendance_confirmed'
    )
    .eq('team_id', teamId);
  if (membersRes.error) throw new Error(membersRes.error.message);

  const members: TeamRsvpMember[] = (membersRes.data ?? [])
    .map((m) => m as UserProfileMemberRow)
    .sort((a, b) => a.user_id.localeCompare(b.user_id))
    .map((row) => ({
      name: toDisplayName(row),
      email: row.email ?? '',
      attendanceConfirmed: toAttendanceConfirmed(row),
    }));

  return {
    teamName: teamRes.data?.name ?? 'Your team',
    deadline: RSVP_DEADLINE,
    members,
  };
}

async function handlePostChoice(userId: string, choice: Choice) {
  const service = createServiceClient();

  const application_status = choice === 'ACCEPT' ? 4 : 5; // CONFIRMED or DECLINED
  const rsvp_status = choice === 'ACCEPT' ? 3 : 2; // RSVP'D or DECLINED
  const attendance_confirmed = choice === 'ACCEPT';

  const { error } = await service
    .from('user_profiles')
    .update({ application_status, rsvp_status, attendance_confirmed })
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  return { application_status, rsvp_status, attendance_confirmed };
}

const handler: NextApiHandler = async (req, res) => {
  const userId = await getUserIdFromRequest(req, res);
  if (!userId) return res.status(401).json({ error: 'Invalid session' });

  try {
    if (req.method === 'GET') {
      const data = await handleGetTeamRsvp(userId);
      return res.status(200).json({ data });
    }

    if (req.method === 'POST') {
      const { choice } = (req.body ?? {}) as Partial<RequestBody>;
      if (choice !== 'ACCEPT' && choice !== 'DECLINE') {
        return res.status(400).json({ error: 'Invalid choice' });
      }
      const data = await handlePostChoice(userId, choice);
      return res.status(200).json({ data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    const status = message === 'User is not on a team' ? 404 : 500;
    return res.status(status).json({ error: message });
  }
};

export default handler;
