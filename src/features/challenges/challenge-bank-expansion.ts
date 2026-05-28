/**
 * Challenge bank expansion — combines all challenge categories into a
 * single unified collection and re-exports for backward compatibility.
 */

import type { ChallengeBankTemplate } from "./challenge-bank-types";
import { MORNING_QUALITY_CHALLENGES } from "./challenge-bank-morning-quality";
import { SOCIAL_COMBAT_CHALLENGES } from "./challenge-bank-social-combat";
import { VOLUME_CHALLENGES } from "./challenge-bank-volume";
import { STREAK_CHALLENGES } from "./challenge-bank-streak";
import { SEASONAL_CHALLENGES } from "./challenge-bank-seasonal";

/** Combined personal challenges from morning-quality and social-combat banks. */
export const PERSONAL_CHALLENGES: ChallengeBankTemplate[] = [
  ...MORNING_QUALITY_CHALLENGES,
  ...SOCIAL_COMBAT_CHALLENGES,
];

export { VOLUME_CHALLENGES };
export { STREAK_CHALLENGES };
export { SEASONAL_CHALLENGES };

export const EXPANDED_CHALLENGE_TEMPLATES: ChallengeBankTemplate[] = [
  ...PERSONAL_CHALLENGES,
  ...VOLUME_CHALLENGES,
  ...STREAK_CHALLENGES,
  ...SEASONAL_CHALLENGES,
];

export const CHALLENGE_COUNT = EXPANDED_CHALLENGE_TEMPLATES.length;

export type { ChallengeBankTemplate };
