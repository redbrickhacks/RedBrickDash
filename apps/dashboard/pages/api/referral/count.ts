import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';

/**
 * POST /api/referral/count
 * Returns the referral count for the authenticated user.
 * Body: { accessToken: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store');

  try {
    const supabase = container.resolve(HibiscusSupabaseClient);

    // Verify the token and get user ID
    const { data: authData, error: authError } = await supabase
      .getClient()
      .auth.getUser(accessToken);

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = authData.user.id;

    // Use service key to count referrals (bypasses RLS)
    supabase.setOptions({ useServiceKey: true });
    const { count, error } = await supabase
      .getClient()
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by', userId)
      .gte('application_status', 2); // Only count REGISTERED+ users

    if (error) {
      console.error('Referral count error:', error);
      return res.status(500).json({ error: 'Failed to count referrals' });
    }

    return res.status(200).json({ count: count ?? 0 });
  } catch (err) {
    console.error('Referral count error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
