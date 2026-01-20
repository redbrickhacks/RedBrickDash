import 'reflect-metadata';
import type { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';

type ResponseBody =
  | { message: string }
  | { settings: unknown; updatedAt?: string | null };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const settings = (req.body as { settings?: unknown } | undefined)?.settings;
  // TODO: add validation once schema is known
  if (
    settings == null ||
    typeof settings !== 'object' ||
    Array.isArray(settings)
  ) {
    return res.status(400).json({
      message: '`settings` must be a JSON object',
    });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });

    const { data, error } = await hbc
      .getClient()
      .from('user_profiles')
      .update({ monkeytype_duel_settings: settings })
      .eq('user_id', user.user_id)
      .select('monkeytype_duel_settings,created_at')
      .single();

    if (error) {
      console.error('[dashboard/monkeytype-settings] Update error:', error);
      return res.status(500).json({ message: 'Failed to update settings' });
    }

    return res.status(200).json({
      settings: data.monkeytype_duel_settings,
      updatedAt: data.created_at,
    });
  } catch (e) {
    console.error('[dashboard/monkeytype-settings] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
