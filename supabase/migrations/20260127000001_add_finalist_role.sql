-- Add FINALIST role (id=8).
-- NOTE: Some dashboard code maps role ids to the HibiscusRole enum by index,
-- so this role must be appended as the next sequential id.
INSERT INTO public.roles (id, name)
VALUES (8, 'FINALIST')
ON CONFLICT DO NOTHING;
