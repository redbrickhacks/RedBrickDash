import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

/**
 * Script to check Discord verification status of registered users.
 * Shows who has/hasn't verified their Discord account.
 *
 * Usage:
 *   npx ts-node tools/scripts/check-discord-verification.ts
 *
 * Options:
 *   SHOW_VERIFIED=true    Show verified users instead of unverified
 *   ROLE=5                Filter by role (5=HACKER, 2=TEAM_MEMBER, etc.)
 *   STATUS=4              Filter by application status (2=REGISTERED, 4=CONFIRMED, etc.)
 *   OUTPUT_FILE=file.csv  Export to CSV file
 */

const APPLICATION_STATUS = {
  NOT_APPLIED: 1,
  REGISTERED: 2,
  FINALIST: 3,
  CONFIRMED: 4,
  DECLINED: 5,
  NOT_SELECTED: 6,
};

const ROLES = {
  SUPERADMIN: 1,
  TEAM_MEMBER: 2,
  SPONSOR: 3,
  VOLUNTEER: 4,
  HACKER: 5,
  APPLICANT: 6,
  JUDGE: 7,
};

const STATUS_LABELS = Object.fromEntries(
  Object.entries(APPLICATION_STATUS).map(([k, v]) => [v, k])
);

const ROLE_LABELS = Object.fromEntries(
  Object.entries(ROLES).map(([k, v]) => [v, k])
);

function createSupabaseServiceClient() {
  const apiUrl = process.env.NEXT_PUBLIC_HIBISCUS_SUPABASE_API_URL;
  const serviceKey = process.env.HIBISCUS_SUPABASE_SERVICE_KEY;

  if (!apiUrl || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_HIBISCUS_SUPABASE_API_URL or HIBISCUS_SUPABASE_SERVICE_KEY in .env'
    );
  }

  return createClient(apiUrl, serviceKey);
}

function escapeCSV(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: number;
  application_status: number;
  discord_profiles: {
    discord_user_id: string;
    discord_username: string;
    verified_at: string;
  } | null;
}

async function getUsers(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  options: { role?: number; status?: number }
) {
  let query = supabase
    .from('user_profiles')
    .select(
      `
      user_id,
      email,
      first_name,
      last_name,
      role,
      application_status,
      discord_profiles (
        discord_user_id,
        discord_username,
        verified_at
      )
    `
    )
    .gte('application_status', APPLICATION_STATUS.REGISTERED) // At least registered
    .order('application_status', { ascending: false })
    .order('email', { ascending: true });

  if (options.role) {
    query = query.eq('role', options.role);
  }

  if (options.status) {
    query = query.eq('application_status', options.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching users:', error.message);
    process.exit(1);
  }

  return (data || []) as UserProfile[];
}

async function checkDiscordVerification() {
  const supabase = createSupabaseServiceClient();

  const showVerified = process.env.SHOW_VERIFIED === 'true';
  const roleFilter = process.env.ROLE
    ? parseInt(process.env.ROLE, 10)
    : undefined;
  const statusFilter = process.env.STATUS
    ? parseInt(process.env.STATUS, 10)
    : undefined;
  const outputFile = process.env.OUTPUT_FILE;

  console.log('Fetching user profiles...');

  const allUsers = await getUsers(supabase, {
    role: roleFilter,
    status: statusFilter,
  });

  const verified = allUsers.filter((u) => u.discord_profiles !== null);
  const unverified = allUsers.filter((u) => u.discord_profiles === null);

  const targetUsers = showVerified ? verified : unverified;

  console.log(`\nTotal registered users: ${allUsers.length}`);
  console.log(`  Verified on Discord: ${verified.length}`);
  console.log(`  Not verified: ${unverified.length}`);
  console.log(
    `  Verification rate: ${((verified.length / allUsers.length) * 100).toFixed(
      1
    )}%\n`
  );

  if (outputFile) {
    // CSV export
    const headers = showVerified
      ? [
          'email',
          'first_name',
          'last_name',
          'role',
          'status',
          'discord_username',
          'verified_at',
        ]
      : ['email', 'first_name', 'last_name', 'role', 'status'];

    const rows = targetUsers.map((user) => {
      const base = [
        user.email,
        user.first_name,
        user.last_name,
        ROLE_LABELS[user.role] || String(user.role),
        STATUS_LABELS[user.application_status] ||
          String(user.application_status),
      ];

      if (showVerified && user.discord_profiles) {
        base.push(user.discord_profiles.discord_username);
        base.push(user.discord_profiles.verified_at);
      }

      return base.map(escapeCSV);
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    fs.writeFileSync(outputFile, csv);
    console.log(`Exported ${targetUsers.length} users to ${outputFile}`);
  } else {
    // Console output
    const label = showVerified ? 'Verified Users' : 'Unverified Users';
    console.log(`${label}: ${targetUsers.length}\n`);
    console.log('─'.repeat(80));

    for (const user of targetUsers) {
      console.log(user.email);
      console.log(`  Name: ${user.first_name} ${user.last_name}`);
      console.log(
        `  Role: ${ROLE_LABELS[user.role]} | Status: ${
          STATUS_LABELS[user.application_status]
        }`
      );
      if (showVerified && user.discord_profiles) {
        const dp = user.discord_profiles;
        console.log(
          `  Discord: @${dp.discord_username} (verified ${new Date(
            dp.verified_at
          ).toLocaleDateString()})`
        );
      }
      console.log('');
    }
  }

  // Summary by role
  console.log('\nBreakdown by role:');
  const byRole: Record<string, { verified: number; total: number }> = {};
  for (const user of allUsers) {
    const role = ROLE_LABELS[user.role] || String(user.role);
    if (!byRole[role]) {
      byRole[role] = { verified: 0, total: 0 };
    }
    byRole[role].total++;
    if (user.discord_profiles) {
      byRole[role].verified++;
    }
  }
  Object.entries(byRole)
    .sort(([, a], [, b]) => b.total - a.total)
    .forEach(([role, counts]) => {
      const pct = ((counts.verified / counts.total) * 100).toFixed(0);
      console.log(`  ${role}: ${counts.verified}/${counts.total} (${pct}%)`);
    });

  // Summary by status
  console.log('\nBreakdown by application status:');
  const byStatus: Record<string, { verified: number; total: number }> = {};
  for (const user of allUsers) {
    const status =
      STATUS_LABELS[user.application_status] || String(user.application_status);
    if (!byStatus[status]) {
      byStatus[status] = { verified: 0, total: 0 };
    }
    byStatus[status].total++;
    if (user.discord_profiles) {
      byStatus[status].verified++;
    }
  }
  Object.entries(byStatus)
    .sort(([a], [b]) => {
      const aNum =
        APPLICATION_STATUS[a as keyof typeof APPLICATION_STATUS] || 99;
      const bNum =
        APPLICATION_STATUS[b as keyof typeof APPLICATION_STATUS] || 99;
      return aNum - bNum;
    })
    .forEach(([status, counts]) => {
      const pct = ((counts.verified / counts.total) * 100).toFixed(0);
      console.log(`  ${status}: ${counts.verified}/${counts.total} (${pct}%)`);
    });
}

(async () => {
  await checkDiscordVerification();
  process.exit();
})();
