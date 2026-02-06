-- ============================================
-- MAXED FITNESS APP - FULL DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  phone text,
  height_feet smallint,
  height_inches smallint,
  weight_lbs numeric(5,1),
  experience text check (experience in ('beginner', 'intermediate', 'advanced')),
  gym text,
  is_home_gym boolean default false,
  wearables text[] default '{}',
  goal text,
  custom_goal text,
  split text,
  custom_split jsonb default '[]'::jsonb,
  onboarding_completed boolean default false,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_email on public.profiles(email);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. EXERCISES TABLE (reference library)
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_groups text[] not null default '{}',
  equipment text,
  category text,
  video_id text,
  is_custom boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index idx_exercises_category on public.exercises(category);
create index idx_exercises_name on public.exercises(name);

-- Seed exercise library
insert into public.exercises (name, muscle_groups, equipment, category, video_id) values
  ('Bench Press', '{"Chest","Triceps"}', 'Barbell', 'chest', 'rT7DgCr-3pg'),
  ('Incline Dumbbell Press', '{"Upper Chest"}', 'Dumbbells', 'chest', '8iPEnn-ltC8'),
  ('Cable Flyes', '{"Chest"}', 'Cable', 'chest', 'Iwe6AmxVf7o'),
  ('Dips', '{"Chest","Triceps"}', 'Bodyweight', 'chest', '2z8JmcrW-As'),
  ('Deadlift', '{"Back","Hamstrings"}', 'Barbell', 'back', 'op9kVnSso6Q'),
  ('Barbell Rows', '{"Back","Biceps"}', 'Barbell', 'back', 'FWJR5Ve8bnQ'),
  ('Pull-ups', '{"Lats","Biceps"}', 'Bodyweight', 'back', 'eGo4IYlbE5g'),
  ('Lat Pulldown', '{"Lats"}', 'Cable', 'back', 'CAwf7n6Luuc'),
  ('Squat', '{"Quads","Glutes"}', 'Barbell', 'legs', 'ultWZbUMPL8'),
  ('Romanian Deadlift', '{"Hamstrings","Glutes"}', 'Barbell', 'legs', 'jEy_czb3RKA'),
  ('Leg Press', '{"Quads","Glutes"}', 'Machine', 'legs', 'IZxyjW7MPJQ'),
  ('Leg Curls', '{"Hamstrings"}', 'Machine', 'legs', '1Tq3QdYUuHs'),
  ('Calf Raises', '{"Calves"}', 'Machine', 'legs', 'gwLzBJYoWlI'),
  ('Overhead Press', '{"Shoulders","Triceps"}', 'Barbell', 'shoulders', '2yjwXTZQDDI'),
  ('Lateral Raises', '{"Side Delts"}', 'Dumbbells', 'shoulders', '3VcKaXpzqRo'),
  ('Face Pulls', '{"Rear Delts"}', 'Cable', 'shoulders', 'rep-qVOkqgk'),
  ('Barbell Curl', '{"Biceps"}', 'Barbell', 'arms', 'kwG2ipFRgFo'),
  ('Hammer Curls', '{"Biceps","Brachialis"}', 'Dumbbells', 'arms', 'zC3nLlEvin4'),
  ('Tricep Pushdowns', '{"Triceps"}', 'Cable', 'arms', '2-LAMcpzODU'),
  ('Skull Crushers', '{"Triceps"}', 'EZ Bar', 'arms', null),
  ('Close Grip Bench Press', '{"Triceps","Chest"}', 'Barbell', 'arms', null),
  ('Preacher Curl', '{"Biceps"}', 'EZ Bar', 'arms', null),
  ('Arnold Press', '{"Shoulders"}', 'Dumbbells', 'shoulders', null),
  ('Rear Delt Flyes', '{"Rear Delts"}', 'Dumbbells', 'shoulders', null),
  ('T-Bar Row', '{"Back"}', 'Barbell', 'back', null),
  ('Seated Cable Row', '{"Back"}', 'Cable', 'back', null),
  ('Hack Squat', '{"Quads"}', 'Machine', 'legs', null),
  ('Walking Lunges', '{"Quads","Glutes"}', 'Dumbbells', 'legs', null),
  ('Pec Deck Flyes', '{"Chest"}', 'Machine', 'chest', null);

-- 3. WORKOUTS TABLE
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workout_type text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_minutes smallint,
  notes text,
  created_at timestamptz default now()
);

create index idx_workouts_user_id on public.workouts(user_id);
create index idx_workouts_started_at on public.workouts(user_id, started_at desc);

-- 4. WORKOUT_EXERCISES TABLE
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name text not null,
  sort_order smallint not null default 0,
  created_at timestamptz default now()
);

create index idx_workout_exercises_workout_id on public.workout_exercises(workout_id);

-- 5. WORKOUT_SETS TABLE
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  set_number smallint not null,
  weight_lbs numeric(6,1),
  reps smallint,
  duration_minutes smallint,
  distance_miles numeric(5,2),
  speed_mph numeric(4,1),
  incline_percent numeric(4,1),
  calories_burned smallint,
  created_at timestamptz default now()
);

create index idx_workout_sets_exercise_id on public.workout_sets(workout_exercise_id);

-- 6. PERSONAL_RECORDS TABLE (auto-tracked via trigger)
create table public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_name text not null,
  pr_type text not null check (pr_type in ('weight', 'reps', 'duration', 'distance')),
  value numeric(8,2) not null,
  unit text not null,
  achieved_at timestamptz not null default now(),
  workout_id uuid references public.workouts(id) on delete set null,
  created_at timestamptz default now(),
  unique(user_id, exercise_name, pr_type)
);

create index idx_prs_user on public.personal_records(user_id);
create index idx_prs_exercise on public.personal_records(user_id, exercise_name);

-- PR auto-tracking trigger
create or replace function public.check_and_update_pr()
returns trigger as $$
declare
  v_exercise_name text;
  v_user_id uuid;
  v_workout_id uuid;
  v_current_weight numeric;
  v_current_reps numeric;
begin
  select we.exercise_name, w.user_id, w.id
  into v_exercise_name, v_user_id, v_workout_id
  from public.workout_exercises we
  join public.workouts w on w.id = we.workout_id
  where we.id = new.workout_exercise_id;

  -- Check weight PR
  if new.weight_lbs is not null and new.weight_lbs > 0 then
    select value into v_current_weight
    from public.personal_records
    where user_id = v_user_id and exercise_name = v_exercise_name and pr_type = 'weight';

    if v_current_weight is null or new.weight_lbs > v_current_weight then
      insert into public.personal_records (user_id, exercise_name, pr_type, value, unit, achieved_at, workout_id)
      values (v_user_id, v_exercise_name, 'weight', new.weight_lbs, 'lbs', now(), v_workout_id)
      on conflict (user_id, exercise_name, pr_type)
      do update set value = excluded.value, achieved_at = excluded.achieved_at, workout_id = excluded.workout_id;
    end if;
  end if;

  -- Check reps PR (for bodyweight exercises)
  if (new.weight_lbs is null or new.weight_lbs = 0) and new.reps is not null then
    select value into v_current_reps
    from public.personal_records
    where user_id = v_user_id and exercise_name = v_exercise_name and pr_type = 'reps';

    if v_current_reps is null or new.reps > v_current_reps then
      insert into public.personal_records (user_id, exercise_name, pr_type, value, unit, achieved_at, workout_id)
      values (v_user_id, v_exercise_name, 'reps', new.reps, 'reps', now(), v_workout_id)
      on conflict (user_id, exercise_name, pr_type)
      do update set value = excluded.value, achieved_at = excluded.achieved_at, workout_id = excluded.workout_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_set_logged
  after insert on public.workout_sets
  for each row execute function public.check_and_update_pr();

-- 7. PRIVACY_SETTINGS TABLE
create table public.privacy_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  share_live_activity boolean default true,
  share_prs boolean default true,
  share_workout_history boolean default true,
  share_streak boolean default true,
  profile_visibility text default 'everyone' check (profile_visibility in ('everyone', 'friends', 'private')),
  updated_at timestamptz default now()
);

-- Auto-create privacy settings when profile is created
create or replace function public.handle_new_privacy_settings()
returns trigger as $$
begin
  insert into public.privacy_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created_privacy
  after insert on public.profiles
  for each row execute function public.handle_new_privacy_settings();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;
alter table public.personal_records enable row level security;
alter table public.privacy_settings enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Exercises (public read, users can add custom)
create policy "Anyone can read exercises" on public.exercises for select using (true);
create policy "Users can insert custom exercises" on public.exercises for insert with check (auth.uid() = created_by and is_custom = true);

-- Workouts
create policy "Users can view own workouts" on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert own workouts" on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update own workouts" on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete own workouts" on public.workouts for delete using (auth.uid() = user_id);

-- Workout exercises
create policy "Users can view own workout exercises" on public.workout_exercises for select
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));
create policy "Users can insert own workout exercises" on public.workout_exercises for insert
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

-- Workout sets
create policy "Users can view own workout sets" on public.workout_sets for select
  using (exists (select 1 from public.workout_exercises we join public.workouts w on w.id = we.workout_id where we.id = workout_exercise_id and w.user_id = auth.uid()));
create policy "Users can insert own workout sets" on public.workout_sets for insert
  with check (exists (select 1 from public.workout_exercises we join public.workouts w on w.id = we.workout_id where we.id = workout_exercise_id and w.user_id = auth.uid()));

-- Personal records
create policy "Users can view own PRs" on public.personal_records for select using (auth.uid() = user_id);

-- Privacy settings
create policy "Users can view own privacy settings" on public.privacy_settings for select using (auth.uid() = user_id);
create policy "Users can update own privacy settings" on public.privacy_settings for update using (auth.uid() = user_id);
