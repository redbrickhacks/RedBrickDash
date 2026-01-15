import { createHmac } from 'crypto';
import { getEnv } from '@hibiscus/env';
import { createClient } from '@supabase/supabase-js';
import { NextApiHandler, NextApiResponse } from 'next';

// Submission deadline: January 16, 2026 11:59 PM IST
const SUBMISSION_DEADLINE = new Date(
  getEnv().Hibiscus.Submission?.Deadline || '2026-01-16T23:59:59+05:30'
);

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const body = req.body;
  const receivedSignature = req.headers['tally-signature'];
  const signingSecret = getEnv().Hibiscus.Hackform.TallySigningSecret;

  // Calculate the signature using the signing secret and the payload
  const calculatedSignature = createHmac('sha256', signingSecret)
    .update(JSON.stringify(body))
    .digest('base64');

  // Compare the received signature with the calculated signature
  // This is the ONLY case where we return non-200
  if (receivedSignature !== calculatedSignature) {
    return res.status(401).send('Invalid signature.');
  }

  // Signature is valid, process the webhook payload
  if (!isValidBody(body)) {
    console.error('[webhook-project-submission] Invalid body:', body);
    return createResponse(res, 200, 'Invalid request body (logged)');
  }

  // Extract team ID from hidden field
  const teamIdField = body.data.fields.find(
    ({ label, type }) => label === 'hibiscusTeamId' && type === 'HIDDEN_FIELDS'
  );

  if (!teamIdField || !teamIdField.value) {
    console.error(
      '[webhook-project-submission] No team ID for response:',
      body.data.responseId
    );
    return createResponse(res, 200, 'No team ID provided (logged)');
  }

  const teamId = teamIdField.value;
  const responseId = body.data.responseId;

  // Extract submission fields by label
  const youtubeUrl = extractFieldValue(body.data.fields, 'YouTube Demo URL');
  const githubUrl = extractFieldValue(
    body.data.fields,
    'GitHub Repository URL'
  );
  const liveUrl = extractFieldValue(body.data.fields, 'Live Demo URL');
  const pdfUrl = extractFileUrl(body.data.fields, 'PDF Report');

  const supabase = createClient(
    getEnv().Hibiscus.Supabase.apiUrl,
    getEnv().Hibiscus.Supabase.serviceKey
  );

  // Verify team exists
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('team_id')
    .eq('team_id', teamId)
    .single();

  if (teamError || !team) {
    console.error(
      '[webhook-project-submission] Team not found:',
      teamId,
      teamError
    );
    return createResponse(res, 200, 'Team not found (logged)');
  }

  // Check deadline - log warning but still record submission for analytics
  const isPastDeadline = new Date() > SUBMISSION_DEADLINE;
  if (isPastDeadline) {
    console.warn(
      '[webhook-project-submission] Late submission for team:',
      teamId,
      'at',
      new Date().toISOString()
    );
  }

  // Insert into team_submissions (with ON CONFLICT DO NOTHING for idempotency)
  const { error: insertError } = await supabase.from('team_submissions').upsert(
    {
      team_id: teamId,
      tally_response_id: responseId,
      submitted_at: new Date().toISOString(),
      youtube_url: youtubeUrl,
      github_url: githubUrl,
      live_url: liveUrl,
      pdf_url: pdfUrl,
      tally_data: body.data,
    },
    {
      onConflict: 'tally_response_id',
      ignoreDuplicates: true,
    }
  );

  if (insertError) {
    console.error(
      '[webhook-project-submission] Insert error:',
      insertError,
      'team:',
      teamId
    );
    // Continue to update team status even if insert fails (might be duplicate)
  }

  // Only update team status if before deadline
  if (!isPastDeadline) {
    const { error: updateError } = await supabase
      .from('teams')
      .update({
        submission_status: 2, // SUBMITTED
        final_submitted_at: new Date().toISOString(),
      })
      .eq('team_id', teamId);

    if (updateError) {
      console.error(
        '[webhook-project-submission] Update error:',
        updateError,
        'team:',
        teamId
      );
      return createResponse(res, 200, 'Failed to update team status (logged)');
    }
  }

  console.log(
    '[webhook-project-submission] Success for team:',
    teamId,
    'response:',
    responseId,
    isPastDeadline ? '(late)' : ''
  );

  return createResponse(res, 200, 'Submission recorded successfully');
};

type TallyField = {
  key: string;
  label: string;
  type: string;
  value: any;
};

type RequestBody = {
  data: {
    responseId: string;
    fields: TallyField[];
  };
};

function isValidBody(body: any): body is RequestBody {
  return (
    'data' in body &&
    'responseId' in body.data &&
    'fields' in body.data &&
    Array.isArray(body.data.fields)
  );
}

function extractFieldValue(fields: TallyField[], label: string): string | null {
  const field = fields.find((f) => f.label === label);
  if (!field || !field.value) return null;
  // Handle both string values and arrays (some Tally fields return arrays)
  return typeof field.value === 'string' ? field.value : field.value[0] || null;
}

function extractFileUrl(fields: TallyField[], label: string): string | null {
  const field = fields.find((f) => f.label === label);
  if (!field || !field.value) return null;
  // File uploads in Tally typically return an array of objects with url property
  if (Array.isArray(field.value) && field.value[0]?.url) {
    return field.value[0].url;
  }
  // Or might be a direct URL string
  if (typeof field.value === 'string') {
    return field.value;
  }
  return null;
}

function createResponse(res: NextApiResponse, status: number, message: string) {
  return res.status(status).json({ meta: { statusCode: status, message } });
}

export default handler;
