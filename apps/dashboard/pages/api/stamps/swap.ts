import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { StampRepository } from '../../../repository/stamp.repository';
import { getAuthenticatedUser } from '../../../common/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { recipientId, stampTypeId, replaceSlotPosition } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    if (!stampTypeId) {
      return res.status(400).json({ message: 'stampTypeId is required' });
    }

    if (replaceSlotPosition === undefined || replaceSlotPosition === null) {
      return res
        .status(400)
        .json({ message: 'replaceSlotPosition is required' });
    }

    if (replaceSlotPosition < 0 || replaceSlotPosition > 8) {
      return res
        .status(400)
        .json({ message: 'Invalid slot position. Must be 0-8' });
    }

    const repo = container.resolve(StampRepository);

    // Check if stamp type exists and is not system-only
    const { data: stampTypes, error: typesError } = await repo.getStampTypes();
    if (typesError) {
      throw new Error(typesError.message);
    }

    const stampType = stampTypes?.find((s) => s.id === stampTypeId);
    if (!stampType) {
      return res.status(400).json({ message: 'Invalid stamp type' });
    }

    if (stampType.is_system_only) {
      return res.status(400).json({ message: 'Cannot use system-only stamps' });
    }

    // Check if recipient already has this stamp type
    const alreadyHas = await repo.hasStampType(recipientId, stampTypeId);
    if (alreadyHas) {
      return res
        .status(400)
        .json({ message: 'Recipient already has this stamp type' });
    }

    // Check if the slot is occupied
    const { slots, error: slotsError } = await repo.getOccupiedSlots(
      recipientId
    );
    if (slotsError) {
      throw new Error(slotsError.message);
    }

    if (!slots.includes(replaceSlotPosition)) {
      return res.status(400).json({ message: 'Cannot swap - slot is empty' });
    }

    // Swap the stamp
    const { error } = await repo.swapStamp(
      recipientId,
      stampTypeId,
      replaceSlotPosition,
      user.user_id,
      false,
      null
    );

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({
      message: 'Stamp swapped successfully',
      slotPosition: replaceSlotPosition,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
