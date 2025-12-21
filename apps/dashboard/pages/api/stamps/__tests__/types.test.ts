import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

const mockGetAuthenticatedUser = jest.fn();
const mockGetStampTypes = jest.fn();

jest.mock('../../../../common/auth', () => ({
  getAuthenticatedUser: (...args: unknown[]) =>
    mockGetAuthenticatedUser(...args),
}));

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      getStampTypes: (...args: unknown[]) => mockGetStampTypes(...args),
    }),
  },
  injectable: () => () => {},
}));

import handler from '../types';

describe('GET /api/stamps/types', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'user-123' });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const { req, res } = createMocks({ method: 'GET' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockGetStampTypes).not.toHaveBeenCalled();
  });

  it('returns all stamp types on success', async () => {
    const mockStamps = [
      {
        id: 1,
        name: 'coffee',
        emoji: '☕',
        description: 'Fuel up!',
        is_system_only: false,
      },
      {
        id: 2,
        name: 'star',
        emoji: '⭐',
        description: "You're a star",
        is_system_only: false,
      },
      {
        id: 15,
        name: 'rbh-special',
        emoji: '🎁',
        description: 'From RedBrick Hacks',
        is_system_only: true,
      },
    ];
    mockGetStampTypes.mockResolvedValue({ data: mockStamps, error: null });

    const { req, res } = createMocks({ method: 'GET' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockStamps);
  });

  it('returns 500 on database error', async () => {
    mockGetStampTypes.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    });

    const { req, res } = createMocks({ method: 'GET' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toHaveProperty('message');
  });

  it('returns 405 for non-GET requests', async () => {
    const { req, res } = createMocks({ method: 'POST' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
