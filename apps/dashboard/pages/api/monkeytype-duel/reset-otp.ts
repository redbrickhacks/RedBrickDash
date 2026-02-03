import 'reflect-metadata';
import type { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';

type ResponseBody = { message: string } | { otp: string };

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

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });

    const { data: otp, error: otpError } = await hbc
      .getClient()
      .rpc('gen_monkeytype_otp');

    if (otpError || typeof otp !== 'string') {
      console.error(
        '[dashboard/monkeytype-otp/reset] OTP gen error:',
        otpError
      );
      return res.status(500).json({ message: 'Failed to generate OTP' });
    }

    const { data, error } = await hbc
      .getClient()
      .from('user_profiles')
      .update({ monkeytype_duel_otp: otp })
      .eq('user_id', user.user_id)
      .select('monkeytype_duel_otp')
      .single();

    if (error) {
      console.error('[dashboard/monkeytype-otp/reset] Update error:', error);
      return res.status(500).json({ message: 'Failed to reset OTP' });
    }

    return res.status(200).json({ otp: data.monkeytype_duel_otp });
  } catch (e) {
    console.error('[dashboard/monkeytype-otp/reset] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
