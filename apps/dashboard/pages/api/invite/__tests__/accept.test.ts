import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

const mockGetAuthenticatedUser = jest.fn();
const mockGetInviteInfo = jest.fn();
const mockGetAllTeamMembers = jest.fn();
const mockCheckHasNoTeam = jest.fn();
const mockUpdateUserWithAcceptedInvite = jest.fn();
const mockDeleteAcceptedInvite = jest.fn();

jest.mock('../../../../common/auth', () => ({
  getAuthenticatedUser: (...args: any[]) => mockGetAuthenticatedUser(...args),
}));

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      getInviteInfo: (...args: any[]) => mockGetInviteInfo(...args),
      getAllTeamMembers: (...args: any[]) => mockGetAllTeamMembers(...args),
      checkHasNoTeam: (...args: any[]) => mockCheckHasNoTeam(...args),
      updateUserWithAcceptedInvite: (...args: any[]) =>
        mockUpdateUserWithAcceptedInvite(...args),
      deleteAcceptedInvite: (...args: any[]) =>
        mockDeleteAcceptedInvite(...args),
      MAX_TEAM_MEMBERS: 4,
    }),
  },
  injectable: () => () => {},
}));

import handler from '../accept';

describe('PUT /api/invite/accept', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'PUT',
      query: { inviteId: 'invite-123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockGetInviteInfo).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated user is not the invited user', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      user_id: 'different-user-id',
      email: 'other@example.com',
    });
    mockGetInviteInfo.mockResolvedValue({
      data: [{ team_id: 'team-123', invited_id: 'invited-user-id' }],
    });

    const { req, res } = createMocks({
      method: 'PUT',
      query: { inviteId: 'invite-123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(mockUpdateUserWithAcceptedInvite).not.toHaveBeenCalled();
  });

  it('accepts invite when authenticated user matches invited user', async () => {
    const userId = 'invited-user-id';
    mockGetAuthenticatedUser.mockResolvedValue({
      user_id: userId,
      email: 'invited@example.com',
    });
    mockGetInviteInfo.mockResolvedValue({
      data: [{ team_id: 'team-123', invited_id: userId }],
    });
    mockGetAllTeamMembers.mockResolvedValue({
      data: [{ user_id: 'organizer-id' }], // Only 1 member, room for more
    });
    mockCheckHasNoTeam.mockResolvedValue({
      data: [{ user_id: userId }], // User has no team
    });
    mockUpdateUserWithAcceptedInvite.mockResolvedValue({ error: null });
    mockDeleteAcceptedInvite.mockResolvedValue({ error: null });

    const { req, res } = createMocks({
      method: 'PUT',
      query: { inviteId: 'invite-123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockUpdateUserWithAcceptedInvite).toHaveBeenCalledWith(
      'team-123',
      userId
    );
  });

  it('returns 401 for non-PUT requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { inviteId: 'invite-123' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });
});
