import { z } from 'zod';
import type { HomeSurfaceMap } from './surface-decision-schemas';

export const Day0PolicyLimitSchema = z
  .object({
    maxVisibleSurfaces: z.number().int().positive(),
    maxPrimaryCta: z.literal(1),
    maxSpotlights: z.literal(1),
    maxTeasers: z.number().int().nonnegative(),
    noFullFeatureCards: z.literal(true),
    noPremium: z.literal(true),
    noSocialEconomyBattlePass: z.literal(true),
  })
  .strict();

export type Day0PolicyLimits = z.infer<typeof Day0PolicyLimitSchema>;

export const DEFAULT_DAY0_POLICY: Day0PolicyLimits = {
  maxVisibleSurfaces: 5,
  maxPrimaryCta: 1,
  maxSpotlights: 1,
  maxTeasers: 3,
  noFullFeatureCards: true,
  noPremium: true,
  noSocialEconomyBattlePass: true,
};

export interface Day0PolicyResult {
  valid: boolean;
  violations: string[];
  corrected: HomeSurfaceMap;
}
