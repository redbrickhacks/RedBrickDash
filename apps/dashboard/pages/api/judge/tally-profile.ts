import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '../../../common/auth';
import { getEnv } from '@hibiscus/env';

/**
 * Role IDs from the `roles` table:
 *   1 = SUPERADMIN
 *   7 = JUDGE
 */
const ALLOWED_ROLES = [1, 7];

// Fields we want to extract from Tally response
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

interface ParsedProfile {
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

/**
 * GET /api/judge/tally-profile?appId=xxx
 * Fetches personal info from Tally API for a given application ID.
 * Only accessible by admins (role=1) and judges (role=7).
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

  const appId = req.query.appId as string;
  if (!appId) {
    return res.status(400).json({ message: 'appId query param is required' });
  }

  // Get Tally form ID from env (extract from URL if needed)
  const tallyFormUrl = getEnv().Hibiscus.Hackform.TallyApps2024Url;
  const tallyApiToken = getEnv().Hibiscus.Hackform.TallyAPIToken;

  if (!tallyApiToken) {
    return res.status(500).json({ message: 'Tally API token not configured' });
  }

  // Extract form ID from URL (format: https://tally.so/r/FORM_ID?...)
  const formIdMatch = tallyFormUrl?.match(/tally\.so\/r\/([^?&/]+)/);
  const formId = formIdMatch?.[1];

  if (!formId) {
    return res.status(500).json({ message: 'Tally form ID not configured' });
  }

  try {
    // Fetch submission from Tally API
    const tallyResponse = await fetch(
      `https://api.tally.so/forms/${formId}/submissions/${appId}`,
      {
        headers: {
          Authorization: `Bearer ${tallyApiToken}`,
        },
      }
    );

    if (!tallyResponse.ok) {
      if (tallyResponse.status === 404) {
        return res.status(404).json({ message: 'Application not found' });
      }
      console.error(
        '[tally-profile] Tally API error:',
        tallyResponse.status,
        await tallyResponse.text()
      );
      return res.status(502).json({ message: 'Failed to fetch from Tally' });
    }

    const tallyData = await tallyResponse.json();

    // Tally API returns:
    // - questions[]: question definitions with id and title
    // - submission.responses[]: answers with questionId and answer
    const questions = tallyData.questions || [];
    const responses = tallyData.submission?.responses || [];

    if (!Array.isArray(questions) || !Array.isArray(responses)) {
      console.error(
        '[tally-profile] Unexpected structure:',
        Object.keys(tallyData)
      );
      return res.status(200).json({
        appId,
        profile: null,
        _debug: {
          message: 'Unexpected Tally response structure',
          keys: Object.keys(tallyData),
        },
      });
    }

    // Build questionId → title map
    const questionTitleMap = new Map<string, string>();
    for (const q of questions) {
      if (q.id && q.title) {
        questionTitleMap.set(q.id, q.title);
      }
    }

    // Parse responses using question titles
    const profile = parseProfileFromResponses(responses, questionTitleMap);

    // Find unmapped questions (for debugging)
    const mappedTitles = new Set(Object.keys(FIELD_MAPPINGS));
    const unmappedFields = questions
      .filter((q: { title: string }) => q.title && !mappedTitles.has(q.title))
      .map((q: { title: string }) => q.title);

    return res.status(200).json({
      appId,
      profile,
      _debug: {
        questionCount: questions.length,
        responseCount: responses.length,
        unmappedFields,
      },
    });
  } catch (e) {
    console.error('[tally-profile] Error:', e);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

interface TallyResponse {
  questionId: string;
  answer: unknown;
}

function parseProfileFromResponses(
  responses: TallyResponse[],
  questionTitleMap: Map<string, string>
): ParsedProfile {
  const profile: ParsedProfile = {
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
      profile[mappedKey as keyof ParsedProfile] = extractAnswer(
        response.answer
      );
    }
  }

  return profile;
}

function extractAnswer(answer: unknown): string | null {
  if (answer === null || answer === undefined) {
    return null;
  }

  // Handle string answers
  if (typeof answer === 'string') {
    return answer || null;
  }

  // Handle array answers (dropdowns, multi-select)
  if (Array.isArray(answer)) {
    if (answer.length === 0) return null;
    if (typeof answer[0] === 'string') {
      return answer.join(', ');
    }
    return JSON.stringify(answer[0]);
  }

  // Handle object answers (like hidden fields with key-value pairs)
  if (typeof answer === 'object') {
    // For hidden fields like { hibiscusUserId: "xxx" }, return the value
    const values = Object.values(answer as Record<string, unknown>);
    if (values.length === 1 && typeof values[0] === 'string') {
      return values[0];
    }
    return JSON.stringify(answer);
  }

  return String(answer);
}
