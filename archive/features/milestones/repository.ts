/**
 * Milestones Repository
 * Supabase persistence for milestone progress tracking
 */

import { getSupabaseClient } from '../../config/supabase';
import {
  MilestoneProgressSchema,
  MilestoneUnlockSchema,
  type MilestoneProgress,
  type MilestoneUnlock,
} from './schemas';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('milestones:repository');

// ============================================================================
// Error Handling
// ============================================================================

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`);
    this.name = 'RepositoryError';
  }
}

const supabase = getSupabaseClient();

// ============================================================================
// Milestone Progress CRUD
// ============================================================================

export async function fetchMilestoneProgress(
  userId: string,
  milestoneId: string
): Promise<MilestoneProgress | null> {
  const { data, error } = await supabase
    .from('milestone_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('milestone_id', milestoneId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {return null;}
    throw new RepositoryError('fetchMilestoneProgress', error);
  }

  return MilestoneProgressSchema.parse(data);
}

export async function fetchAllMilestoneProgress(userId: string): Promise<MilestoneProgress[]> {
  const { data, error } = await supabase
    .from('milestone_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new RepositoryError('fetchAllMilestoneProgress', error);
  }

  return MilestoneProgressSchema.array().parse(data || []);
}

export async function createMilestoneProgress(
  userId: string,
  milestoneId: string,
  currentValue: number,
  threshold: number
): Promise<MilestoneProgress> {
  const percentComplete = Math.min(100, Math.floor((currentValue / threshold) * 100));
  const completed = currentValue >= threshold;

  const newProgress = {
    id: crypto.randomUUID(),
    user_id: userId,
    milestone_id: milestoneId,
    current_value: currentValue,
    threshold,
    percent_complete: percentComplete,
    completed,
    completed_at: completed ? Date.now() : null,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  const { data, error } = await supabase
    .from('milestone_progress')
    .insert(newProgress)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('createMilestoneProgress', error);
  }

  return MilestoneProgressSchema.parse(data);
}

export async function updateMilestoneProgress(
  userId: string,
  milestoneId: string,
  currentValue: number,
  threshold: number
): Promise<MilestoneProgress> {
  const percentComplete = Math.min(100, Math.floor((currentValue / threshold) * 100));
  const completed = currentValue >= threshold;

  const { data, error } = await supabase
    .from('milestone_progress')
    .update({
      current_value: currentValue,
      threshold,
      percent_complete: percentComplete,
      completed,
      completed_at: completed ? Date.now() : null,
      updated_at: Date.now(),
    })
    .eq('user_id', userId)
    .eq('milestone_id', milestoneId)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('updateMilestoneProgress', error);
  }

  return MilestoneProgressSchema.parse(data);
}

export async function upsertMilestoneProgress(
  userId: string,
  milestoneId: string,
  currentValue: number,
  threshold: number
): Promise<MilestoneProgress> {
  const existing = await fetchMilestoneProgress(userId, milestoneId);

  if (existing) {
    return updateMilestoneProgress(userId, milestoneId, currentValue, threshold);
  }

  return createMilestoneProgress(userId, milestoneId, currentValue, threshold);
}

// ============================================================================
// Milestone Unlocks
// ============================================================================

export async function fetchMilestoneUnlocks(userId: string): Promise<MilestoneUnlock[]> {
  const { data, error } = await supabase
    .from('milestone_unlocks')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new RepositoryError('fetchMilestoneUnlocks', error);
  }

  return MilestoneUnlockSchema.array().parse(data || []);
}

export async function recordMilestoneUnlock(
  userId: string,
  milestoneId: string,
  rewardType: string,
  rewardAmount: number
): Promise<MilestoneUnlock> {
  const newUnlock = {
    id: crypto.randomUUID(),
    user_id: userId,
    milestone_id: milestoneId,
    unlocked_at: Date.now(),
    reward_type: rewardType,
    reward_amount: rewardAmount,
    reward_claimed: false,
    created_at: Date.now(),
  };

  const { data, error } = await supabase
    .from('milestone_unlocks')
    .insert(newUnlock)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('recordMilestoneUnlock', error);
  }

  return MilestoneUnlockSchema.parse(data);
}

export async function markRewardClaimed(unlockId: string): Promise<void> {
  const { error } = await supabase
    .from('milestone_unlocks')
    .update({
      reward_claimed: true,
      reward_claimed_at: Date.now(),
    })
    .eq('id', unlockId);

  if (error) {
    throw new RepositoryError('markRewardClaimed', error);
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

export async function batchUpdateMilestoneProgress(
  userId: string,
  updates: Array<{ milestoneId: string; currentValue: number; threshold: number }>
): Promise<MilestoneProgress[]> {
  const results: MilestoneProgress[] = [];

  for (const update of updates) {
    try {
      const progress = await upsertMilestoneProgress(
        userId,
        update.milestoneId,
        update.currentValue,
        update.threshold
      );
      results.push(progress);
    } catch (error) {
      // Continue with other updates, log error
      debug.error(`Failed to update milestone ${update.milestoneId}:`, error as Error);
    }
  }

  return results;
}

// ============================================================================
// Aggregation Queries
// ============================================================================

export async function getMilestoneStats(userId: string): Promise<{
  totalMilestones: number;
  completedMilestones: number;
  totalUnlocks: number;
  unclaimedRewards: number;
}> {
  const [{ data: progress }, { data: unlocks }] = await Promise.all([
    supabase.from('milestone_progress').select('completed').eq('user_id', userId),
    supabase.from('milestone_unlocks').select('reward_claimed').eq('user_id', userId),
  ]);

  const progressList = progress || [];
  const unlocksList = unlocks || [];

  return {
    totalMilestones: progressList.length,
    completedMilestones: progressList.filter((p: { completed: boolean }) => p.completed).length,
    totalUnlocks: unlocksList.length,
    unclaimedRewards: unlocksList.filter((u: { reward_claimed: boolean }) => !u.reward_claimed).length,
  };
}
