import { z } from 'zod';
import { launchColors } from '@theme/tokens/launch-colors';


export const NarrativeBeatSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: z.enum([
    'OPENING',
    'INTERRUPTION',
    'RECOVERY',
    'PURE_FOCUS_STREAK',
    'COMBO_ACHIEVED',
    'BOSS_PHASE_CHANGE',
    'NEAR_DEATH_MOMENT',
    'FINAL_PUSH',
    'VICTORY',
    'DEFEAT',
  ]),
  data: z.record(z.unknown()),
  narrativeText: z.string(),
  intensity: z.number().min(0).max(1),
});

export type NarrativeBeat = z.infer<typeof NarrativeBeatSchema>;

export type NarrativeTheme = 'triumph' | 'struggle' | 'comeback' | 'mastery' | 'learning';

export interface SessionNarrative {
  sessionId: string;
  userId: string;
  createdAt: number;
  beats: NarrativeBeat[];
  openingLine: string;
  closingLine: string;
  theme: NarrativeTheme;
  totalInterruptions: number;
  longestPureStreak: number;
  comboCount: number;
  criticalHits: number;
  nearDeathMoments: number;
  tensionGraph: number[];
  climaxMoment: number;
  shareableSummary: string;
  heroQuote: string;
}

export interface FinalStats {
  duration: number;
  purity: number;
  bossDefeated: boolean;
}

export const THEME_COLORS: Record<NarrativeTheme, string> = {
  triumph: launchColors.hex_10b981,
  struggle: launchColors.hex_f59e0b,
  comeback: launchColors.hex_ef4444,
  mastery: launchColors.hex_8b5cf6,
  learning: launchColors.hex_3b82f6,
};
