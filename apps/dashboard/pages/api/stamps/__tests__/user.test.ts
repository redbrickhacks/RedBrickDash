import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

const mockGetUserStamps = jest.fn();

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      getUserStamps: (...args: unknown[]) => mockGetUserStamps(...args),
    }),
  },
  injectable: () => () => {},
}));

import handler from '../user/[userId]';

describe('GET /api/stamps/user/[userId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user stamps on success', async () => {
    const mockStamps = [
      {
        id: 'stamp-1',
        slot_position: 0,
        is_system_gift: false,
        message: null,
        created_at: '2025-01-01T00:00:00Z',
        stamp_type: {
          id: 1,
          name: 'coffee',
          emoji: '☕',
          description: 'Fuel up!',
        },
        giver: { user_id: 'giver-1', first_name: 'John', last_name: 'Doe' },
      },
      {
        id: 'stamp-2',
        slot_position: 3,
        is_system_gift: true,
        message: 'Welcome to RedBrick Hacks!',
        created_at: '2025-01-01T00:00:00Z',
        stamp_type: {
          id: 15,
          name: 'rbh-special',
          emoji: '🎁',
          description: 'From RedBrick Hacks',
        },
        giver: null,
      },
    ];
    mockGetUserStamps.mockResolvedValue({ data: mockStamps, error: null });

    const { req, res } = createMocks({
      method: 'GET',
      query: { userId: 'user-123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockStamps);
    expect(mockGetUserStamps).toHaveBeenCalledWith('user-123');
  });

  it('returns 400 when userId is missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(mockGetUserStamps).not.toHaveBeenCalled();
  });

  it('returns 500 on database error', async () => {
    mockGetUserStamps.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const { req, res } = createMocks({
      method: 'GET',
      query: { userId: 'user-123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });

  it('returns 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { userId: 'user-123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
