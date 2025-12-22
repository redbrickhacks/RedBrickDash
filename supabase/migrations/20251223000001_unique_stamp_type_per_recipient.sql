-- One stamp type per recipient
-- Remove duplicates first (keep earliest)
DELETE FROM user_stamps a USING user_stamps b
WHERE a.recipient_id = b.recipient_id
  AND a.stamp_type_id = b.stamp_type_id
  AND a.created_at > b.created_at;

ALTER TABLE user_stamps
ADD CONSTRAINT user_stamps_recipient_type_unique
UNIQUE (recipient_id, stamp_type_id);
