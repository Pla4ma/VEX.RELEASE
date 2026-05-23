import { z } from 'zod';
import { getSupabaseClient } from '@/config/supabase';
import { createDebugger } from '@/utils/debug';
import type { SessionNarrative, NarrativeBeat } from './SessionNarrator';

const debug = createDebugger('session-story:narrative-db-mapper');
const supabase = getSupabaseClient();

export const NarrativeBeatDBSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: z.string(),
  data: z.record(z.unknown()),
  narrativeText: z.string(),
  intensity: z.number(),
});

export const SessionNarrativeDBSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  createdAt: z.number(),
  beats: z.array(NarrativeBeatDBSchema),
  openingLine: z.string(),
  closingLine: z.string(),
  theme: z.enum(['triumph', 'struggle', 'comeback', 'mastery', 'learning']),
  totalInterruptions: z.number(),
  longestPureStreak: z.number(),
  comboCount: z.number(),
  criticalHits: z.number(),
  nearDeathMoments: z.number(),
  tensionGraph: z.array(z.number()),
  climaxMoment: z.number(),
  shareableSummary: z.string(),
  heroQuote: z.string(),
});

export type NarrativeRow = z.infer<typeof SessionNarrativeDBSchema>;

interface SupabaseNarrativeRow {
  session_id: string;
  user_id: string;
  created_at: number;
  beats: unknown;
  opening_line: string;
  closing_line: string;
  theme: string;
  total_interruptions: number;
  longest_pure_streak: number;
  combo_count: number;
  critical_hits: number;
  near_death_moments: number;
  tension_graph: number[];
  climax_moment: number;
  shareable_summary: string;
  hero_quote: string;
}

export function toDBFormat(narrative: SessionNarrative): NarrativeRow {
  return {
    ...narrative,
    beats: narrative.beats.map((b) => ({ ...b, type: b.type.toString() })),
  };
}

export function fromDBFormat(db: NarrativeRow): SessionNarrative {
  return {
    ...db,
    beats: db.beats.map((b) => ({
      ...b,
      type: b.type as NarrativeBeat['type'],
    })),
  };
}

export async function persistToDatabase(narrative: NarrativeRow): Promise<void> {
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
    debug.error('Failed to persist narrative to Supabase', error);
    throw error;
  }

  debug.info('Narrative persisted: %s', narrative.sessionId);
}

export async function loadFromDatabase(
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
    debug.error('Failed to load narrative from Supabase', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as SupabaseNarrativeRow;
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    createdAt: row.created_at,
    beats: (row.beats as NarrativeRow['beats']) || [],
    openingLine: row.opening_line || '',
    closingLine: row.closing_line || '',
    theme: (row.theme as NarrativeRow['theme']) || 'mastery',
    totalInterruptions: row.total_interruptions || 0,
    longestPureStreak: row.longest_pure_streak || 0,
    comboCount: row.combo_count || 0,
    criticalHits: row.critical_hits || 0,
    nearDeathMoments: row.near_death_moments || 0,
    tensionGraph: row.tension_graph || [],
    climaxMoment: row.climax_moment || 0,
    shareableSummary: row.shareable_summary || '',
    heroQuote: row.hero_quote || '',
  };
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
    debug.error('Failed to load user narratives from Supabase', error);
    throw error;
  }

  return (data || []).map((row: SupabaseNarrativeRow) => ({
    sessionId: row.session_id,
    userId: row.user_id,
    createdAt: row.created_at,
    beats: (row.beats as NarrativeRow['beats']) || [],
    openingLine: row.opening_line || '',
    closingLine: row.closing_line || '',
    theme: (row.theme as NarrativeRow['theme']) || 'mastery',
    totalInterruptions: row.total_interruptions || 0,
    longestPureStreak: row.longest_pure_streak || 0,
    comboCount: row.combo_count || 0,
    criticalHits: row.critical_hits || 0,
    nearDeathMoments: row.near_death_moments || 0,
    tensionGraph: row.tension_graph || [],
    climaxMoment: row.climax_moment || 0,
    shareableSummary: row.shareable_summary || '',
    heroQuote: row.hero_quote || '',
  }));
}
