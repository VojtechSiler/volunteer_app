-- The app stores NO candidate data in the database (GDPR): saved candidates
-- are kept in memory only, and cleared on refresh / sign-out. User accounts are
-- handled entirely by Supabase Auth, which needs no custom tables.
--
-- If you already ran the earlier version that created a `candidates` table,
-- run this once in Supabase → SQL Editor to remove it and any stored rows:

drop table if exists public.candidates cascade;
