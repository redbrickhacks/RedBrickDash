import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

// Test UUIDs (valid UUID v4 format)
const TEST_USER_ID = '12345678-1234-4123-8123-123456789abc';
const TEST_GIVER_ID = '87654321-4321-4321-8321-cba987654321';

const mockGetAuthenticatedUser = jest.fn();
const mockGiveStamp = jest.fn();
const mockFindFirstAvailableSlot = jest.fn();
const mockGetStampTypes = jest.fn();
const mockHasStampType = jest.fn();

jest.mock('../../../../common/auth', () => ({
  getAuthenticatedUser: (...args: unknown[]) =>
    mockGetAuthenticatedUser(...args),
}));

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      giveStamp: (...args: unknown[]) => mockGiveStamp(...args),
      findFirstAvailableSlot: (...args: unknown[]) =>
        mockFindFirstAvailableSlot(...args),
      getStampTypes: (...args: unknown[]) => mockGetStampTypes(...args),
      hasStampType: (...args: unknown[]) => mockHasStampType(...args),
    }),
  },
  injectable: () => () => {},
}));

import handler from '../give';

describe('POST /api/stamps/give', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStampTypes.mockResolvedValue({
      data: [
        { id: 1, name: 'coffee', is_system_only: false },
        { id: 15, name: 'rbh-special', is_system_only: true },
      ],
      error: null,
    });
    mockHasStampType.mockResolvedValue(false);
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID, stampTypeId: 1 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockGiveStamp).not.toHaveBeenCalled();
  });

  it('returns 400 when recipientId is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: { stampTypeId: 1 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when stampTypeId is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when recipientId is invalid UUID', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: 'not-a-uuid', stampTypeId: 1 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('Invalid recipientId');
  });

  it('returns 400 when stampTypeId is not an integer', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID, stampTypeId: 'not-a-number' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('Invalid stampTypeId');
  });

  it('returns 400 when trying to use system-only stamp', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID, stampTypeId: 15 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('system');
  });

  it('returns 400 when recipient already has this stamp type', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });
    mockHasStampType.mockResolvedValue(true);

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID, stampTypeId: 1 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('already has');
    expect(mockGiveStamp).not.toHaveBeenCalled();
  });

  it('returns 400 when recipient table is full', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });
    mockFindFirstAvailableSlot.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID, stampTypeId: 1 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('full');
  });

  it('gives stamp successfully', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });
    mockFindFirstAvailableSlot.mockResolvedValue(3);
    mockGiveStamp.mockResolvedValue({ error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID, stampTypeId: 1 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockGiveStamp).toHaveBeenCalledWith(
      TEST_USER_ID,
      1,
      3,
      TEST_GIVER_ID,
      false,
      null
    );
  });

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({ method: 'GET' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
