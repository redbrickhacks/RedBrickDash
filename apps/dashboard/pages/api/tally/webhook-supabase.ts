import { createHmac } from 'crypto';
import { getEnv } from '@hibiscus/env';
import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js';
import { NextApiHandler, NextApiResponse } from 'next';

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
  if (receivedSignature !== calculatedSignature) {
    return res.status(401).send('Invalid signature.');
  }

  // Signature is valid, process the webhook payload
  if (!isValidBody(body)) {
    return createResponse(res, 400, 'Invalid request body');
  }

  const field = body.data.fields.find(
    ({ label, type }) => label === 'hibiscusUserId' && type === 'HIDDEN_FIELDS'
  );

  if (field === undefined || field === null || field.value === '') {
    return createResponse(
      res,
      400,
      `No user ID provided for application ID ${body.data.responseId}`
    );
  }

  // Update DB
  const { data, error } = await updateDb(field.value, body.data.responseId);

  if (error !== null) {
    return createResponse(
      res,
      500,
      `Unable to update user ${field.value} application ID ${body.data.responseId} in Supabase: ${error.message}`
    );
  }

  if (data === null || data.length === 0) {
    return createResponse(
      res,
      500,
      `Unable to update user ${field.value} application ID ${body.data.responseId} in Supabase: user does not exist`
    );
  }

  return createResponse(res, 200, 'Success');
};

type RequestBody = {
  data: {
    responseId: string;
    fields: { key: string; label: string; type: string; value: any }[];
  };
};

function isValidBody(body: any): body is RequestBody {
  return (
    'data' in body &&
    'responseId' in body.data &&
    'fields' in body.data &&
    Array.isArray(body.data.fields) &&
    body.data.fields.every(
      (field: any) =>
        'key' in field &&
        'label' in field &&
        'type' in field &&
        'value' in field
    )
  );
}

async function updateDb(
  userId: string,
  applicationId: string
): Promise<PostgrestSingleResponse<any[]>> {
  const supabase = createClient(
    getEnv().Hibiscus.Supabase.apiUrl,
    getEnv().Hibiscus.Supabase.serviceKey
  );

  const res = await supabase
    .from('user_profiles')
    .update({ app_id: applicationId, application_status: 2 }) // REGISTERED
    .eq('user_id', userId)
    .select();

  return res;
}

function createResponse(res: NextApiResponse, status: number, message: string) {
  return res.status(status).json({ meta: { statusCode: status, message } });
}

export default handler;
