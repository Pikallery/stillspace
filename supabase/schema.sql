-- ============================================================
-- StillSpace — Supabase Schema
-- Run this entire file in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Profiles (extends auth.users) ──────────────────────────────────────────

create table if not exists public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  name            text not null,
  role            text not null check (role in ('student', 'counsellor', 'admin')),
  email           text not null,
  mobile          text,
  is_available    boolean default true,
  is_banned       boolean default false,
  bio             text,
  specializations text[],
  rating          numeric(3,2) default 5.0,
  triage_score    integer,
  triage_level    text,
  -- Student-specific
  college         text,
  course          text,
  reg_number      text,
  section         text,
  branch          text,
  -- Counsellor-specific
  experience      text,
  created_at      timestamptz default now()
);

-- ── 2. Conversations ──────────────────────────────────────────────────────────

create table if not exists public.conversations (
  id            uuid default gen_random_uuid() primary key,
  student_id    uuid references public.profiles(id) on delete cascade not null,
  counsellor_id uuid references public.profiles(id) on delete cascade not null,
  created_at    timestamptz default now(),
  unique(student_id, counsellor_id)
);

-- ── 3. Messages ───────────────────────────────────────────────────────────────

create table if not exists public.messages (
  id              uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id       uuid references public.profiles(id) on delete cascade not null,
  content         text not null,
  created_at      timestamptz default now()
);

-- ── 4. Triage results ─────────────────────────────────────────────────────────

create table if not exists public.triage_results (
  id         uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  score      integer not null,
  level      text not null,
  answers    jsonb,
  created_at timestamptz default now()
);

-- ── 5. Row Level Security ─────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.triage_results  enable row level security;

-- Profiles: all authenticated users can read; own row only for write
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- Conversations: only participants
create policy "conversations_select" on public.conversations
  for select using (auth.uid() = student_id or auth.uid() = counsellor_id);

create policy "conversations_insert" on public.conversations
  for insert with check (auth.uid() = student_id);

-- Messages: participants only
create policy "messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.conversations
      where id = conversation_id
        and (student_id = auth.uid() or counsellor_id = auth.uid())
    )
  );

create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations
      where id = conversation_id
        and (student_id = auth.uid() or counsellor_id = auth.uid())
    )
  );

-- Triage: students insert own; counsellors/admins read all
create policy "triage_insert" on public.triage_results
  for insert with check (auth.uid() = student_id);

create policy "triage_select" on public.triage_results
  for select using (
    auth.uid() = student_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('counsellor', 'admin')
    )
  );

-- ── 6. Auto-create profile on signup ──────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, mobile, college, course, reg_number, section, branch, experience, specializations)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'mobile',
    new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'course',
    new.raw_user_meta_data->>'reg_number',
    new.raw_user_meta_data->>'section',
    new.raw_user_meta_data->>'branch',
    new.raw_user_meta_data->>'experience',
    case
      when new.raw_user_meta_data->>'specializations' is not null
      then string_to_array(new.raw_user_meta_data->>'specializations', ',')
      else null
    end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 7. Enable Realtime ────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
