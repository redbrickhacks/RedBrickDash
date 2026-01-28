import 'reflect-metadata';
import type { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';

type ResponseBody =
  | { message: string }
  | {
      updated: number;
      errors: Array<{ user_id: string; message: string; code?: string }>;
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

type SetMonkeytypeWpmBulkResult = {
  updated: number;
  missing: string[];
};

function parseSetMonkeytypeWpmBulkResult(
  data: unknown
): SetMonkeytypeWpmBulkResult {
  if (!isPlainObject(data)) return { updated: 0, missing: [] };
  const updatedRaw = data.updated;
  const missingRaw = data.missing;

  const updated = typeof updatedRaw === 'number' ? updatedRaw : 0;
  const missing = Array.isArray(missingRaw)
    ? missingRaw.filter((v): v is string => typeof v === 'string')
    : [];

  return { updated, missing };
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
      '[monkeytype-duel/update-leaderboard] MONKEYTYPE_DUEL_SECRET is not set'
    );
    return res.status(500).json({ message: 'Server misconfigured' });
  }

  const token = getBearerToken(req);
  if (!token || token !== expectedSecret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Accept:
  // - { updates: [{ user_id: "<uuid>", wpm: 123 }, ...] }
  const payload = isPlainObject(req.body)
    ? (req.body as Record<string, unknown>).updates
    : undefined;

  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({
      message:
        'Body must be { updates: [{ user_id: "<uuid>", wpm: number|null }, ...] }',
    });
  }

  const parsed: Array<{ user_id: string; wpm: number | null }> = [];
  const invalidUserIds: string[] = [];

  for (const item of payload) {
    if (!isPlainObject(item)) {
      return res.status(400).json({
        message:
          'Each update must be an object: { user_id: "<uuid>", wpm: number|null }',
      });
    }

    const user_id = item.user_id;
    const rawWpm = item.wpm;

    if (typeof user_id !== 'string' || user_id.trim().length === 0) continue;
    if (!isUuid(user_id)) {
      invalidUserIds.push(user_id);
      continue;
    }

    // Allow null to clear WPM; otherwise require an integer.
    if (rawWpm === null) {
      parsed.push({ user_id, wpm: null });
      continue;
    }

    if (typeof rawWpm !== 'number' || !Number.isFinite(rawWpm)) {
      return res.status(400).json({
        message: `Invalid wpm for user_id=${user_id}; expected integer (or null)`,
      });
    }
    const wpmInt = Math.trunc(rawWpm);
    if (wpmInt !== rawWpm) {
      return res.status(400).json({
        message: `Invalid wpm for user_id=${user_id}; expected integer (or null)`,
      });
    }
    if (wpmInt < 0) {
      return res.status(400).json({
        message: `Invalid wpm for user_id=${user_id}; must be >= 0`,
      });
    }

    parsed.push({ user_id, wpm: wpmInt });
  }

  if (parsed.length === 0) {
    return res.status(400).json({
      message:
        invalidUserIds.length > 0
          ? `No valid user_ids provided (invalid: ${invalidUserIds
              .slice(0, 10)
              .join(', ')}${invalidUserIds.length > 10 ? ', ...' : ''})`
          : 'No valid user_ids provided',
    });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    const errors: Array<{ user_id: string; message: string; code?: string }> =
      invalidUserIds.map((x) => ({
        user_id: x,
        message: 'Invalid user_id (expected UUID)',
      }));

    const { data, error } = await supabase.rpc('set_monkeytype_wpm_bulk', {
      updates: parsed,
    });

    if (error) {
      console.error('[monkeytype-duel/update-leaderboard] RPC error:', error);
      return res.status(500).json({ message: 'Failed to update leaderboard' });
    }

    const { updated, missing } = parseSetMonkeytypeWpmBulkResult(data);
    errors.push(
      ...missing.map((x) => ({ user_id: x, message: 'User not found' }))
    );

    return res.status(200).json({ updated, errors });
  } catch (e) {
    console.error('[monkeytype-duel/update-leaderboard] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
