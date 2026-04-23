-- Semantic rename: the "overrides" table is really a per-meal record with
-- per-item completion status (ok/skip), not just an exception to a template.
-- Rename table, index, and RLS policy so the name matches the actual purpose.

alter table public.meal_overrides rename to meal_logs;

alter index if exists idx_meal_overrides_user_date
  rename to idx_meal_logs_user_date;

alter policy "meal_overrides self access" on public.meal_logs
  rename to "meal_logs self access";
