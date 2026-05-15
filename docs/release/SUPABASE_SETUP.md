# Supabase Backend Setup

## Environment Variables

Add these to your `.env.local` file. Expo public variables are bundled into the app, so only use anon/public values here:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Sentry (optional but recommended)
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

Never put Supabase service role keys, database URLs, or AI provider keys in `.env.local` or any `EXPO_PUBLIC_` variable. Server-only secrets belong in `.env.server` locally and in Supabase/Trigger.dev secret storage when deployed.

## Supabase Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  username text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  verified boolean default false,
  role text default 'user',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Squads table
create table public.squads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  avatar_url text,
  banner_url text,
  is_public boolean default true,
  member_count integer default 0,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wallets table
create table public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) unique not null,
  balance decimal default 0,
  currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Transactions table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references public.wallets(id),
  amount decimal not null,
  type text check (type in ('deposit', 'withdrawal', 'transfer', 'purchase')),
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  description text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.squads enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;

-- RLS Policies
-- Users: can read own profile, update own profile
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Squads: public can view public squads, members can view all
create policy "Public squads visible" on public.squads for select using (is_public = true);

-- Wallets: only owner
create policy "Wallet owner access" on public.wallets for all using (user_id = auth.uid());

-- Transactions: only wallet owner
create policy "Transaction wallet owner access" on public.transactions for all using (
  wallet_id in (select id from public.wallets where user_id = auth.uid())
);

-- Function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  
  insert into public.wallets (user_id) values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## What's Connected

| Feature | Status | File |
|---------|--------|------|
| Auth (login/register/logout) | ✅ Live | `src/services/supabaseAuth.ts` |
| Auth store integration | ✅ Live | `src/store/index.ts` |
| Secure token storage | ✅ Live | `src/persistence/SecureStorage.ts` |
| Sentry error tracking | ✅ Live | `src/config/sentry.ts` |
| Type-safe client | ✅ Ready | `src/config/supabase.ts` |

## Next Steps

1. Create Supabase project at https://supabase.com
2. Copy URL and anon key to `.env.local`
3. Run the SQL schema above
4. Test auth flow

## Sentry Setup (Optional)

1. Create project at https://sentry.io
2. Copy DSN to `.env.local`
3. Errors automatically tracked in production

## Type Generation

When the database schema changes, you must regenerate the TypeScript types:

```bash
# Login (first time only)
npx supabase login

# Generate types from the connected Supabase project
npm run types:supabase
```

This will update `src/types/supabase.ts` with the latest schema from your Supabase project.

**Important**: The generated types must match your migrations. If you add a migration file to `supabase/migrations/`, you must:
1. Push the migration: `npx supabase db push`
2. Regenerate types: `npm run types:supabase`
