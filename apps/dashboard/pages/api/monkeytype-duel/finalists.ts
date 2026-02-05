import 'reflect-metadata';
import type { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';

type TeamBasicInfo = {
  team_id: string;
  name: string;
  created_at: string | null;
  description: string | null;
  organizer_id: string | null;
};

type Finalist = {
  id: string;
  first_name: string;
  last_name: string;
  team: TeamBasicInfo | null;
  monkeytype_duel_settings: unknown;
  monkeytype_wpm: number | null;
  monkeytype_duel_otp: number | null;
};

type ResponseBody = { message: string } | { finalists: Finalist[] };

function getBearerToken(req: NextApiRequest): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) return null;
  const token = header.slice(prefix.length).trim();
  if (!token) return null;
  return token;
}

const FINALIST_ROLE_ID = 8;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const expectedSecret = process.env.MONKEYTYPE_DUEL_SECRET;
  if (!expectedSecret) {
    console.error(
      '[monkeytype-duel/finalists] MONKEYTYPE_DUEL_SECRET is not set'
    );
    return res.status(500).json({ message: 'Server misconfigured' });
  }

  const token = getBearerToken(req);

  if (!token || token !== expectedSecret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select(
        'user_id,first_name,last_name,team_id,monkeytype_duel_settings,monkeytype_wpm,monkeytype_duel_otp'
      )
      .eq('role', FINALIST_ROLE_ID)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true });

    if (profilesError) {
      console.error(
        '[monkeytype-duel/finalists] Profile query error:',
        profilesError
      );
      return res.status(500).json({ message: 'Failed to fetch finalists' });
    }

    const teamIds = Array.from(
      new Set(
        (profiles ?? [])
          .map((p) => p.team_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      )
    );

    let teamsById = new Map<string, TeamBasicInfo>();
    if (teamIds.length > 0) {
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('team_id,name,created_at,description,organizer_id')
        .in('team_id', teamIds);

      if (teamsError) {
        console.error(
          '[monkeytype-duel/finalists] Team query error:',
          teamsError
        );
        return res.status(500).json({ message: 'Failed to fetch finalists' });
      }

      teamsById = new Map((teams ?? []).map((t) => [t.team_id, t]));
    }

    const finalists: Finalist[] = (profiles ?? []).map((p) => ({
      id: p.user_id,
      first_name: p.first_name,
      last_name: p.last_name,
      team: p.team_id ? teamsById.get(p.team_id) ?? null : null,
      monkeytype_duel_settings: p.monkeytype_duel_settings ?? {},
      monkeytype_wpm: p.monkeytype_wpm ?? null,
      monkeytype_duel_otp: p.monkeytype_duel_otp ?? null,
    }));

    return res.status(200).json({ finalists });
  } catch (e) {
    console.error('[monkeytype-duel/finalists] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
