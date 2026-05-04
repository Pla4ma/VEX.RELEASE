-- Create coach_memories table for persistent AI coach memory
-- This replaces the in-memory Map that reset on app close

create table if not exists public.coach_memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  description text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb default '{}',
  referenced_count int default 0,
  last_referenced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.coach_memories enable row level security;

-- Create policies
-- Users can only see their own memories
create policy "Users can view own memories"
  on public.coach_memories for select
  using (auth.uid() = user_id);

-- Users can only insert their own memories
create policy "Users can insert own memories"
  on public.coach_memories for insert
  with check (auth.uid() = user_id);

-- Users can only update their own memories
create policy "Users can update own memories"
  on public.coach_memories for update
  using (auth.uid() = user_id);

-- Users can only delete their own memories
create policy "Users can delete own memories"
  on public.coach_memories for delete
  using (auth.uid() = user_id);

-- Create indexes
create index idx_coach_memories_user_id on public.coach_memories(user_id);
create index idx_coach_memories_type on public.coach_memories(type);
create index idx_coach_memories_occurred_at on public.coach_memories(occurred_at desc);
create index idx_coach_memories_user_type on public.coach_memories(user_id, type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_memories_updated_at
  BEFORE UPDATE ON public.coach_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment
comment on table public.coach_memories is 'Stores AI coach memories for personalized interactions';
