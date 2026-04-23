-- Add indexes on existing tables to speed up the hot queries
-- discovered during the Phase A performance audit.
--
-- Context:
--   - fetchWorkoutLogs paginates by user_id ORDER BY performed_at DESC
--   - fetchRoutines lists by user_id ORDER BY created_at DESC
--   - deleteRoutine unlinks workout_logs WHERE routine_id = ?
--   - ensurePublicUser looks up users WHERE auth_id = ?
--
-- PostgreSQL does NOT auto-create indexes on foreign key columns,
-- so these are almost certainly missing in the current schema.
-- All index names use IF NOT EXISTS so re-running is safe.

-- Workout logs: paginated listing by user, newest first
create index if not exists idx_workout_logs_user_performed_at
  on public.workout_logs (user_id, performed_at desc);

-- Workout logs: fast unlink when a routine is deleted
create index if not exists idx_workout_logs_routine_id
  on public.workout_logs (routine_id);

-- Routines: listing by user, newest first
create index if not exists idx_routines_user_created_at
  on public.routines (user_id, created_at desc);

-- Users: auth_id lookup on every app boot (ensurePublicUser).
-- If a UNIQUE constraint already exists on auth_id, the underlying
-- unique index already covers this lookup and this secondary index
-- becomes redundant. Safe to keep thanks to IF NOT EXISTS, but
-- consider dropping it manually if a UNIQUE constraint is present.
create index if not exists idx_users_auth_id
  on public.users (auth_id);
