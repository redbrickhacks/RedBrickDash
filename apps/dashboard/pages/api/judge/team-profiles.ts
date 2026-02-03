import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getAuthenticatedUser } from '../../../common/auth';
import { getEnv } from '@hibiscus/env';

const ALLOWED_ROLES = [1, 7]; // SUPERADMIN, JUDGE

// Field mappings from Tally question titles to our keys
// Note: Duplicated from tally-profile.ts - consider extracting to shared util
const FIELD_MAPPINGS: Record<string, string> = {
  'What is your name?': 'firstName',
  'Last Name': 'lastName',
  'Phone number': 'phone',
  'Date of Birth': 'dateOfBirth',
  Gender: 'gender',
  'What university do you attend?': 'university',
  'What program are you in?': 'program',
  'What is your major or primary field of study (Branch/Specialisation)?':
    'major',
  'Graduation year?': 'graduationYear',
  'What state are you from?': 'state',
  'What is your country of residence?': 'country',
  'Devpost Profile URL': 'devpostUrl',
  'GitHub URL': 'githubUrl',
  'LinkedIn URL': 'linkedinUrl',
  'Twitter URL (if any)': 'twitterUrl',
  'Personal Portfolio (if any)': 'portfolioUrl',
};

interface TallyProfile {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  university: string | null;
  program: string | null;
  major: string | null;
  graduationYear: string | null;
  state: string | null;
  country: string | null;
  devpostUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  portfolioUrl: string | null;
}

interface MemberProfile {
  userId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  appId: string | null;
  tallyProfile: TallyProfile | null;
  tallyError: string | null;
}

/**
 * GET /api/judge/team-profiles?teamId=xxx
 * Fetches all team members with their Tally profile data.
 * Only accessible by admins (role=1) and judges (role=7).
 *
 * Note: Makes parallel Tally API calls (one per member with app_id).
 * Max team size is 4, so this is acceptable. For larger batches,
 * consider implementing request throttling.
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

  const teamId = req.query.teamId as string;
  if (!teamId) {
    return res.status(400).json({ message: 'teamId query param is required' });
  }

  // Get Tally config upfront
  const tallyFormUrl = getEnv().Hibiscus.Hackform.TallyApps2024Url;
  const tallyApiToken = getEnv().Hibiscus.Hackform.TallyAPIToken;
  const formIdMatch = tallyFormUrl?.match(/tally\.so\/r\/([^?&/]+)/);
  const formId = formIdMatch?.[1];
  const tallyConfigured = !!(formId && tallyApiToken);

  try {
    const hbc = container.resolve(HibiscusSupabaseClient);
    hbc.setOptions({ useServiceKey: true });
    const supabase = hbc.getClient();

    // Fetch team members
    const { data: members, error: membersError } = await supabase
      .from('user_profiles')
      .select('user_id, email, first_name, last_name, app_id')
      .eq('team_id', teamId);

    if (membersError) {
      console.error('[team-profiles] Members fetch error:', membersError);
      return res.status(500).json({ message: 'Failed to fetch team members' });
    }

    if (!members || members.length === 0) {
      return res.status(200).json({ teamId, members: [] });
    }

    // Fetch Tally profiles in parallel for members with app_id
    const memberProfiles: MemberProfile[] = await Promise.all(
      members.map(async (member) => {
        const base: MemberProfile = {
          userId: member.user_id,
          email: member.email,
          firstName: member.first_name,
          lastName: member.last_name,
          appId: member.app_id,
          tallyProfile: null,
          tallyError: null,
        };

        // Skip Tally fetch if no app_id or Tally not configured
        if (!member.app_id) {
          base.tallyError = 'No application ID';
          return base;
        }

        if (!tallyConfigured) {
          base.tallyError = 'Tally not configured';
          return base;
        }

        try {
          const tallyResponse = await fetch(
            `https://api.tally.so/forms/${formId}/submissions/${member.app_id}`,
            {
              headers: { Authorization: `Bearer ${tallyApiToken}` },
            }
          );

          if (!tallyResponse.ok) {
            base.tallyError = `Tally API error: ${tallyResponse.status}`;
            return base;
          }

          const tallyData = await tallyResponse.json();
          const questions = tallyData.questions || [];
          const responses = tallyData.submission?.responses || [];

          // Build questionId → title map
          const questionTitleMap = new Map<string, string>();
          for (const q of questions) {
            if (q.id && q.title) {
              questionTitleMap.set(q.id, q.title);
            }
          }

          base.tallyProfile = parseProfile(responses, questionTitleMap);
          return base;
        } catch (e) {
          base.tallyError = e instanceof Error ? e.message : 'Unknown error';
          return base;
        }
      })
    );

    return res.status(200).json({
      teamId,
      members: memberProfiles,
      _meta: { tallyConfigured },
    });
  } catch (e) {
    console.error('[team-profiles] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

interface TallyResponseItem {
  questionId: string;
  answer: unknown;
}

function parseProfile(
  responses: TallyResponseItem[],
  questionTitleMap: Map<string, string>
): TallyProfile {
  const profile: TallyProfile = {
    firstName: null,
    lastName: null,
    phone: null,
    dateOfBirth: null,
    gender: null,
    university: null,
    program: null,
    major: null,
    graduationYear: null,
    state: null,
    country: null,
    devpostUrl: null,
    githubUrl: null,
    linkedinUrl: null,
    twitterUrl: null,
    portfolioUrl: null,
  };

  for (const response of responses) {
    const questionTitle = questionTitleMap.get(response.questionId);
    if (!questionTitle) continue;

    const mappedKey = FIELD_MAPPINGS[questionTitle];
    if (mappedKey && mappedKey in profile) {
      profile[mappedKey as keyof TallyProfile] = extractAnswer(response.answer);
    }
  }

  return profile;
}

function extractAnswer(answer: unknown): string | null {
  if (answer === null || answer === undefined) return null;
  if (typeof answer === 'string') return answer || null;
  if (Array.isArray(answer)) {
    if (answer.length === 0) return null;
    if (typeof answer[0] === 'string') return answer.join(', ');
    return JSON.stringify(answer[0]);
  }
  if (typeof answer === 'object') {
    const values = Object.values(answer as Record<string, unknown>);
    if (values.length === 1 && typeof values[0] === 'string') return values[0];
    return JSON.stringify(answer);
  }
  return String(answer);
}
