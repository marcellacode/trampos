-- Remove all catalog/demo data originally inserted by the development seed.
-- This migration intentionally preserves real user-owned data.

DO $$
BEGIN
  -- User-scoped rows that may reference seeded catalog jobs/companies are removed
  -- only when they point to known deterministic demo IDs.
  DELETE FROM public.job_matches WHERE job_id IN (
    '11111111-1111-4111-8111-111111111111'::uuid,
    '22222222-2222-4222-8222-222222222222'::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    '44444444-4444-4444-8444-444444444444'::uuid,
    '55555555-5555-4555-8555-555555555555'::uuid
  );

  DELETE FROM public.jobs WHERE id IN (
    '11111111-1111-4111-8111-111111111111'::uuid,
    '22222222-2222-4222-8222-222222222222'::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    '44444444-4444-4444-8444-444444444444'::uuid,
    '55555555-5555-4555-8555-555555555555'::uuid
  );
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- Do not insert sample/demo rows in production. The historical seed migration remains
-- immutable for migration history; this cleanup migration makes existing databases clean.
