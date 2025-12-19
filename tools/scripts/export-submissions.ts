import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

/**
 * Script to export submitted teams to CSV for judging.
 * Exports teams with submission_status = SUBMITTED (2).
 *
 * Usage:
 *   npx ts-node tools/scripts/export-submissions.ts
 *
 * Options:
 *   Set OUTPUT_FILE env var to change output filename
 *   Set INCLUDE_ALL env var to "true" to export all teams regardless of status
 */

const SUBMISSION_STATUS = {
  NOT_SUBMITTED: 1,
  SUBMITTED: 2,
  FINALIST: 3,
  NOT_SELECTED: 4,
};

const OUTPUT_FILE = process.env.OUTPUT_FILE || 'submissions-export.csv';
const INCLUDE_ALL = process.env.INCLUDE_ALL === 'true';

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

async function exportSubmissions() {
  const supabase = createSupabaseServiceClient();

  console.log('Fetching submissions...');

  let query = supabase
    .from('teams')
    .select(
      `
      team_id,
      name,
      track_id,
      is_hardware,
      devpost_url,
      pitch_video_url,
      final_submitted_at,
      submission_status,
      tracks (name, sdg_number),
      user_profiles!user_profiles_team_id_fkey (first_name, last_name, email)
    `
    )
    .order('final_submitted_at', { ascending: true, nullsFirst: false });

  if (!INCLUDE_ALL) {
    query = query.eq('submission_status', SUBMISSION_STATUS.SUBMITTED);
  }

  const { data: teams, error } = await query;

  if (error) {
    console.error('Error fetching teams:', error.message);
    process.exit(1);
  }

  if (!teams || teams.length === 0) {
    console.log('No submissions found.');
    process.exit(0);
  }

  console.log(`Found ${teams.length} submissions.`);

  // Build CSV
  const headers = [
    'Team ID',
    'Team Name',
    'Track',
    'SDG Number',
    'Hardware',
    'Devpost URL',
    'Pitch Video URL',
    'Submitted At',
    'Submission Status',
    'Members',
    'Member Emails',
  ];

  const rows = teams.map((team: any) => {
    // Supabase returns single object for 1-to-1 relations, array for 1-to-many
    const track = team.tracks;
    const trackName = track?.name || '';
    const sdgNumber = track?.sdg_number || '';

    const profiles = team.user_profiles || [];
    const members = profiles
      .map((u: any) => `${u.first_name || ''} ${u.last_name || ''}`.trim())
      .filter(Boolean)
      .join('; ');
    const emails = profiles
      .map((u: any) => u.email)
      .filter(Boolean)
      .join('; ');

    const statusLabel =
      Object.entries(SUBMISSION_STATUS).find(
        ([, v]) => v === team.submission_status
      )?.[0] || String(team.submission_status);

    return [
      team.team_id,
      team.name,
      trackName,
      sdgNumber,
      team.is_hardware ? 'Yes' : 'No',
      team.devpost_url,
      team.pitch_video_url,
      team.final_submitted_at,
      statusLabel,
      members,
      emails,
    ].map(escapeCSV);
  });

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  fs.writeFileSync(OUTPUT_FILE, csv);
  console.log(`Exported ${teams.length} submissions to ${OUTPUT_FILE}`);

  // Print summary by track
  console.log('\nSummary by track:');
  const trackCounts: Record<string, number> = {};
  teams.forEach((team: any) => {
    const track = team.tracks?.name || 'No track';
    trackCounts[track] = (trackCounts[track] || 0) + 1;
  });
  Object.entries(trackCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([track, count]) => {
      console.log(`  ${track}: ${count}`);
    });

  const hardwareCount = teams.filter((t: any) => t.is_hardware).length;
  console.log(`\nHardware projects: ${hardwareCount}`);
}

(async () => {
  await exportSubmissions();
  process.exit();
})();
