import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

// Test UUIDs (valid UUID v4 format)
const TEST_USER_ID = '12345678-1234-4123-8123-123456789abc';
const TEST_GIVER_ID = '87654321-4321-4321-8321-cba987654321';
const TEST_OTHER_GIVER_ID = 'abcdef12-3456-4789-8abc-def123456789';
const TEST_STAMP_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

const mockGetAuthenticatedUser = jest.fn();
const mockSwapStamp = jest.fn();
const mockGetStampTypes = jest.fn();
const mockHasStampType = jest.fn();
const mockGetStampAtSlot = jest.fn();

jest.mock('../../../../common/auth', () => ({
  getAuthenticatedUser: (...args: unknown[]) =>
    mockGetAuthenticatedUser(...args),
}));

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      swapStamp: (...args: unknown[]) => mockSwapStamp(...args),
      getStampTypes: (...args: unknown[]) => mockGetStampTypes(...args),
      hasStampType: (...args: unknown[]) => mockHasStampType(...args),
      getStampAtSlot: (...args: unknown[]) => mockGetStampAtSlot(...args),
    }),
  },
  injectable: () => () => {},
}));

import handler from '../swap';

describe('POST /api/stamps/swap', () => {
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
    // Default: slot has a stamp given by TEST_GIVER_ID
    mockGetStampAtSlot.mockResolvedValue({
      data: {
        id: TEST_STAMP_ID,
        giver_id: TEST_GIVER_ID,
        is_system_gift: false,
      },
      error: null,
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: TEST_USER_ID,
        stampTypeId: 1,
        replaceSlotPosition: 0,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockSwapStamp).not.toHaveBeenCalled();
  });

  it('returns 400 when recipientId is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: { stampTypeId: 1, replaceSlotPosition: 0 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when recipientId is invalid UUID', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: 'not-a-uuid',
        stampTypeId: 1,
        replaceSlotPosition: 0,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('Invalid recipientId');
  });

  it('returns 400 when stampTypeId is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID, replaceSlotPosition: 0 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when stampTypeId is not an integer', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: TEST_USER_ID,
        stampTypeId: 'not-a-number',
        replaceSlotPosition: 0,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('Invalid stampTypeId');
  });

  it('returns 400 when replaceSlotPosition is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: TEST_USER_ID, stampTypeId: 1 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when slot position is out of range', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: TEST_USER_ID,
        stampTypeId: 1,
        replaceSlotPosition: 9,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('Invalid slot');
  });

  it('returns 400 when trying to use system-only stamp', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: TEST_USER_ID,
        stampTypeId: 15,
        replaceSlotPosition: 0,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('system');
  });

  it('returns 400 when slot is empty', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });
    mockGetStampAtSlot.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: TEST_USER_ID,
        stampTypeId: 1,
        replaceSlotPosition: 5,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('empty');
  });

  it('returns 400 when trying to swap stamp from another giver', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });
    mockGetStampAtSlot.mockResolvedValue({
      data: {
        id: TEST_STAMP_ID,
        giver_id: TEST_OTHER_GIVER_ID,
        is_system_gift: false,
      },
      error: null,
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: TEST_USER_ID,
        stampTypeId: 1,
        replaceSlotPosition: 0,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain(
      'only replace stamps you gave'
    );
    expect(mockSwapStamp).not.toHaveBeenCalled();
  });

  it('returns 400 when recipient already has this stamp type', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });
    mockHasStampType.mockResolvedValue(true);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: TEST_USER_ID,
        stampTypeId: 1,
        replaceSlotPosition: 0,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('already has');
  });

  it('swaps stamp successfully when replacing own stamp', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: TEST_GIVER_ID });
    mockGetStampAtSlot.mockResolvedValue({
      data: {
        id: TEST_STAMP_ID,
        giver_id: TEST_GIVER_ID,
        is_system_gift: false,
      },
      error: null,
    });
    mockSwapStamp.mockResolvedValue({ error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: TEST_USER_ID,
        stampTypeId: 1,
        replaceSlotPosition: 2,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSwapStamp).toHaveBeenCalledWith(
      TEST_USER_ID,
      1,
      2,
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
