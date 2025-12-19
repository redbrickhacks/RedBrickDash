import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

/**
 * Script to update team submission status after review phase.
 * Updates both teams.submission_status and user_profiles.application_status
 * for all team members.
 *
 * Usage:
 *   1. Add team IDs to FINALIST_TEAM_IDS or NOT_SELECTED_TEAM_IDS arrays
 *   2. Run: npx ts-node tools/scripts/set-team-submission-status.ts
 */

// Submission status values (from submission_status table)
const SUBMISSION_STATUS = {
  NOT_SUBMITTED: 1,
  SUBMITTED: 2,
  FINALIST: 3,
  NOT_SELECTED: 4,
};

// Application status values (from application_status table)
const APPLICATION_STATUS = {
  NOT_APPLIED: 1,
  REGISTERED: 2,
  FINALIST: 3,
  CONFIRMED: 4,
  DECLINED: 5,
  NOT_SELECTED: 6,
};

// ============================================
// Configure team IDs below before running
// ============================================

const FINALIST_TEAM_IDS: string[] = [
  // Add team IDs here, e.g.:
  // 'uuid-1234-5678-9012',
  // 'uuid-abcd-efgh-ijkl',
  'dab3b06a-6456-465f-9827-bf99cc411f7b',
];

const NOT_SELECTED_TEAM_IDS: string[] = [
  // Add team IDs here
];

// ============================================

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

async function updateTeamStatus(
  supabase: any,
  teamIds: string[],
  submissionStatus: number,
  applicationStatus: number,
  label: string
) {
  if (teamIds.length === 0) {
    console.log(`No ${label} team IDs provided, skipping.`);
    return;
  }

  console.log(`\nUpdating ${teamIds.length} teams to ${label}...`);

  // Update teams table
  const { error: teamError, data: teamData } = await supabase
    .from('teams')
    .update({ submission_status: submissionStatus })
    .in('team_id', teamIds)
    .select('team_id, name');

  if (teamError) {
    console.error(`Error updating teams: ${teamError.message}`);
    return;
  }

  console.log(`  Teams updated: ${teamData?.length ?? 0}`);
  teamData?.forEach((t: any) => console.log(`    - ${t.name} (${t.team_id})`));

  // Update user_profiles for all team members
  const { error: userError, data: userData } = await supabase
    .from('user_profiles')
    .update({
      application_status: applicationStatus,
      application_status_last_changed: new Date().toISOString(),
    })
    .in('team_id', teamIds)
    .select('user_id, first_name, last_name, email');

  if (userError) {
    console.error(`Error updating users: ${userError.message}`);
    return;
  }

  console.log(`  Users updated: ${userData?.length ?? 0}`);
  userData?.forEach((u: any) =>
    console.log(`    - ${u.first_name} ${u.last_name} (${u.email})`)
  );
}

async function main() {
  const supabase = createSupabaseServiceClient();

  console.log('='.repeat(50));
  console.log('Team Submission Status Update Script');
  console.log('='.repeat(50));

  // Mark finalists
  await updateTeamStatus(
    supabase,
    FINALIST_TEAM_IDS,
    SUBMISSION_STATUS.FINALIST,
    APPLICATION_STATUS.FINALIST,
    'FINALIST'
  );

  // Mark not selected
  await updateTeamStatus(
    supabase,
    NOT_SELECTED_TEAM_IDS,
    SUBMISSION_STATUS.NOT_SELECTED,
    APPLICATION_STATUS.NOT_SELECTED,
    'NOT_SELECTED'
  );

  console.log('\n' + '='.repeat(50));
  console.log('Done!');
  console.log('='.repeat(50));
}

(async () => {
  await main();
  process.exit();
})();
