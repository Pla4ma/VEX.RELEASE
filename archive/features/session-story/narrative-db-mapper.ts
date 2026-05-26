import { z } from 'zod';
import type { SessionNarrative, NarrativeBeat } from './SessionNarrator';

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

export interface SupabaseNarrativeRow {
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

export function mapSupabaseRowToNarrativeRow(row: unknown): NarrativeRow {
  const r = row as Record<string, unknown>;
  const beats = (r['beats'] as NarrativeRow['beats']) || [];
  return {
    sessionId: String(r['session_id'] || ''),
    userId: String(r['user_id'] || ''),
    createdAt: Number(r['created_at'] || 0),
    beats,
    openingLine: String(r['opening_line'] || ''),
    closingLine: String(r['closing_line'] || ''),
    theme: (String(r['theme'] || 'mastery')) as NarrativeRow['theme'],
    totalInterruptions: Number(r['total_interruptions'] || 0),
    longestPureStreak: Number(r['longest_pure_streak'] || 0),
    comboCount: Number(r['combo_count'] || 0),
    criticalHits: Number(r['critical_hits'] || 0),
    nearDeathMoments: Number(r['near_death_moments'] || 0),
    tensionGraph: (r['tension_graph'] as number[]) || [],
    climaxMoment: Number(r['climax_moment'] || 0),
    shareableSummary: String(r['shareable_summary'] || ''),
    heroQuote: String(r['hero_quote'] || ''),
  };
}
