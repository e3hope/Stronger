-- Meal planning tables for the Option A design:
--   1) meal_plans     — weekly template (1~N per user, one active)
--   2) meal_overrides — per-date override when reality differs from template
--
-- JSONB structure (meal_plans.plan):
--   {
--     "mon": { "breakfast": [{"id":"...","text":"..."}, ...], "lunch":[...], "snack":[...], "dinner":[...] },
--     "tue": {...}, ..., "sun": {...}
--   }
-- JSONB structure (meal_overrides.items):
--   [ {"id":"...","text":"..."}, ... ]

create table public.meal_plans (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  name text not null default '내 식단',
  plan jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meal_plans_user_active
  on public.meal_plans (user_id, is_active);

create table public.meal_overrides (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','snack','dinner')),
  items jsonb not null default '[]'::jsonb,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date, meal_type)
);

create index if not exists idx_meal_overrides_user_date
  on public.meal_overrides (user_id, date);

-- Row Level Security: owner-only access via the public.users -> auth.uid() bridge
alter table public.meal_plans enable row level security;
alter table public.meal_overrides enable row level security;

create policy "meal_plans self access"
  on public.meal_plans for all
  using (user_id = (select id from public.users where auth_id = auth.uid()))
  with check (user_id = (select id from public.users where auth_id = auth.uid()));

create policy "meal_overrides self access"
  on public.meal_overrides for all
  using (user_id = (select id from public.users where auth_id = auth.uid()))
  with check (user_id = (select id from public.users where auth_id = auth.uid()));
