import { getSupabaseClient } from '@/config/supabase';
import {
  mapSupabaseRowToNarrativeRow,
  type NarrativeRow,
  type SupabaseNarrativeRow,
} from './narrative-db-mapper';

const supabase = getSupabaseClient();

export async function persistNarrativeToDB(narrative: NarrativeRow): Promise<void> {
  const { error } = await supabase.from('session_narratives').upsert(
    {
      session_id: narrative.sessionId,
      user_id: narrative.userId,
      created_at: narrative.createdAt,
      beats: narrative.beats,
      opening_line: narrative.openingLine,
      closing_line: narrative.closingLine,
      theme: narrative.theme,
      total_interruptions: narrative.totalInterruptions,
      longest_pure_streak: narrative.longestPureStreak,
      combo_count: narrative.comboCount,
      critical_hits: narrative.criticalHits,
      near_death_moments: narrative.nearDeathMoments,
      tension_graph: narrative.tensionGraph,
      climax_moment: narrative.climaxMoment,
      shareable_summary: narrative.shareableSummary,
      hero_quote: narrative.heroQuote,
    },
    { onConflict: 'session_id' },
  );
  if (error) {
    throw error;
  }
}

export async function loadNarrativeFromDB(
  sessionId: string,
): Promise<NarrativeRow | null> {
  const { data, error } = await supabase
    .from('session_narratives')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapSupabaseRowToNarrativeRow(data as SupabaseNarrativeRow);
}

export async function loadUserNarrativesFromDB(
  userId: string,
  limit: number,
): Promise<NarrativeRow[]> {
  const { data, error } = await supabase
    .from('session_narratives')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map((row: SupabaseNarrativeRow) =>
    mapSupabaseRowToNarrativeRow(row),
  );
}
