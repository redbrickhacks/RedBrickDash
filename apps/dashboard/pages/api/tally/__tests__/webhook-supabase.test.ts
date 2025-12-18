import { createMocks } from 'node-mocks-http';
import { createHmac } from 'crypto';

// Mock dependencies before importing handler
const mockUpdate = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSelect = jest
  .fn()
  .mockResolvedValue({ data: [{ user_id: 'test-user' }], error: null });

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
    })),
  })),
}));

jest.mock('@hibiscus/env', () => ({
  getEnv: () => ({
    Hibiscus: {
      Hackform: { TallySigningSecret: 'test-secret' },
      Supabase: { apiUrl: 'http://localhost', serviceKey: 'test-key' },
    },
  }),
}));

import handler from '../webhook-supabase';

describe('Tally Webhook Supabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createValidRequest = () => {
    const body = {
      data: {
        responseId: 'test-response-id',
        fields: [
          {
            key: 'hidden1',
            label: 'hibiscusUserId',
            type: 'HIDDEN_FIELDS',
            value: 'test-user-id',
          },
        ],
      },
    };

    const signature = createHmac('sha256', 'test-secret')
      .update(JSON.stringify(body))
      .digest('base64');

    return { body, signature };
  };

  it('should set application_status to 2 (REGISTERED) on successful submission', async () => {
    const { body, signature } = createValidRequest();

    const { req, res } = createMocks({
      method: 'POST',
      body,
      headers: { 'tally-signature': signature },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      app_id: 'test-response-id',
      application_status: 2, // REGISTERED
    });
  });

  it('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks({ method: 'GET' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('should return 401 for invalid signature', async () => {
    const { body } = createValidRequest();

    const { req, res } = createMocks({
      method: 'POST',
      body,
      headers: { 'tally-signature': 'invalid-signature' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });
});
