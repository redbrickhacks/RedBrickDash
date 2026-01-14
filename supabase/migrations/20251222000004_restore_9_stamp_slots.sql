-- Restore 9 stamp slots (was reduced to 3 during testing)
ALTER TABLE user_stamps DROP CONSTRAINT IF EXISTS user_stamps_slot_position_check;
ALTER TABLE user_stamps ADD CONSTRAINT user_stamps_slot_position_check
  CHECK (slot_position >= 0 AND slot_position < 9);
