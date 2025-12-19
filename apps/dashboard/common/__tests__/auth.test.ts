import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

const mockGetUserProfile = jest.fn();

jest.mock('@hibiscus/env', () => ({
  getEnv: () => ({
    Hibiscus: {
      Cookies: {
        accessTokenName: 'hbc_access_token',
        refreshTokenName: 'hbc_refresh_token',
      },
    },
  }),
}));

jest.mock('@hibiscus/hibiscus-supabase-client', () => ({
  HibiscusSupabaseClient: jest.fn(),
}));

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      getUserProfile: mockGetUserProfile,
    }),
  },
  injectable: () => () => {},
}));

import { getAuthenticatedUser } from '../auth';

describe('getAuthenticatedUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no access token in cookies', async () => {
    const { req } = createMocks({
      cookies: {},
    });

    const user = await getAuthenticatedUser(req);

    expect(user).toBeNull();
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });

  it('returns null when getUserProfile returns null (invalid token)', async () => {
    mockGetUserProfile.mockResolvedValue(null);

    const { req } = createMocks({
      cookies: {
        hbc_access_token: 'invalid-token',
      },
    });

    const user = await getAuthenticatedUser(req);

    expect(user).toBeNull();
    expect(mockGetUserProfile).toHaveBeenCalledWith('invalid-token');
  });

  it('returns user profile when token is valid', async () => {
    const mockUser = {
      user_id: 'test-user-id',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    };
    mockGetUserProfile.mockResolvedValue(mockUser);

    const { req } = createMocks({
      cookies: {
        hbc_access_token: 'valid-token',
      },
    });

    const user = await getAuthenticatedUser(req);

    expect(user).toEqual(mockUser);
    expect(mockGetUserProfile).toHaveBeenCalledWith('valid-token');
  });
});
