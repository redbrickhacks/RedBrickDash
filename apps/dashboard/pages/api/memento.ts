import 'reflect-metadata';
import type { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';

type ResponseBody =
  | { message: string }
  | {
      data: unknown;
    };

function getKey(req: NextApiRequest): string | null {
  const raw = (req.body as { key?: unknown } | null | undefined)?.key;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed;
}

function isUuidV4Like(value: string): boolean {
  // Accept any UUID version (v1-v5) to keep this flexible.
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const key = getKey(req);
  if (!key) {
    return res.status(400).json({ message: '`key` is required' });
  }
  if (!isUuidV4Like(key)) {
    return res.status(400).json({ message: '`key` must be a UUID' });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select()
      .eq('memento_uuid', key)
      .maybeSingle();

    if (error) {
      console.error('[api/memento] Profile query error:', error);
      return res.status(500).json({ message: 'Failed to fetch memento' });
    }

    if (!userProfile) {
      return res.status(404).json({ message: 'Memento not found' });
    }

    return res.status(200).json({ data: userProfile });
  } catch (e) {
    console.error('[api/memento] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
