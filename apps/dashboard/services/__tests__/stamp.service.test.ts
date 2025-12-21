import 'reflect-metadata';

const mockFindFirstAvailableSlot = jest.fn();
const mockGiveStamp = jest.fn();

jest.mock('tsyringe', () => ({
  container: {
    resolve: () => ({
      findFirstAvailableSlot: (...args: unknown[]) =>
        mockFindFirstAvailableSlot(...args),
      giveStamp: (...args: unknown[]) => mockGiveStamp(...args),
    }),
  },
  injectable: () => () => {},
}));

import {
  giveSystemStamp,
  giveRandomSystemStampToUsers,
} from '../stamp.service';

describe('stamp.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('giveSystemStamp', () => {
    it('gives system stamp successfully', async () => {
      mockFindFirstAvailableSlot.mockResolvedValue(0);
      mockGiveStamp.mockResolvedValue({ error: null });

      const result = await giveSystemStamp({ recipientId: 'user-123' });

      expect(result.success).toBe(true);
      expect(result.slotPosition).toBe(0);
      expect(mockGiveStamp).toHaveBeenCalledWith(
        'user-123',
        15, // RBH_SYSTEM_STAMP_ID
        0,
        null,
        true,
        'From your friends at RedBrick Hacks'
      );
    });

    it('returns error when stamp table is full', async () => {
      mockFindFirstAvailableSlot.mockResolvedValue(null);

      const result = await giveSystemStamp({ recipientId: 'user-123' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('full');
      expect(mockGiveStamp).not.toHaveBeenCalled();
    });

    it('allows custom message', async () => {
      mockFindFirstAvailableSlot.mockResolvedValue(3);
      mockGiveStamp.mockResolvedValue({ error: null });

      await giveSystemStamp({
        recipientId: 'user-123',
        message: 'Welcome to the hackathon!',
      });

      expect(mockGiveStamp).toHaveBeenCalledWith(
        'user-123',
        15,
        3,
        null,
        true,
        'Welcome to the hackathon!'
      );
    });

    it('handles database errors', async () => {
      mockFindFirstAvailableSlot.mockResolvedValue(0);
      mockGiveStamp.mockResolvedValue({ error: { message: 'DB error' } });

      const result = await giveSystemStamp({ recipientId: 'user-123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });

  describe('giveRandomSystemStampToUsers', () => {
    it('gives stamps to multiple users', async () => {
      mockFindFirstAvailableSlot.mockResolvedValue(0);
      mockGiveStamp.mockResolvedValue({ error: null });

      const result = await giveRandomSystemStampToUsers([
        'user-1',
        'user-2',
        'user-3',
      ]);

      expect(result.successful).toEqual(['user-1', 'user-2', 'user-3']);
      expect(result.failed).toEqual([]);
      expect(mockGiveStamp).toHaveBeenCalledTimes(3);
    });

    it('tracks failures separately', async () => {
      mockFindFirstAvailableSlot
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(null) // user-2 fails
        .mockResolvedValueOnce(0);
      mockGiveStamp.mockResolvedValue({ error: null });

      const result = await giveRandomSystemStampToUsers([
        'user-1',
        'user-2',
        'user-3',
      ]);

      expect(result.successful).toEqual(['user-1', 'user-3']);
      expect(result.failed).toEqual(['user-2']);
    });
  });
});
