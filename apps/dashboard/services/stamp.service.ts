import { container } from 'tsyringe';
import { StampRepository } from '../repository/stamp.repository';

const RBH_SYSTEM_STAMP_ID = 15; // rbh-special stamp
const RBH_SYSTEM_MESSAGE = 'From your friends at RedBrick Hacks';

export interface SystemStampOptions {
  recipientId: string;
  stampTypeId?: number;
  message?: string;
}

export async function giveSystemStamp(
  options: SystemStampOptions
): Promise<{ success: boolean; error?: string; slotPosition?: number }> {
  const {
    recipientId,
    stampTypeId = RBH_SYSTEM_STAMP_ID,
    message = RBH_SYSTEM_MESSAGE,
  } = options;

  try {
    const repo = container.resolve(StampRepository);

    // Find available slot
    const slotPosition = await repo.findFirstAvailableSlot(recipientId);
    if (slotPosition === null) {
      return { success: false, error: 'Recipient stamp table is full' };
    }

    // Give the stamp as system gift
    const { error } = await repo.giveStamp(
      recipientId,
      stampTypeId,
      slotPosition,
      null, // No giver for system gifts
      true, // is_system_gift = true
      message
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, slotPosition };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function giveRandomSystemStampToUsers(
  userIds: string[],
  message?: string
): Promise<{ successful: string[]; failed: string[] }> {
  const successful: string[] = [];
  const failed: string[] = [];

  for (const userId of userIds) {
    const result = await giveSystemStamp({
      recipientId: userId,
      message: message || RBH_SYSTEM_MESSAGE,
    });

    if (result.success) {
      successful.push(userId);
    } else {
      failed.push(userId);
    }
  }

  return { successful, failed };
}
