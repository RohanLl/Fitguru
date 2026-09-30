-- FitGuru Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)

-- 1. Create Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  weight numeric,
  weight_unit text default 'kg',
  height numeric,
  height_unit text default 'cm',
  age integer,
  gender text,
  gym_days_per_week integer default 4,
  duration_minutes integer default 60,
  goal text default 'hypertrophy',
  experience_level text default 'intermediate',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Workout Plans table
create table if not exists public.workout_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  split_type text not null,
  duration_minutes integer not null default 60,
  plan_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.workout_plans enable row level security;

-- 4. RLS Policies for Profiles
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. RLS Policies for Workout Plans
drop policy if exists "Users can view their own workout plans" on public.workout_plans;
create policy "Users can view their own workout plans"
  on public.workout_plans for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own workout plans" on public.workout_plans;
create policy "Users can create their own workout plans"
  on public.workout_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own workout plans" on public.workout_plans;
create policy "Users can delete their own workout plans"
  on public.workout_plans for delete
  using (auth.uid() = user_id);

-- 6. Trigger to create profile record on signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
