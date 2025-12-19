import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

const mockGetAuthenticatedUser = jest.fn();
const mockCheckHasNoTeam = jest.fn();
const mockInsertTeam = jest.fn();
const mockUpdateOrganizerTeam = jest.fn();

jest.mock('../../../../common/auth', () => ({
  getAuthenticatedUser: (...args: any[]) => mockGetAuthenticatedUser(...args),
}));

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      checkHasNoTeam: (...args: any[]) => mockCheckHasNoTeam(...args),
      insertTeam: (...args: any[]) => mockInsertTeam(...args),
      updateOrganizerTeam: (...args: any[]) => mockUpdateOrganizerTeam(...args),
    }),
  },
  injectable: () => () => {},
}));

import handler from '../create';

describe('POST /api/organizer/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Team',
        description: 'A test team',
        organizerId: 'attacker-provided-id',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockInsertTeam).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated user does not match organizerId', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      user_id: 'real-user-id',
      email: 'real@example.com',
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Team',
        description: 'A test team',
        organizerId: 'different-user-id', // Attacker trying to spoof
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(mockInsertTeam).not.toHaveBeenCalled();
  });

  it('creates team when authenticated user matches organizerId', async () => {
    const userId = 'valid-user-id';
    mockGetAuthenticatedUser.mockResolvedValue({
      user_id: userId,
      email: 'user@example.com',
    });
    mockCheckHasNoTeam.mockResolvedValue({ data: [{ user_id: userId }] });
    mockInsertTeam.mockResolvedValue({
      data: [{ team_id: 'new-team-id' }],
      error: null,
    });
    mockUpdateOrganizerTeam.mockResolvedValue({ error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Team',
        description: 'A test team',
        organizerId: userId,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(mockInsertTeam).toHaveBeenCalled();
  });
});
