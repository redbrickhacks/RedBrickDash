-- Create atomic swap stamp function
-- This function deletes the existing stamp at a slot and inserts a new one in a single transaction

CREATE OR REPLACE FUNCTION swap_stamp(
  p_recipient_id UUID,
  p_stamp_type_id INTEGER,
  p_slot_position INTEGER,
  p_giver_id UUID,
  p_is_system_gift BOOLEAN DEFAULT FALSE,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
  new_stamp_id UUID;
BEGIN
  -- Delete existing stamp at this slot
  DELETE FROM user_stamps
  WHERE recipient_id = p_recipient_id
    AND slot_position = p_slot_position;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- If nothing was deleted, the slot was empty
  IF deleted_count = 0 THEN
    RETURN jsonb_build_object('error', 'Slot is empty - nothing to swap');
  END IF;

  -- Insert new stamp
  INSERT INTO user_stamps (
    recipient_id,
    stamp_type_id,
    slot_position,
    giver_id,
    is_system_gift,
    message
  ) VALUES (
    p_recipient_id,
    p_stamp_type_id,
    p_slot_position,
    p_giver_id,
    p_is_system_gift,
    p_message
  )
  RETURNING id INTO new_stamp_id;

  RETURN jsonb_build_object('success', true, 'stamp_id', new_stamp_id);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('error', 'Recipient already has this stamp type');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION swap_stamp TO authenticated;
GRANT EXECUTE ON FUNCTION swap_stamp TO service_role;
