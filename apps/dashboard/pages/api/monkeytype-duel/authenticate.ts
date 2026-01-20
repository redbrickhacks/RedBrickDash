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

type ResponseBody =
  | { message: string }
  | {
      first_name: string;
      last_name: string;
      team: TeamBasicInfo | null;
      monkeytype_duel_settings: unknown;
    };

function getBearerToken(req: NextApiRequest): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) return null;
  const token = header.slice(prefix.length).trim();
  if (!token) return null;
  return token;
}

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
      '[monkeytype-duel/authenticate] MONKEYTYPE_DUEL_SECRET is not set'
    );
    return res.status(500).json({ message: 'Server misconfigured' });
  }

  const token = getBearerToken(req);
  if (!token || token !== expectedSecret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const otp = (req.body as { otp?: unknown } | undefined)?.otp;
  if (typeof otp !== 'string' || otp.trim().length === 0) {
    return res.status(400).json({ message: '`otp` is required' });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select(
        'user_id,first_name,last_name,team_id,monkeytype_duel_settings,monkeytype_duel_otp'
      )
      .eq('monkeytype_duel_otp', otp)
      .maybeSingle();

    if (userError) {
      console.error(
        '[monkeytype-duel/authenticate] Profile query error:',
        userError
      );
      return res.status(500).json({ message: 'Failed to authenticate' });
    }

    if (!userProfile) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    let team: TeamBasicInfo | null = null;
    if (userProfile.team_id) {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('team_id,name,created_at,description,organizer_id')
        .eq('team_id', userProfile.team_id)
        .maybeSingle();

      if (teamError) {
        console.error(
          '[monkeytype-duel/authenticate] Team query error:',
          teamError
        );
        return res.status(500).json({ message: 'Failed to authenticate' });
      }

      team = teamData ?? null;
    }

    return res.status(200).json({
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      team,
      monkeytype_duel_settings: userProfile.monkeytype_duel_settings ?? {},
    });
  } catch (e) {
    console.error('[monkeytype-duel/authenticate] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
