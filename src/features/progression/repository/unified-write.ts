import { supabase } from '../../../config/supabase';
import { RepositoryError } from '../../../lib/repository/error-handling';
import type { UnifiedMasteryState, MasteryTrack } from '../unified-mastery';

type MasteryTrackRow = {
  duration_xp: number;
  duration_total_xp: number;
  purity_xp: number;
  purity_total_xp: number;
  consistency_xp: number;
  consistency_total_xp: number;
  comeback_xp: number;
  comeback_total_xp: number;
  boss_xp: number;
  boss_total_xp: number;
};

function stateToDb(state: UnifiedMasteryState): Record<string, unknown> {
  return {
    duration_level: state.tracks.DURATION.level,
    duration_xp: state.tracks.DURATION.xp,
    duration_total_xp: state.tracks.DURATION.totalXp,
    purity_level: state.tracks.PURITY.level,
    purity_xp: state.tracks.PURITY.xp,
    purity_total_xp: state.tracks.PURITY.totalXp,
    consistency_level: state.tracks.CONSISTENCY.level,
    consistency_xp: state.tracks.CONSISTENCY.xp,
    consistency_total_xp: state.tracks.CONSISTENCY.totalXp,
    comeback_level: state.tracks.COMEBACK.level,
    comeback_xp: state.tracks.COMEBACK.xp,
    comeback_total_xp: state.tracks.COMEBACK.totalXp,
    boss_level: state.tracks.BOSS.level,
    boss_xp: state.tracks.BOSS.xp,
    boss_total_xp: state.tracks.BOSS.totalXp,
    overall_level: state.overallLevel,
    overall_rank: state.overallRank,
  };
}

function buildTrackXpUpdate(track: MasteryTrack, row: MasteryTrackRow, xpAmount: number): Record<string, number> {
  switch (track) {
    case 'DURATION': return { duration_xp: row.duration_xp + xpAmount, duration_total_xp: row.duration_total_xp + xpAmount };
    case 'PURITY': return { purity_xp: row.purity_xp + xpAmount, purity_total_xp: row.purity_total_xp + xpAmount };
    case 'CONSISTENCY': return { consistency_xp: row.consistency_xp + xpAmount, consistency_total_xp: row.consistency_total_xp + xpAmount };
    case 'COMEBACK': return { comeback_xp: row.comeback_xp + xpAmount, comeback_total_xp: row.comeback_total_xp + xpAmount };
    case 'BOSS': return { boss_xp: row.boss_xp + xpAmount, boss_total_xp: row.boss_total_xp + xpAmount };
  }
}

export async function updateMasteryTrack(userId: string, state: UnifiedMasteryState): Promise<void> {
  const { error } = await supabase.from('mastery_tracks').update(stateToDb(state)).eq('user_id', userId);
  if (error) {
    throw new RepositoryError('updateMasteryTrack', error);
  }
}

async function updateTrackXpFallback(userId: string, track: MasteryTrack, row: MasteryTrackRow, xpAmount: number): Promise<void> {
  const { error } = await supabase.from('mastery_tracks').update(buildTrackXpUpdate(track, row, xpAmount)).eq('user_id', userId);
  if (error) {
    throw new RepositoryError('updateTrackXpFallback', error);
  }
}

export async function incrementTrackXp(userId: string, track: MasteryTrack, xpAmount: number): Promise<void> {
  const { error } = await supabase.rpc('increment_track_xp', {
    p_user_id: userId,
    p_track: track.toLowerCase(),
    p_amount: xpAmount,
  });
  if (!error) {
    return;
  }
  const { data } = await supabase
    .from('mastery_tracks')
    .select('duration_xp,duration_total_xp,purity_xp,purity_total_xp,consistency_xp,consistency_total_xp,comeback_xp,comeback_total_xp,boss_xp,boss_total_xp')
    .eq('user_id', userId)
    .single();
  if (data) {
    await updateTrackXpFallback(userId, track, data, xpAmount);
  }
}
