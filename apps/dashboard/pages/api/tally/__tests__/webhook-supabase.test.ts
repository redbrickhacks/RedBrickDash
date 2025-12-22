import { createMocks } from 'node-mocks-http';
import { createHmac } from 'crypto';

// Mock dependencies before importing handler
const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
const mockUpdateData = jest.fn();

const mockFrom = jest.fn((table: string) => {
  if (table === 'user_stamps') {
    return {
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: mockInsert,
    };
  }
  // user_profiles table - chain: from().update().eq().select()
  return {
    update: jest.fn((data) => {
      mockUpdateData(data);
      return {
        eq: jest.fn(() => ({
          select: jest.fn(() =>
            Promise.resolve({ data: [{ user_id: 'test-user' }], error: null })
          ),
        })),
      };
    }),
  };
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
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
    expect(mockUpdateData).toHaveBeenCalledWith({
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

  it('should give welcome stamp after successful registration', async () => {
    const { body, signature } = createValidRequest();

    const { req, res } = createMocks({
      method: 'POST',
      body,
      headers: { 'tally-signature': signature },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    // Wait for fire-and-forget stamp to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify welcome stamp was inserted
    expect(mockInsert).toHaveBeenCalledWith({
      recipient_id: 'test-user-id',
      stamp_type_id: 15, // RBH welcome stamp
      slot_position: 0,
      giver_id: null,
      is_system_gift: true,
      message: 'Welcome to RedBrick Hacks!',
    });
  });
});
