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

// Reviewer caps per pass
const PASS_1_MAX_REVIEWERS = 4;
const PASS_2_MAX_REVIEWERS = 3;

// Type for track data from Supabase join
interface TrackData {
  id: number;
  name: string;
  sdg_number: number;
}

// Legacy JudgingNotes type (kept for backward compatibility)
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

// New multi-reviewer types
export interface ReviewerScore {
  judgeId: string | null;
  judgeName: string | null;
  problem: number | null;
  solution: number | null;
  implementation: number | null;
  roadmap: number | null;
  decision: string | null;
  notes: string | null;
  avgScore: number | null;
}

export interface PassAggregate {
  reviewCount: number;
  maxReviewers: number;
  avgProblem: number | null;
  avgSolution: number | null;
  avgImplementation: number | null;
  avgRoadmap: number | null;
  avgTotal: number | null;
  decisions: Record<string, number>;
  consensus: string | null;
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
  // New multi-reviewer data
  pass1: { scores: ReviewerScore[]; aggregate: PassAggregate };
  pass2: { scores: ReviewerScore[]; aggregate: PassAggregate };
  myPass1Score: ReviewerScore | null;
  myPass2Score: ReviewerScore | null;
  finalDecision: string | null;
  // Legacy fields (kept for backward compatibility during transition)
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
      .eq('submission_status', 2);

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

    // Get paginated teams with submission_status = 2 (SUBMITTED)
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
      .eq('submission_status', 2)
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

    // Get judging notes (for final_decision and backward compatibility)
    const { data: judgingNotes, error: notesError } = await supabase
      .from('judging_notes')
      .select('*')
      .in('team_id', teamIds);

    if (notesError) {
      console.error('[judge/submissions] Notes fetch error:', notesError);
    }

    // Get judging scores (multi-reviewer)
    const { data: judgingScores, error: scoresError } = await supabase
      .from('judging_scores')
      .select('*')
      .in('team_id', teamIds);

    if (scoresError) {
      console.error('[judge/submissions] Scores fetch error:', scoresError);
    }

    // Get judge names for display
    const judgeIds = [
      ...new Set(
        (judgingScores || [])
          .map((s) => s.judge_id)
          .filter((id): id is string => id !== null)
      ),
    ];
    const judgeNameMap = new Map<string, string>();
    if (judgeIds.length > 0) {
      const { data: judges } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', judgeIds);

      for (const judge of judges || []) {
        const name = [judge.first_name, judge.last_name]
          .filter(Boolean)
          .join(' ');
        judgeNameMap.set(judge.user_id, name || 'Unknown');
      }
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

    // Group scores by team and pass
    type ScoreRow = (typeof judgingScores)[0];
    const scoresByTeamPass = new Map<
      string,
      { pass1: ScoreRow[]; pass2: ScoreRow[] }
    >();
    for (const score of judgingScores || []) {
      const key = score.team_id;
      if (!scoresByTeamPass.has(key)) {
        scoresByTeamPass.set(key, { pass1: [], pass2: [] });
      }
      const entry = scoresByTeamPass.get(key)!;
      if (score.pass === 1) {
        entry.pass1.push(score);
      } else if (score.pass === 2) {
        entry.pass2.push(score);
      }
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

    // Compute aggregate average from array of numbers
    const computeArrayAvg = (values: (number | null)[]): number | null => {
      const nums = values.filter((x): x is number => x !== null);
      if (nums.length === 0) return null;
      return (
        Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
      );
    };

    // Consensus logic for Pass 1 (4 reviewers): yes/no/maybe
    const computePass1Consensus = (decisions: string[]): string | null => {
      if (decisions.length === 0) return null;
      const counts = { yes: 0, no: 0, maybe: 0 };
      for (const d of decisions) {
        if (d === 'yes' || d === 'no' || d === 'maybe') {
          counts[d]++;
        }
      }
      if (counts.yes > counts.no + counts.maybe) return 'yes';
      if (counts.no > counts.yes + counts.maybe) return 'no';
      if (counts.yes + counts.maybe > counts.no) return 'maybe';
      return 'no';
    };

    // Consensus logic for Pass 2 (3 reviewers): yes/no/waitlist
    const computePass2Consensus = (decisions: string[]): string | null => {
      if (decisions.length === 0) return null;
      const counts = { yes: 0, no: 0, waitlist: 0 };
      for (const d of decisions) {
        if (d === 'yes' || d === 'no' || d === 'waitlist') {
          counts[d]++;
        }
      }
      if (counts.yes >= 2) return 'yes';
      if (counts.no >= 2) return 'no';
      if (counts.waitlist >= 2) return 'waitlist';
      return counts.yes > 0 ? 'waitlist' : 'no';
    };

    // Build ReviewerScore from a score row
    const buildReviewerScore = (score: ScoreRow): ReviewerScore => ({
      judgeId: score.judge_id,
      judgeName: score.judge_id
        ? judgeNameMap.get(score.judge_id) || null
        : null,
      problem: score.problem,
      solution: score.solution,
      implementation: score.implementation,
      roadmap: score.roadmap,
      decision: score.decision,
      notes: score.notes,
      avgScore: computeAvg(
        score.problem,
        score.solution,
        score.implementation,
        score.roadmap
      ),
    });

    // Build PassAggregate from array of scores
    const buildPassAggregate = (
      scores: ScoreRow[],
      maxReviewers: number,
      computeConsensus: (decisions: string[]) => string | null
    ): PassAggregate => {
      const decisions = scores
        .map((s) => s.decision)
        .filter((d): d is string => d !== null);

      const decisionCounts: Record<string, number> = {};
      for (const d of decisions) {
        decisionCounts[d] = (decisionCounts[d] || 0) + 1;
      }

      return {
        reviewCount: scores.length,
        maxReviewers,
        avgProblem: computeArrayAvg(scores.map((s) => s.problem)),
        avgSolution: computeArrayAvg(scores.map((s) => s.solution)),
        avgImplementation: computeArrayAvg(scores.map((s) => s.implementation)),
        avgRoadmap: computeArrayAvg(scores.map((s) => s.roadmap)),
        avgTotal: computeArrayAvg(
          scores.map((s) =>
            computeAvg(s.problem, s.solution, s.implementation, s.roadmap)
          )
        ),
        decisions: decisionCounts,
        consensus: computeConsensus(decisions),
      };
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
      const teamScores = scoresByTeamPass.get(team.team_id) || {
        pass1: [],
        pass2: [],
      };

      // Find current user's scores
      const myPass1 = teamScores.pass1.find((s) => s.judge_id === user.user_id);
      const myPass2 = teamScores.pass2.find((s) => s.judge_id === user.user_id);

      // Build pass aggregates
      const pass1 = {
        scores: teamScores.pass1.map(buildReviewerScore),
        aggregate: buildPassAggregate(
          teamScores.pass1,
          PASS_1_MAX_REVIEWERS,
          computePass1Consensus
        ),
      };
      const pass2 = {
        scores: teamScores.pass2.map(buildReviewerScore),
        aggregate: buildPassAggregate(
          teamScores.pass2,
          PASS_2_MAX_REVIEWERS,
          computePass2Consensus
        ),
      };

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
        // New multi-reviewer data
        pass1,
        pass2,
        myPass1Score: myPass1 ? buildReviewerScore(myPass1) : null,
        myPass2Score: myPass2 ? buildReviewerScore(myPass2) : null,
        finalDecision: notes?.final_decision ?? null,
        // Legacy fields (for backward compatibility)
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
        pass1Avg: pass1.aggregate.avgTotal,
        pass2Avg: pass2.aggregate.avgTotal,
      };
    });

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
