-- Create tables with RLS (Row Level Security) enabled

-- Users table to store additional user information
create table profiles (
  id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Life area scores
create table scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  health integer not null check (health >= 0 and health <= 100),
  work integer not null check (work >= 0 and work <= 100),
  play integer not null check (play >= 0 and play <= 100),
  love integer not null check (love >= 0 and love <= 100)
);

-- Initial assessment responses
create table assessment_responses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  question_id text not null,
  response text not null
);

-- Chat history
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  role text not null check (role in ('assistant', 'user')),
  content text not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table scores enable row level security;
alter table assessment_responses enable row level security;
alter table chat_messages enable row level security;

-- Create policies
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can view own scores"
  on scores for select
  using ( auth.uid() = user_id );

create policy "Users can insert own scores"
  on scores for insert
  with check ( auth.uid() = user_id );

create policy "Users can view own assessment responses"
  on assessment_responses for select
  using ( auth.uid() = user_id );

create policy "Users can insert own assessment responses"
  on assessment_responses for insert
  with check ( auth.uid() = user_id );

create policy "Users can view own chat messages"
  on chat_messages for select
  using ( auth.uid() = user_id );

create policy "Users can insert own chat messages"
  on chat_messages for insert
  with check ( auth.uid() = user_id );

-- Create functions
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
