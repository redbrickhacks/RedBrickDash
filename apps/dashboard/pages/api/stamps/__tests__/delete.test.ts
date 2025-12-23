import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

// Test UUIDs (valid UUID v4 format)
const TEST_USER_ID = '12345678-1234-4123-8123-123456789abc';
const TEST_STAMP_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

const mockGetAuthenticatedUser = jest.fn();
const mockDeleteStamp = jest.fn();

jest.mock('../../../../common/auth', () => ({
  getAuthenticatedUser: (...args: unknown[]) =>
    mockGetAuthenticatedUser(...args),
}));

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      deleteStamp: (...args: unknown[]) => mockDeleteStamp(...args),
    }),
  },
  injectable: () => () => {},
}));

import handler from '../delete';

describe('DELETE /api/stamps/delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'DELETE',
      body: { stampId: TEST_STAMP_ID },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockDeleteStamp).not.toHaveBeenCalled();
  });

  it('returns 400 when stampId is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_USER_ID });

    const { req, res } = createMocks({
      method: 'DELETE',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when stampId is invalid UUID', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_USER_ID });

    const { req, res } = createMocks({
      method: 'DELETE',
      body: { stampId: 'not-a-uuid' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('Invalid stampId');
  });

  it('deletes stamp successfully', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_USER_ID });
    mockDeleteStamp.mockResolvedValue({ error: null });

    const { req, res } = createMocks({
      method: 'DELETE',
      body: { stampId: TEST_STAMP_ID },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockDeleteStamp).toHaveBeenCalledWith(TEST_STAMP_ID, TEST_USER_ID);
  });

  it('returns 405 for non-DELETE requests', async () => {
    const { req, res } = createMocks({ method: 'GET' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
