-- Backfill referral codes for existing users who don't have one
-- Uses same character set as application code (A-Z, 0-9)
-- Handles potential collisions with retry mechanism

DO $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  rec RECORD;
  new_code TEXT;
  attempts INT;
BEGIN
  FOR rec IN SELECT user_id FROM user_profiles WHERE referral_code IS NULL
  LOOP
    attempts := 0;
    LOOP
      new_code := '';
      FOR i IN 1..6 LOOP
        new_code := new_code || substr(chars, floor(random() * 36 + 1)::int, 1);
      END LOOP;

      BEGIN
        UPDATE user_profiles SET referral_code = new_code WHERE user_id = rec.user_id;
        EXIT; -- success, exit inner loop
      EXCEPTION WHEN unique_violation THEN
        attempts := attempts + 1;
        IF attempts > 10 THEN
          RAISE EXCEPTION 'Failed to generate unique code for user %', rec.user_id;
        END IF;
      END;
    END LOOP;
  END LOOP;
END $$;
