import { NextApiRequest } from 'next';
import { container } from 'tsyringe';
import { getEnv } from '@hibiscus/env';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';

/**
 * Extracts and validates the authenticated user from request cookies.
 * Returns the user profile if valid, null otherwise.
 */
export async function getAuthenticatedUser(req: NextApiRequest) {
  const accessToken = req.cookies[getEnv().Hibiscus.Cookies.accessTokenName];

  if (!accessToken) {
    return null;
  }

  const hbc = container.resolve(HibiscusSupabaseClient);
  hbc.setOptions({ useServiceKey: true });
  return hbc.getUserProfile(accessToken);
}
