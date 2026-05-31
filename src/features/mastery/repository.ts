import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { supabase } from '../../config/supabase';
import { captureSilentFailure } from '../../utils/silent-failure';
import { z } from 'zod';
import { masteryStateSchema } from './schemas';
import { rankSchema } from './schemas';
import type { MasteryRank, MasteryState } from './types';

const STORAGE_KEY = (userId: string) => `mastery_state_${userId}`;
const storage = getDefaultStorageAdapter();
const TABLE = 'mastery_tracks';

const masteryTrackRowSchema = z.object({
  duration_total_xp: z.number().min(0),
  purity_total_xp: z.number().min(0),
  consistency_total_xp: z.number().min(0),
  comeback_total_xp: z.number().min(0),
  boss_total_xp: z.number().min(0),
  overall_rank: rankSchema,
  updated_at: z.string(),
});

function clampTechnique(value: number): number {
  return Math.max(0, Math.min(25, value));
}

function resolveRank(points: number): MasteryRank {
  if (points >= 100) {
    return 'GRANDMASTER';
  }
  if (points >= 50) {
    return 'MASTER';
  }
  if (points >= 25) {
    return 'EXPERT';
  }
  if (points >= 10) {
    return 'ADEPT';
  }
  return 'APPRENTICE';
}

function cloudRowToState(row: unknown, userId: string): MasteryState | null {
  const parsed = masteryTrackRowSchema.safeParse(row);
  if (!parsed.success) {
    return null;
  }
  const data = parsed.data;
  const totalMasteryPoints =
    data.duration_total_xp +
    data.purity_total_xp +
    data.consistency_total_xp +
    data.comeback_total_xp +
    data.boss_total_xp;

  return {
    userId,
    totalMasteryPoints,
    rank: resolveRank(totalMasteryPoints),
    techniques: {
      durationMastery: clampTechnique(data.duration_total_xp),
      purityMastery: clampTechnique(data.purity_total_xp),
      consistencyMastery: clampTechnique(data.consistency_total_xp),
      comebackMastery: clampTechnique(data.comeback_total_xp),
      bossMastery: clampTechnique(data.boss_total_xp),
    },
    activeChallenges: [],
    unlockedFeatures: [],
    updatedAt: Date.parse(data.updated_at),
  };
}

export function loadStoredMasteryState(userId: string): MasteryState | null {
  const parsed = masteryStateSchema.safeParse(
    storage.getJSONSync<unknown>(STORAGE_KEY(userId)),
  );
  return parsed.success ? parsed.data : null;
}

async function loadCloudMasteryState(
  userId: string,
): Promise<MasteryState | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      'duration_total_xp,purity_total_xp,consistency_total_xp,comeback_total_xp,boss_total_xp,overall_rank,updated_at',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return cloudRowToState(data, userId);
}

async function persistCloudMasteryState(state: MasteryState): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: state.userId,
      duration_total_xp: state.techniques.durationMastery,
      purity_total_xp: state.techniques.purityMastery,
      consistency_total_xp: state.techniques.consistencyMastery,
      comeback_total_xp: state.techniques.comebackMastery,
      boss_total_xp: state.techniques.bossMastery,
      overall_rank: state.rank,
      overall_level: Math.max(1, Math.floor(state.totalMasteryPoints / 5)),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw error;
  }
}

export async function loadMasteryState(
  userId: string,
): Promise<MasteryState | null> {
  const localState = loadStoredMasteryState(userId);

  try {
    const cloudState = await loadCloudMasteryState(userId);
    if (!cloudState) {
      if (localState) {
        await persistCloudMasteryState(localState);
      }
      return localState;
    }

    if (localState && localState.updatedAt > cloudState.updatedAt) {
      await persistCloudMasteryState(localState);
      return localState;
    }

    storage.setJSONSync(STORAGE_KEY(userId), cloudState);
    return cloudState;
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'mastery',
      operation: 'cloud-sync',
      type: 'network',
    });
    return localState;
  }
}

export function persistMasteryState(state: MasteryState): MasteryState {
  const nextState = { ...state, updatedAt: Date.now() };
  storage.setJSONSync(STORAGE_KEY(state.userId), nextState);
  void persistCloudMasteryState(nextState).catch((error: unknown) => {
    captureSilentFailure(error, {
      feature: 'mastery',
      operation: 'cloud-sync',
      type: 'network',
    });
  });
  return nextState;
}
