import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { StampRepository } from '../../../repository/stamp.repository';
import { getAuthenticatedUser } from '../../../common/auth';
import { isValidUUID, isValidInteger } from '../../../common/utils';

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

    const { recipientId, stampTypeId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    if (!isValidUUID(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipientId format' });
    }

    if (!stampTypeId && stampTypeId !== 0) {
      return res.status(400).json({ message: 'stampTypeId is required' });
    }

    if (!isValidInteger(stampTypeId)) {
      return res.status(400).json({ message: 'Invalid stampTypeId format' });
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

    // Find available slot
    const slotPosition = await repo.findFirstAvailableSlot(recipientId);
    if (slotPosition === null) {
      return res
        .status(400)
        .json({ message: "Recipient's stamp table is full" });
    }

    // Give the stamp
    const { error } = await repo.giveStamp(
      recipientId,
      stampTypeId,
      slotPosition,
      user.user_id,
      false,
      null
    );

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({
      message: 'Stamp given successfully',
      slotPosition,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
