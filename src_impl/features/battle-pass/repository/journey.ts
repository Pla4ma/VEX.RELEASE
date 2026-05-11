/**
 * Journey Map Repository
 * Supabase integration for branching battle pass
 */

import { supabase } from '../../../supabase/client';
import type { UserJourneyProgress, JourneyPath } from '../journey-map';

const TABLE = 'journey_progress';

export async function fetchJourneyProgress(
  userId: string,
  seasonId: string
): Promise<UserJourneyProgress | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data ? dbToState(data) : null;
}

export async function createJourneyProgress(
  userId: string,
  seasonId: string,
  initialPath: JourneyPath = 'BALANCED'
): Promise<UserJourneyProgress> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      season_id: seasonId,
      current_node_id: `${seasonId}_BALANCED_0`,
      current_path: initialPath,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dbToState(data);
}

export async function updateJourneyProgress(
  userId: string,
  seasonId: string,
  progress: UserJourneyProgress
): Promise<void> {
  const updates = stateToDb(progress);

  const { error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('user_id', userId)
    .eq('season_id', seasonId);

  if (error) {
    throw error;
  }
}

export async function addPathXp(
  userId: string,
  seasonId: string,
  path: JourneyPath,
  amount: number
): Promise<void> {
  const pathKey = `path_xp_${path.toLowerCase()}`;

  const { error } = await supabase
    .from(TABLE)
    .update({
      [pathKey]: supabase.rpc('increment', { x: amount }),
      total_xp: supabase.rpc('increment', { x: amount }),
    })
    .eq('user_id', userId)
    .eq('season_id', seasonId);

  if (error) {
    throw error;
  }
}

function dbToState(row: Record<string, unknown>): UserJourneyProgress {
  return {
    userId: row.user_id as string,
    seasonId: row.season_id as string,
    currentNodeId: row.current_node_id as string,
    currentPath: row.current_path as JourneyPath,
    pathXp: {
      PURITY: row.path_xp_purity as number,
      SPEED: row.path_xp_speed as number,
      SOCIAL: row.path_xp_social as number,
      BALANCED: row.path_xp_balanced as number,
    },
    totalXp: row.total_xp as number,
    completedNodes: (row.completed_nodes as string[]) || [],
    claimedRewards: (row.claimed_rewards as string[]) || [],
    pathSwitchHistory: (row.path_switch_history as Array<{
      from: JourneyPath;
      to: JourneyPath;
      atNodeId: string;
      switchedAt: number;
    }>) || [],
    isPremium: row.is_premium as boolean,
    premiumPurchasedAt: row.premium_purchased_at
      ? new Date(row.premium_purchased_at as string).getTime()
      : undefined,
    startedAt: new Date(row.started_at as string).getTime(),
    lastUpdated: new Date(row.updated_at as string).getTime(),
  };
}

function stateToDb(state: UserJourneyProgress): Record<string, unknown> {
  return {
    current_node_id: state.currentNodeId,
    current_path: state.currentPath,
    path_xp_purity: state.pathXp.PURITY,
    path_xp_speed: state.pathXp.SPEED,
    path_xp_social: state.pathXp.SOCIAL,
    path_xp_balanced: state.pathXp.BALANCED,
    total_xp: state.totalXp,
    completed_nodes: state.completedNodes,
    claimed_rewards: state.claimedRewards,
    path_switch_history: state.pathSwitchHistory,
    is_premium: state.isPremium,
    premium_purchased_at: state.premiumPurchasedAt
      ? new Date(state.premiumPurchasedAt).toISOString()
      : null,
  };
}
