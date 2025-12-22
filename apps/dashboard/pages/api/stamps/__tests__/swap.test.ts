import 'reflect-metadata';
import { createMocks } from 'node-mocks-http';

const mockGetAuthenticatedUser = jest.fn();
const mockSwapStamp = jest.fn();
const mockGetStampTypes = jest.fn();
const mockHasStampType = jest.fn();
const mockGetOccupiedSlots = jest.fn();

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
      getOccupiedSlots: (...args: unknown[]) => mockGetOccupiedSlots(...args),
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
    mockGetOccupiedSlots.mockResolvedValue({ slots: [0, 1, 2], error: null });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(null);

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: 'user-123', stampTypeId: 1, replaceSlotPosition: 0 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(mockSwapStamp).not.toHaveBeenCalled();
  });

  it('returns 400 when recipientId is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'giver-123' });

    const { req, res } = createMocks({
      method: 'POST',
      body: { stampTypeId: 1, replaceSlotPosition: 0 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when stampTypeId is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'giver-123' });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: 'user-123', replaceSlotPosition: 0 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when replaceSlotPosition is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'giver-123' });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: 'user-123', stampTypeId: 1 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 400 when slot position is out of range', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'giver-123' });

    const { req, res } = createMocks({
      method: 'POST',
      body: { recipientId: 'user-123', stampTypeId: 1, replaceSlotPosition: 9 },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('Invalid slot');
  });

  it('returns 400 when trying to use system-only stamp', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'giver-123' });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: 'user-123',
        stampTypeId: 15,
        replaceSlotPosition: 0,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('system');
  });

  it('returns 400 when slot is empty', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'giver-123' });
    mockGetOccupiedSlots.mockResolvedValue({ slots: [0, 1, 2], error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: 'user-123',
        stampTypeId: 1,
        replaceSlotPosition: 5,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('empty');
  });

  it('returns 400 when recipient already has this stamp type', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'giver-123' });
    mockHasStampType.mockResolvedValue(true);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: 'user-123',
        stampTypeId: 1,
        replaceSlotPosition: 0,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).message).toContain('already has');
  });

  it('swaps stamp successfully', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user_id: 'giver-123' });
    mockGetOccupiedSlots.mockResolvedValue({ slots: [0, 1, 2], error: null });
    mockSwapStamp.mockResolvedValue({ error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        recipientId: 'user-123',
        stampTypeId: 1,
        replaceSlotPosition: 2,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(mockSwapStamp).toHaveBeenCalledWith(
      'user-123',
      1,
      2,
      'giver-123',
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
