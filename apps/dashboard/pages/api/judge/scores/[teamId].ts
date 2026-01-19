import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../../common/auth';

/**
 * Role IDs from the `roles` table:
 *   1 = SUPERADMIN
 *   7 = JUDGE
 * These are checked against user_profiles.role
 */
const ALLOWED_ROLES = [1, 7];

// Submission status that allows judging
const SUBMITTED_STATUS = 3;

// Reviewer caps per pass
const PASS_1_MAX_REVIEWERS = 4;
const PASS_2_MAX_REVIEWERS = 3;

interface ScoreUpdateRequest {
  pass: 1 | 2;
  problem?: number | null;
  solution?: number | null;
  implementation?: number | null;
  roadmap?: number | null;
  decision?: string | null;
  notes?: string | null;
}

interface ReviewerScore {
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

interface PassAggregate {
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

/**
 * PATCH /api/judge/scores/[teamId]
 * Upserts a judge's score for a team's pass.
 * Only accessible by admins (role=1) and judges (role=7).
 *
 * Enforces reviewer caps:
 *   - Pass 1: max 4 reviewers
 *   - Pass 2: max 3 reviewers
 *
 * Request body: ScoreUpdateRequest
 * Response: { score: ReviewerScore, aggregate: PassAggregate }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
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

  const { teamId } = req.query;
  if (!teamId || typeof teamId !== 'string') {
    return res.status(400).json({ message: 'teamId is required' });
  }

  const body: ScoreUpdateRequest = req.body;

  // Validate pass
  if (body.pass !== 1 && body.pass !== 2) {
    return res.status(400).json({ message: 'pass must be 1 or 2' });
  }

  // Validate score values (1-5 if provided)
  const scoreFields = [
    'problem',
    'solution',
    'implementation',
    'roadmap',
  ] as const;
  for (const field of scoreFields) {
    const value = body[field];
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return res
          .status(400)
          .json({ message: `${field} must be between 1 and 5` });
      }
    }
  }

  // Validate decision values based on pass
  if (body.decision !== undefined && body.decision !== null) {
    const validPass1Decisions = ['yes', 'no', 'maybe'];
    const validPass2Decisions = ['yes', 'no', 'waitlist'];
    const validDecisions =
      body.pass === 1 ? validPass1Decisions : validPass2Decisions;

    if (!validDecisions.includes(body.decision)) {
      return res.status(400).json({
        message: `decision must be one of: ${validDecisions.join(', ')}`,
      });
    }
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Verify team exists and has submitted
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('team_id, submission_status')
      .eq('team_id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.submission_status !== SUBMITTED_STATUS) {
      return res.status(400).json({
        message:
          'Team has not submitted yet. Only submitted teams can be judged.',
      });
    }

    // Check reviewer cap
    const maxReviewers =
      body.pass === 1 ? PASS_1_MAX_REVIEWERS : PASS_2_MAX_REVIEWERS;
    const { data: existingScores, error: scoresError } = await supabase
      .from('judging_scores')
      .select('judge_id')
      .eq('team_id', teamId)
      .eq('pass', body.pass);

    if (scoresError) {
      console.error('[judge/scores] Scores fetch error:', scoresError);
      return res
        .status(500)
        .json({ message: 'Failed to check existing scores' });
    }

    const existingJudgeIds = (existingScores || []).map((s) => s.judge_id);
    const userAlreadyScored = existingJudgeIds.includes(user.user_id);

    // If user hasn't scored yet and cap is reached, reject
    if (
      !userAlreadyScored &&
      existingScores &&
      existingScores.length >= maxReviewers
    ) {
      return res.status(409).json({
        message: `Pass ${body.pass} already has ${maxReviewers} reviewers. Cannot add more.`,
        reviewCount: existingScores.length,
        maxReviewers,
      });
    }

    // Build upsert payload
    const payload: Record<string, unknown> = {
      team_id: teamId,
      judge_id: user.user_id,
      pass: body.pass,
    };

    // Add score fields if provided
    for (const field of scoreFields) {
      if (body[field] !== undefined) {
        payload[field] = body[field];
      }
    }

    if (body.decision !== undefined) {
      payload.decision = body.decision;
    }

    if (body.notes !== undefined) {
      payload.notes = body.notes;
    }

    // Upsert the score
    const { error: upsertError } = await supabase
      .from('judging_scores')
      .upsert(payload, { onConflict: 'team_id,judge_id,pass' });

    if (upsertError) {
      console.error('[judge/scores] Upsert error:', upsertError);
      return res.status(500).json({ message: 'Failed to save score' });
    }

    // Fetch all scores for this team/pass to compute aggregate
    const { data: allScores, error: fetchError } = await supabase
      .from('judging_scores')
      .select('*')
      .eq('team_id', teamId)
      .eq('pass', body.pass);

    if (fetchError) {
      console.error('[judge/scores] Fetch error:', fetchError);
      return res.status(500).json({
        message: 'Score saved but failed to fetch updated data',
      });
    }

    // Get judge names
    const judgeIds = [
      ...new Set(
        (allScores || [])
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

    // Helper functions
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

    const computeArrayAvg = (values: (number | null)[]): number | null => {
      const nums = values.filter((x): x is number => x !== null);
      if (nums.length === 0) return null;
      return (
        Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
      );
    };

    const computePass1Consensus = (decisions: string[]): string | null => {
      if (decisions.length === 0) return null;
      const counts = { yes: 0, no: 0, maybe: 0 };
      for (const d of decisions) {
        if (d === 'yes' || d === 'no' || d === 'maybe') counts[d]++;
      }
      if (counts.yes > counts.no + counts.maybe) return 'yes';
      if (counts.no > counts.yes + counts.maybe) return 'no';
      if (counts.yes + counts.maybe > counts.no) return 'maybe';
      return 'no';
    };

    const computePass2Consensus = (decisions: string[]): string | null => {
      if (decisions.length === 0) return null;
      const counts = { yes: 0, no: 0, waitlist: 0 };
      for (const d of decisions) {
        if (d === 'yes' || d === 'no' || d === 'waitlist') counts[d]++;
      }
      if (counts.yes >= 2) return 'yes';
      if (counts.no >= 2) return 'no';
      if (counts.waitlist >= 2) return 'waitlist';
      return counts.yes > 0 ? 'waitlist' : 'no';
    };

    // Build scores array
    const scores: ReviewerScore[] = (allScores || []).map((s) => ({
      judgeId: s.judge_id,
      judgeName: s.judge_id ? judgeNameMap.get(s.judge_id) || null : null,
      problem: s.problem,
      solution: s.solution,
      implementation: s.implementation,
      roadmap: s.roadmap,
      decision: s.decision,
      notes: s.notes,
      avgScore: computeAvg(s.problem, s.solution, s.implementation, s.roadmap),
    }));

    // Build aggregate
    const decisions = (allScores || [])
      .map((s) => s.decision)
      .filter((d): d is string => d !== null);

    const decisionCounts: Record<string, number> = {};
    for (const d of decisions) {
      decisionCounts[d] = (decisionCounts[d] || 0) + 1;
    }

    const computeConsensus =
      body.pass === 1 ? computePass1Consensus : computePass2Consensus;

    const aggregate: PassAggregate = {
      reviewCount: (allScores || []).length,
      maxReviewers,
      avgProblem: computeArrayAvg((allScores || []).map((s) => s.problem)),
      avgSolution: computeArrayAvg((allScores || []).map((s) => s.solution)),
      avgImplementation: computeArrayAvg(
        (allScores || []).map((s) => s.implementation)
      ),
      avgRoadmap: computeArrayAvg((allScores || []).map((s) => s.roadmap)),
      avgTotal: computeArrayAvg(
        (allScores || []).map((s) =>
          computeAvg(s.problem, s.solution, s.implementation, s.roadmap)
        )
      ),
      decisions: decisionCounts,
      consensus: computeConsensus(decisions),
    };

    // Find user's score
    const myScore = scores.find((s) => s.judgeId === user.user_id) || null;

    return res.status(200).json({
      score: myScore,
      scores,
      aggregate,
    });
  } catch (e) {
    console.error('[judge/scores] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
