import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';

/**
 * Role IDs from the `roles` table:
 *   1 = SUPERADMIN
 *   7 = JUDGE
 */
const ALLOWED_ROLES = [1, 7];

const VALID_DECISIONS = ['finalist', 'waitlist', 'not_selected'] as const;
type FinalDecision = (typeof VALID_DECISIONS)[number];

interface TeamMember {
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface ExportTeam {
  teamId: string;
  teamName: string;
  projectTitle: string | null;
  memberCount: number;
  members: TeamMember[];
}

/**
 * GET /api/judge/export?decision=finalist|waitlist|not_selected
 * Export teams with their members for a given final decision.
 * Only accessible by admins (role=1) and judges (role=7).
 *
 * Returns JSON with team and member details for CSV export.
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

  const decision = req.query.decision as string;

  if (!decision || !VALID_DECISIONS.includes(decision as FinalDecision)) {
    return res.status(400).json({
      message:
        'decision query param must be one of: finalist, waitlist, not_selected',
    });
  }

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Get teams with the specified final decision
    const { data: judgingNotes, error: notesError } = await supabase
      .from('judging_notes')
      .select('team_id')
      .eq('final_decision', decision);

    if (notesError) {
      console.error('[judge/export] Notes fetch error:', notesError);
      return res.status(500).json({ message: 'Failed to fetch decisions' });
    }

    if (!judgingNotes || judgingNotes.length === 0) {
      return res.status(200).json({ teams: [], count: 0 });
    }

    const teamIds = judgingNotes.map((n) => n.team_id);

    // Get team details
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('team_id, name, project_title')
      .in('team_id', teamIds);

    if (teamsError) {
      console.error('[judge/export] Teams fetch error:', teamsError);
      return res.status(500).json({ message: 'Failed to fetch teams' });
    }

    // Get members for these teams
    const { data: members, error: membersError } = await supabase
      .from('user_profiles')
      .select('team_id, first_name, last_name, email')
      .in('team_id', teamIds);

    if (membersError) {
      console.error('[judge/export] Members fetch error:', membersError);
      return res.status(500).json({ message: 'Failed to fetch members' });
    }

    // Group members by team
    const membersByTeam = new Map<string, TeamMember[]>();
    for (const member of members || []) {
      if (!member.team_id) continue;
      const list = membersByTeam.get(member.team_id) || [];
      list.push({
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
      });
      membersByTeam.set(member.team_id, list);
    }

    // Build export data
    const exportTeams: ExportTeam[] = (teams || []).map((team) => {
      const teamMembers = membersByTeam.get(team.team_id) || [];
      return {
        teamId: team.team_id,
        teamName: team.name,
        projectTitle: team.project_title,
        memberCount: teamMembers.length,
        members: teamMembers,
      };
    });

    // Sort by team name
    exportTeams.sort((a, b) => a.teamName.localeCompare(b.teamName));

    return res.status(200).json({
      teams: exportTeams,
      count: exportTeams.length,
      decision,
    });
  } catch (e) {
    console.error('[judge/export] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
