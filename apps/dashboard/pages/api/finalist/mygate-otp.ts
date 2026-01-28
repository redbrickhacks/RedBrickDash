import { getEnv } from '@hibiscus/env';
import { getCookie } from 'cookies-next';
import { createClient } from '@supabase/supabase-js';
import type { NextApiHandler } from 'next';

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

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await getUserIdFromRequest(req, res);
  if (!userId) return res.status(401).json({ error: 'Invalid session' });

  const service = createServiceClient();
  const profileRes = await service
    .from('user_profiles')
    .select('mygate_otp')
    .eq('user_id', userId)
    .single();

  if (profileRes.error) {
    return res.status(500).json({ error: profileRes.error.message });
  }

  return res.status(200).json({
    data: {
      myGateOtp: profileRes.data?.mygate_otp ?? null,
    },
  });
};

export default handler;
