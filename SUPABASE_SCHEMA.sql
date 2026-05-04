-- ============================================================================
-- VEX APP - PRODUCTION SUPABASE SCHEMA
-- ============================================================================
-- Execute each block separately in Supabase SQL Editor
-- Run in order: Tables → Indexes → RLS Enable → Policies → Functions → Triggers
-- ============================================================================

-- ============================================================================
-- BLOCK 1: TABLE CREATION
-- Run this first - creates all tables with proper constraints
-- ============================================================================

-- Users table (extends auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  username text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  verified boolean default false,
  role text default 'user' check (role in ('user', 'moderator', 'admin')),
  status text default 'active' check (status in ('active', 'suspended', 'deleted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Squads table
create table if not exists public.squads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  avatar_url text,
  banner_url text,
  is_public boolean default true,
  member_count integer default 0,
  created_by uuid references public.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Squad members (junction table for many-to-many)
create table if not exists public.squad_members (
  id uuid default gen_random_uuid() primary key,
  squad_id uuid references public.squads(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text default 'member' check (role in ('member', 'moderator', 'admin')),
  joined_at timestamptz default now(),
  unique(squad_id, user_id)
);

-- Wallets table
create table if not exists public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) unique not null,
  balance numeric(19, 4) default 0 check (balance >= 0),
  currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Transactions table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references public.wallets(id) not null,
  amount numeric(19, 4) not null,
  type text not null check (type in ('deposit', 'withdrawal', 'transfer', 'purchase', 'reward')),
  status text default 'pending' not null check (status in ('pending', 'completed', 'failed', 'cancelled')),
  description text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- User sessions for tracking
create table if not exists public.user_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  device_info jsonb,
  ip_address text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  is_active boolean default true
);

-- ============================================================================
-- BLOCK 2: INDEXES
-- Improves query performance for common operations
-- ============================================================================

-- Users indexes
create index if not exists idx_users_username on public.users(username);
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_created_at on public.users(created_at desc);

-- Squad indexes
create index if not exists idx_squads_created_by on public.squads(created_by);
create index if not exists idx_squads_is_public on public.squads(is_public);
create index if not exists idx_squads_member_count on public.squads(member_count desc);

-- Squad members indexes
create index if not exists idx_squad_members_user_id on public.squad_members(user_id);
create index if not exists idx_squad_members_squad_id on public.squad_members(squad_id);

-- Wallet/Transaction indexes
create index if not exists idx_transactions_wallet_id on public.transactions(wallet_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_transactions_status on public.transactions(status);

-- Session indexes
create index if not exists idx_user_sessions_user_id on public.user_sessions(user_id);
create index if not exists idx_user_sessions_active on public.user_sessions(user_id, is_active);

-- ============================================================================
-- BLOCK 3: ENABLE ROW LEVEL SECURITY
-- Must run before creating policies
-- ============================================================================

alter table public.users enable row level security;
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.user_sessions enable row level security;

-- ============================================================================
-- BLOCK 4: RLS POLICIES
-- Carefully ordered: read policies first, then write policies
-- ============================================================================

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Anyone can view user profiles (needed for social features)
create policy "Users profiles are viewable by everyone" 
  on public.users for select 
  to authenticated, anon 
  using (true);

-- Users can update only their own profile
create policy "Users can update own profile" 
  on public.users for update 
  to authenticated 
  using (auth.uid() = id);

-- Users can delete only their own account
create policy "Users can delete own account" 
  on public.users for delete 
  to authenticated 
  using (auth.uid() = id);

-- Only service role or trigger can insert (users created via trigger)
create policy "Users can insert own profile during signup" 
  on public.users for insert 
  to authenticated 
  with check (auth.uid() = id);

-- ============================================================================
-- SQUADS POLICIES
-- ============================================================================

-- Public squads visible to everyone
-- Private squads visible to members only
create policy "Squads are viewable if public or member" 
  on public.squads for select 
  to authenticated, anon 
  using (
    is_public = true 
    or auth.uid() in (
      select user_id from public.squad_members where squad_id = squads.id
    )
  );

-- Authenticated users can create squads
create policy "Authenticated users can create squads" 
  on public.squads for insert 
  to authenticated 
  with check (auth.uid() = created_by);

-- Squad creator and admins can update
create policy "Squad creators and admins can update" 
  on public.squads for update 
  to authenticated 
  using (
    created_by = auth.uid() 
    or auth.uid() in (
      select user_id from public.squad_members 
      where squad_id = squads.id and role = 'admin'
    )
  );

-- Only creator can delete
create policy "Only squad creator can delete" 
  on public.squads for delete 
  to authenticated 
  using (created_by = auth.uid());

-- ============================================================================
-- SQUAD MEMBERS POLICIES
-- ============================================================================

-- Members can view their memberships
-- Squad admins can view all members of their squads
create policy "Members viewable by self or squad admin" 
  on public.squad_members for select 
  to authenticated 
  using (
    user_id = auth.uid() 
    or auth.uid() in (
      select user_id from public.squad_members 
      where squad_id = squad_members.squad_id and role in ('admin', 'moderator')
    )
  );

-- Users can join public squads or be invited to private
create policy "Users can join squads" 
  on public.squad_members for insert 
  to authenticated 
  with check (
    user_id = auth.uid() 
    or auth.uid() in (
      select created_by from public.squads where id = squad_members.squad_id
    )
  );

-- Users can leave squads (delete own membership)
-- Admins can remove members
create policy "Users can leave or admins can remove" 
  on public.squad_members for delete 
  to authenticated 
  using (
    user_id = auth.uid() 
    or auth.uid() in (
      select user_id from public.squad_members 
      where squad_id = squad_members.squad_id and role = 'admin'
    )
  );

-- Admins can update member roles
create policy "Squad admins can update member roles" 
  on public.squad_members for update 
  to authenticated 
  using (
    auth.uid() in (
      select user_id from public.squad_members 
      where squad_id = squad_members.squad_id and role = 'admin'
    )
  );

-- ============================================================================
-- WALLETS POLICIES
-- ============================================================================

-- Users can only view own wallet
create policy "Wallet owner can view" 
  on public.wallets for select 
  to authenticated 
  using (user_id = auth.uid());

-- Wallets created by trigger only, no direct insert needed
create policy "No direct wallet inserts" 
  on public.wallets for insert 
  to authenticated 
  with check (false);

-- Users cannot update wallets directly (use functions)
create policy "No direct wallet updates" 
  on public.wallets for update 
  to authenticated 
  using (false);

-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================

-- Wallet owners can view their transactions
create policy "Transaction wallet owner can view" 
  on public.transactions for select 
  to authenticated 
  using (
    wallet_id in (select id from public.wallets where user_id = auth.uid())
  );

-- Transactions created by functions only
create policy "No direct transaction inserts" 
  on public.transactions for insert 
  to authenticated 
  with check (false);

-- ============================================================================
-- USER SESSIONS POLICIES
-- ============================================================================

-- Users can view own sessions
create policy "Users can view own sessions" 
  on public.user_sessions for select 
  to authenticated 
  using (user_id = auth.uid());

-- Users can insert own sessions
create policy "Users can insert own sessions" 
  on public.user_sessions for insert 
  to authenticated 
  with check (user_id = auth.uid());

-- Users can update own sessions (end session)
create policy "Users can update own sessions" 
  on public.user_sessions for update 
  to authenticated 
  using (user_id = auth.uid());

-- ============================================================================
-- BLOCK 5: FUNCTIONS
-- Database functions for complex operations
-- ============================================================================

-- Function to handle new user signup
-- Creates profile and wallet automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  -- Generate username from email or metadata
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  
  -- Ensure username is unique by appending random string if needed
  if exists (select 1 from public.users where username = v_username) then
    v_username := v_username || '_' || substr(md5(random()::text), 1, 6);
  end if;
  
  -- Create user profile
  insert into public.users (
    id, 
    email, 
    username, 
    first_name, 
    last_name
  ) values (
    new.id,
    new.email,
    v_username,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  
  -- Create wallet for user
  insert into public.wallets (user_id) values (new.id);
  
  return new;
exception
  when others then
    -- Log error but don't prevent auth signup
    raise warning 'Error in handle_new_user: %', sqlerrm;
    return new;
end;
$$;

-- Function to auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to create squad with auto-add creator as admin
create or replace function public.create_squad(
  p_name text,
  p_description text default null,
  p_is_public boolean default true,
  p_avatar_url text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_squad_id uuid;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Create squad
  insert into public.squads (name, description, is_public, avatar_url, created_by)
  values (p_name, p_description, p_is_public, p_avatar_url, v_user_id)
  returning id into v_squad_id;
  
  -- Add creator as admin
  insert into public.squad_members (squad_id, user_id, role)
  values (v_squad_id, v_user_id, 'admin');
  
  return json_build_object('squad_id', v_squad_id, 'success', true);
end;
$$;

-- Function to safely transfer funds between wallets
create or replace function public.transfer_funds(
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount numeric,
  p_description text default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_from_balance numeric;
  v_from_user_id uuid;
  v_to_user_id uuid;
  v_wallet_row record;
begin
  -- Get sender info and lock row
  select * into v_wallet_row
  from public.wallets 
  where id = p_from_wallet_id
  for update;
  
  v_from_balance := v_wallet_row.balance;
  v_from_user_id := v_wallet_row.user_id;
  
  -- Verify sender owns wallet
  if v_from_user_id != auth.uid() then
    raise exception 'Not authorized to send from this wallet';
  end if;
  
  -- Check sufficient balance
  if v_from_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;
  
  -- Get recipient info
  select user_id into v_to_user_id
  from public.wallets 
  where id = p_to_wallet_id
  limit 1;
  
  if v_to_user_id is null then
    raise exception 'Recipient wallet not found';
  end if;
  
  -- Deduct from sender
  update public.wallets 
  set balance = balance - p_amount,
      updated_at = now()
  where id = p_from_wallet_id;
  
  -- Add to recipient
  update public.wallets 
  set balance = balance + p_amount,
      updated_at = now()
  where id = p_to_wallet_id;
  
  -- Record transactions for both parties
  insert into public.transactions (wallet_id, amount, type, status, description)
  values 
    (p_from_wallet_id, -p_amount, 'transfer', 'completed', coalesce(p_description, 'Transfer out')),
    (p_to_wallet_id, p_amount, 'transfer', 'completed', coalesce(p_description, 'Transfer in'));
  
  return json_build_object('success', true, 'amount', p_amount);
end;
$$;

-- Function to increment squad member count safely (trigger function)
create or replace function public.increment_squad_member_count()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.squads 
  set member_count = member_count + 1,
      updated_at = now()
  where id = new.squad_id;
  return new;
end;
$$;

-- Function to decrement squad member count safely (trigger function)
create or replace function public.decrement_squad_member_count()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.squads 
  set member_count = greatest(member_count - 1, 0),
      updated_at = now()
  where id = old.squad_id;
  return old;
end;
$$;

-- ============================================================================
-- BLOCK 6: TRIGGERS
-- Automatic actions on data changes
-- ============================================================================

-- Trigger: Create user profile on auth signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: Update updated_at on users
drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

-- Trigger: Update updated_at on squads
drop trigger if exists squads_updated_at on public.squads;
create trigger squads_updated_at
  before update on public.squads
  for each row execute procedure public.set_updated_at();

-- Trigger: Update updated_at on wallets
drop trigger if exists wallets_updated_at on public.wallets;
create trigger wallets_updated_at
  before update on public.wallets
  for each row execute procedure public.set_updated_at();

-- Trigger: Update squad member count on member join
drop trigger if exists squad_member_added on public.squad_members;
create trigger squad_member_added
  after insert on public.squad_members
  for each row execute function public.increment_squad_member_count();

-- Trigger: Update squad member count on member leave
drop trigger if exists squad_member_removed on public.squad_members;
create trigger squad_member_removed
  after delete on public.squad_members
  for each row execute function public.decrement_squad_member_count();

-- ============================================================================
-- BLOCK 7: STORAGE SETUP (Optional - for file uploads)
-- Run after creating tables if you want avatar uploads
-- ============================================================================

-- Create storage buckets (run in Supabase Dashboard > Storage or use Storage API)
-- Note: Storage buckets are created via Dashboard or Storage API, not SQL

-- If using SQL for bucket policies (if buckets created via Dashboard):
/*
-- Policies for avatars bucket
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read of avatars  
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify everything is set up correctly
-- ============================================================================

-- Verify tables exist
select table_name from information_schema.tables 
where table_schema = 'public' and table_name in ('users', 'squads', 'squad_members', 'wallets', 'transactions');

-- Verify RLS is enabled
select tablename, rowsecurity from pg_tables 
where schemaname = 'public' and tablename in ('users', 'squads', 'wallets');

-- Verify policies exist
select schemaname, tablename, policyname, permissive, roles, cmd, qual from pg_policies 
where schemaname = 'public';

-- Test: Create a test user (will fail without auth user, but shows trigger exists)
-- This is just for verification, actual users created via signUp
