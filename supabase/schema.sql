-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Foods master list
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  brand text,
  serving_size_grams numeric(10,2) not null default 100,
  calories numeric(10,2) not null,
  protein numeric(10,2) not null,
  carbs numeric(10,2) not null,
  fats numeric(10,2) not null,
  fiber numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists foods_name_idx on public.foods using gin (to_tsvector('english', name));

-- User profile information
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User-specific targets
create table if not exists public.rda_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  age int not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  weight_kg numeric(6,2) not null,
  height_cm numeric(6,2),
  workout_level text not null check (workout_level in ('light', 'moderate', 'heavy')),
  weight_goal text check (weight_goal in ('maintain', 'loss', 'gain')),
  calories_target numeric(10,2) not null,
  protein_target numeric(10,2) not null,
  carbs_target numeric(10,2) not null,
  fats_target numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Food logs per user
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid references public.foods(id),
  is_custom boolean not null default false,
  custom_name text,
  custom_serving_size_grams numeric(10,2),
  quantity numeric(10,2) not null default 1,
  calories numeric(10,2) not null,
  protein numeric(10,2) not null,
  carbs numeric(10,2) not null,
  fats numeric(10,2) not null,
  fiber numeric(10,2),
  consumed_at timestamptz not null default now(),
  notes text
);

create index if not exists food_logs_user_date_idx on public.food_logs (user_id, consumed_at desc);

-- Daily rollups
create table if not exists public.daily_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  summary_date date not null,
  calories_total numeric(10,2) not null default 0,
  protein_total numeric(10,2) not null default 0,
  carbs_total numeric(10,2) not null default 0,
  fats_total numeric(10,2) not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, summary_date)
);

-- Trigger to keep foods.updated_at current
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists foods_set_updated_at on public.foods;
create trigger foods_set_updated_at
before update on public.foods
for each row
execute function public.update_updated_at_column();

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.update_updated_at_column();

drop trigger if exists rda_targets_set_updated_at on public.rda_targets;
create trigger rda_targets_set_updated_at
before update on public.rda_targets
for each row
execute function public.update_updated_at_column();

