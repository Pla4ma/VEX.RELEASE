import type { z } from 'zod';

import type {
  StreakShieldCopySchema,
  StreakShieldMomentInputSchema,
  StreakShieldRecordSchema,
} from './schemas';

export type StreakShieldCopy = z.infer<typeof StreakShieldCopySchema>;
export type StreakShieldMomentInput = z.infer<typeof StreakShieldMomentInputSchema>;
export type StreakShieldRecord = z.infer<typeof StreakShieldRecordSchema>;

export type StreakShieldMomentReason =
  | 'eligible'
  | 'cooldown'
  | 'grade'
  | 'premium'
  | 'session'
  | 'streak';

export type StreakShieldRouteParams = {
  contextBody: string;
  contextCta: string;
  contextHeadline: string;
  gatedFeature: 'streak_freeze';
  source: 'post_session_streak_shield';
};

export type StreakShieldMoment = {
  copy: StreakShieldCopy;
  routeParams: StreakShieldRouteParams;
};

export type StreakShieldMomentResult = {
  copy: StreakShieldCopy;
  reason: StreakShieldMomentReason;
  routeParams: StreakShieldRouteParams;
  shouldShow: boolean;
};
