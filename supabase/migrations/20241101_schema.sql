-- Court Crowd Database Schema
-- Run this in Supabase SQL Editor

-- Users table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  nickname text,
  avatar_url text,
  skill_level text,
  play_hours text,
  dupr text,
  bio text,
  push_token text,
  location_sharing boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Courts table
create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  place_id text unique not null,
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  rating double precision,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User presence at courts (for avatar stacks)
create table if not exists public.court_presence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  court_id uuid references public.courts(id) on delete cascade,
  entered_at timestamptz default now(),
  unique(user_id, court_id)
);

-- Favorites
create table if not exists public.favorites (
  user_id uuid references public.users(id) on delete cascade,
  court_id uuid references public.courts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, court_id)
);

-- Follows (for notifications when followed users arrive)
create table if not exists public.follows (
  follower_id uuid references public.users(id) on delete cascade,
  following_id uuid references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Court chat messages (one chat per court, scrolls under map)
create table if not exists public.court_messages (
  id uuid primary key default gen_random_uuid(),
  court_id uuid references public.courts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_court_presence_court on public.court_presence(court_id);
create index if not exists idx_court_presence_user on public.court_presence(user_id);
create index if not exists idx_court_messages_court on public.court_messages(court_id);
create index if not exists idx_court_messages_created on public.court_messages(created_at desc);
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);
create index if not exists idx_courts_location on public.courts(lat, lng);

-- Enable realtime for presence and messages (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'court_presence'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.court_presence;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'court_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.court_messages;
  END IF;
END $$;

-- Row Level Security Policies

-- Users
alter table public.users enable row level security;

create policy "Users are viewable by everyone"
  on public.users for select
  using (true);

create policy "Users can update own record"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own record"
  on public.users for insert
  with check (auth.uid() = id);

-- Courts
alter table public.courts enable row level security;

create policy "Courts are viewable by everyone"
  on public.courts for select
  using (true);

create policy "Authenticated can insert courts"
  on public.courts for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated can update courts"
  on public.courts for update
  using (auth.role() = 'authenticated');

-- Court presence
alter table public.court_presence enable row level security;

create policy "Presence viewable by all"
  on public.court_presence for select
  using (true);

create policy "Users can insert own presence"
  on public.court_presence for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own presence"
  on public.court_presence for delete
  using (auth.uid() = user_id);

create policy "Users can update own presence"
  on public.court_presence for update
  using (auth.uid() = user_id);

-- Favorites
alter table public.favorites enable row level security;

create policy "Users see own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Follows
alter table public.follows enable row level security;

create policy "Follows are public"
  on public.follows for select
  using (true);

create policy "Users can insert own follows"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can delete own follows"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- Messages
alter table public.court_messages enable row level security;

create policy "Messages viewable by all"
  on public.court_messages for select
  using (true);

create policy "Users can send messages"
  on public.court_messages for insert
  with check (auth.uid() = user_id);

-- Functions

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger courts_updated_at
  before update on public.courts
  for each row execute function public.handle_updated_at();

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
