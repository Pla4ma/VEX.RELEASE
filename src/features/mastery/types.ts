import { z } from 'zod';
import { lightColors } from '@/theme/tokens/colors';

export const MasteryRankSchema = z.enum(['APPRENTICE', 'ADEPT', 'EXPERT', 'MASTER', 'GRANDMASTER']);
export type MasteryRank = z.infer<typeof MasteryRankSchema>;

const techniqueKeys = ['durationMastery', 'purityMastery', 'consistencyMastery', 'comebackMastery', 'bossMastery'] as const;
export const TechniqueKeySchema = z.enum(techniqueKeys);
export type TechniqueKey = z.infer<typeof TechniqueKeySchema>;

export const MasteryStateSchema = z.object({
  userId: z.string(),
  totalMasteryPoints: z.number(),
  rank: MasteryRankSchema,
  techniques: z.object({
    durationMastery: z.number(),
    purityMastery: z.number(),
    consistencyMastery: z.number(),
    comebackMastery: z.number(),
    bossMastery: z.number(),
  }),
  activeChallenges: z.array(z.object({
    id: z.string(),
    technique: TechniqueKeySchema,
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ELITE']),
    target: z.number(),
    current: z.number(),
    unit: z.string(),
    masteryPoints: z.number(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CLAIMED']),
    completedAt: z.number().nullable(),
  })),
  unlockedFeatures: z.array(z.string()),
  updatedAt: z.number(),
});
export type MasteryState = z.infer<typeof MasteryStateSchema>;

export const MasteryChallengeSchema = MasteryStateSchema.shape.activeChallenges.element;
export type MasteryChallenge = z.infer<typeof MasteryChallengeSchema>;

export const MASTERY_RANK_THRESHOLDS: Record<MasteryRank, number> = {
  APPRENTICE: 0,
  ADEPT: 10,
  EXPERT: 25,
  MASTER: 50,
  GRANDMASTER: 100,
};

export const ChallengeTemplateSchema = z.object({
  title: z.string(),
  description: z.string(),
  target: z.number(),
  unit: z.string(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ELITE']),
  points: z.number(),
});
export type ChallengeTemplate = z.infer<typeof ChallengeTemplateSchema>;

export const RankDisplaySchema = z.object({ title: z.string(), color: z.string(), icon: z.string() });
export type RankDisplay = z.infer<typeof RankDisplaySchema>;

const RANK_DISPLAYS: Record<MasteryRank, RankDisplay> = {
  APPRENTICE: {
    title: 'Apprentice',
    color: lightColors.text.muted,
    icon: '',
  },
  ADEPT: {
    title: 'Adept',
    color: lightColors.text.tertiary,
    icon: '',
  },
  EXPERT: {
    title: 'Expert',
    color: lightColors.accent.blue,
    icon: '',
  },
  MASTER: {
    title: 'Master',
    color: lightColors.accent.purple,
    icon: '',
  },
  GRANDMASTER: {
    title: 'Grandmaster',
    color: lightColors.semantic.vexGold,
    icon: '',
  },
};

export function getMasteryRankDisplay(rank: MasteryRank): RankDisplay {
  return RANK_DISPLAYS[rank] ?? RANK_DISPLAYS.APPRENTICE;
}
