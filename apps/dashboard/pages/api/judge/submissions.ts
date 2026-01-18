import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';

/**
 * Role IDs from the `roles` table:
 *   1 = SUPERADMIN
 *   7 = JUDGE
 * These are checked against user_profiles.role
 */
const ALLOWED_ROLES = [1, 7];

// Pagination defaults (high limit to load all for hackathon scale)
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 1000;

// Type for track data from Supabase join
interface TrackData {
  id: number;
  name: string;
  sdg_number: number;
}

export interface JudgingNotes {
  team_id: string;
  pass_1: 'yes' | 'no' | 'maybe' | null;
  pass_1_problem: number | null;
  pass_1_solution: number | null;
  pass_1_implementation: number | null;
  pass_1_roadmap: number | null;
  pass_1_notes: string | null;
  pass_1_by: string | null;
  pass_1_at: string | null;
  pass_2: 'yes' | 'no' | 'waitlist' | null;
  pass_2_problem: number | null;
  pass_2_solution: number | null;
  pass_2_implementation: number | null;
  pass_2_roadmap: number | null;
  pass_2_notes: string | null;
  pass_2_by: string | null;
  pass_2_at: string | null;
  final_decision: 'finalist' | 'waitlist' | 'not_selected' | null;
  updated_at: string | null;
}

export interface SubmissionForJudging {
  teamId: string;
  teamName: string;
  projectTitle: string | null;
  track: {
    id: number;
    name: string;
    sdgNumber: number;
  } | null;
  isHardware: boolean;
  submission: {
    youtubeUrl: string | null;
    githubUrl: string | null;
    liveUrl: string | null;
    pdfUrl: string | null;
    hwBomUrl: string | null;
    tallyData: Record<string, unknown> | null;
    submittedAt: string | null;
  } | null;
  judgingNotes: JudgingNotes | null;
  pass1Avg: number | null;
  pass2Avg: number | null;
}

export interface SubmissionsResponse {
  submissions: SubmissionForJudging[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * GET /api/judge/submissions
 * Returns submitted teams with their submissions and judging notes.
 * Only accessible by admins (role=1) and judges (role=7).
 *
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 50, max: 100)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return res
      .status(403)
      .json({ message: 'Forbidden: Admin or Judge role required' });
  }

  // Parse pagination params
  const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Get total count of submitted teams
    const { count: totalCount, error: countError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('submission_status', 3);

    if (countError) {
      console.error('[judge/submissions] Count error:', countError);
      return res.status(500).json({ message: 'Failed to count teams' });
    }

    const total = totalCount ?? 0;
    if (total === 0) {
      return res.status(200).json({
        submissions: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    // Get paginated teams with submission_status = 3 (submitted)
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(
        `
        team_id,
        name,
        project_title,
        track_id,
        is_hardware,
        submission_status,
        tracks (
          id,
          name,
          sdg_number
        )
      `
      )
      .eq('submission_status', 3)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (teamsError) {
      console.error('[judge/submissions] Teams fetch error:', teamsError);
      return res.status(500).json({ message: 'Failed to fetch teams' });
    }

    if (!teams || teams.length === 0) {
      return res.status(200).json({
        submissions: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const teamIds = teams.map((t) => t.team_id);

    // Get latest submission for each team
    const { data: submissions, error: submissionsError } = await supabase
      .from('team_submissions')
      .select('*')
      .in('team_id', teamIds)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.error(
        '[judge/submissions] Submissions fetch error:',
        submissionsError
      );
      return res.status(500).json({ message: 'Failed to fetch submissions' });
    }

    // Get judging notes
    const { data: judgingNotes, error: notesError } = await supabase
      .from('judging_notes')
      .select('*')
      .in('team_id', teamIds);

    if (notesError) {
      console.error('[judge/submissions] Notes fetch error:', notesError);
      // Don't fail if judging_notes table doesn't exist yet
    }

    // Build lookup maps
    const latestSubmissionByTeam = new Map<string, (typeof submissions)[0]>();
    for (const sub of submissions || []) {
      if (!latestSubmissionByTeam.has(sub.team_id)) {
        latestSubmissionByTeam.set(sub.team_id, sub);
      }
    }

    const notesByTeam = new Map<string, (typeof judgingNotes)[0]>();
    for (const note of judgingNotes || []) {
      notesByTeam.set(note.team_id, note);
    }

    // Compute averages helper
    const computeAvg = (
      p: number | null,
      s: number | null,
      i: number | null,
      r: number | null
    ): number | null => {
      const scores = [p, s, i, r].filter((x) => x !== null) as number[];
      if (scores.length === 0) return null;
      return (
        Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10
      );
    };

    // Helper to safely extract track data from Supabase join result
    const extractTrack = (
      tracks: unknown
    ): { id: number; name: string; sdgNumber: number } | null => {
      if (!tracks || typeof tracks !== 'object') return null;
      const t = tracks as Record<string, unknown>;
      if (
        typeof t.id === 'number' &&
        typeof t.name === 'string' &&
        typeof t.sdg_number === 'number'
      ) {
        return { id: t.id, name: t.name, sdgNumber: t.sdg_number };
      }
      return null;
    };

    // Build response
    const result: SubmissionForJudging[] = teams.map((team) => {
      const sub = latestSubmissionByTeam.get(team.team_id);
      const notes = notesByTeam.get(team.team_id);

      return {
        teamId: team.team_id,
        teamName: team.name,
        projectTitle: team.project_title,
        track: extractTrack(team.tracks),
        isHardware: team.is_hardware ?? false,
        submission: sub
          ? {
              youtubeUrl: sub.youtube_url,
              githubUrl: sub.github_url,
              liveUrl: sub.live_url,
              pdfUrl: sub.pdf_url,
              hwBomUrl: sub.hw_bom_url ?? null,
              tallyData: sub.tally_data as Record<string, unknown> | null,
              submittedAt: sub.submitted_at,
            }
          : null,
        judgingNotes: notes
          ? {
              team_id: notes.team_id,
              pass_1: notes.pass_1,
              pass_1_problem: notes.pass_1_problem,
              pass_1_solution: notes.pass_1_solution,
              pass_1_implementation: notes.pass_1_implementation,
              pass_1_roadmap: notes.pass_1_roadmap,
              pass_1_notes: notes.pass_1_notes,
              pass_1_by: notes.pass_1_by,
              pass_1_at: notes.pass_1_at,
              pass_2: notes.pass_2,
              pass_2_problem: notes.pass_2_problem,
              pass_2_solution: notes.pass_2_solution,
              pass_2_implementation: notes.pass_2_implementation,
              pass_2_roadmap: notes.pass_2_roadmap,
              pass_2_notes: notes.pass_2_notes,
              pass_2_by: notes.pass_2_by,
              pass_2_at: notes.pass_2_at,
              final_decision: notes.final_decision,
              updated_at: notes.updated_at,
            }
          : null,
        pass1Avg: notes
          ? computeAvg(
              notes.pass_1_problem,
              notes.pass_1_solution,
              notes.pass_1_implementation,
              notes.pass_1_roadmap
            )
          : null,
        pass2Avg: notes
          ? computeAvg(
              notes.pass_2_problem,
              notes.pass_2_solution,
              notes.pass_2_implementation,
              notes.pass_2_roadmap
            )
          : null,
      };
    });

    // Results are already sorted by team name from the database query

    return res.status(200).json({
      submissions: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as SubmissionsResponse);
  } catch (e) {
    console.error('[judge/submissions] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
