-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. 사용자 (Users)
-- Supabase Auth의 auth.users와 1:1 매핑
create table if not exists public.users (
  id serial primary key, -- Integer ID (New PK)
  auth_id uuid references auth.users not null unique, -- Auth UUID
  language_setting text default 'ko',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: Users
alter table public.users enable row level security;
create policy "Users can view own profile" on users for select using (auth.uid() = auth_id);
create policy "Users can update own profile" on users for update using (auth.uid() = auth_id);
create policy "Users can insert own profile" on users for insert with check (auth.uid() = auth_id);


-- 2. 루틴 (Routines)
create table if not exists public.routines (
  id serial primary key, -- Integer ID
  user_id integer references public.users(id) not null, -- Integer FK
  name text not null, -- 루틴 이름
  exercises_detail jsonb not null default '[]'::jsonb, -- 운동 상세 (횟수, 무게 포함)
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: Routines
alter table public.routines enable row level security;
create policy "Users can view own routines" on routines for select using (
  user_id = (select id from public.users where auth_id = auth.uid())
);
create policy "Users can insert own routines" on routines for insert with check (
  user_id = (select id from public.users where auth_id = auth.uid())
);
create policy "Users can update own routines" on routines for update using (
  user_id = (select id from public.users where auth_id = auth.uid())
);
create policy "Users can delete own routines" on routines for delete using (
  user_id = (select id from public.users where auth_id = auth.uid())
);


-- 3. 기록 (Records / Workout Logs)
create table if not exists public.workout_logs (
  id serial primary key, -- Integer ID
  user_id integer references public.users(id) not null, -- Integer FK
  routine_id integer references public.routines(id), -- Integer FK
  performed_at timestamp with time zone default timezone('utc'::text, now()), -- 날짜
  exercises_log jsonb not null default '[]'::jsonb, -- 기록 운동
  memo text, -- 운동 메모
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: Workout Logs
alter table public.workout_logs enable row level security;
create policy "Users can view own logs" on workout_logs for select using (
  user_id = (select id from public.users where auth_id = auth.uid())
);
create policy "Users can insert own logs" on workout_logs for insert with check (
  user_id = (select id from public.users where auth_id = auth.uid())
);
create policy "Users can update own logs" on workout_logs for update using (
  user_id = (select id from public.users where auth_id = auth.uid())
);
create policy "Users can delete own logs" on workout_logs for delete using (
  user_id = (select id from public.users where auth_id = auth.uid())
);


-- Trigger for updated_at (Optional but recommended)
create or replace function public.handle_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_users_updated before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger on_routines_updated before update on public.routines
  for each row execute procedure public.handle_updated_at();

create trigger on_workout_logs_updated before update on public.workout_logs
  for each row execute procedure public.handle_updated_at();

-- 4. 회원가입 시 public.users 자동 생성 트리거 (Trigger for Auto Profile Creation)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (auth_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
-- Note: You might need sufficient privileges (postgres role) to create triggers on auth schema.
-- In Supabase SQL Editor, this works fine.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
