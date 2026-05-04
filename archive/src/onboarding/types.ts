import type { z } from 'zod';

import type {
  CompanionElementSchema,
  OnboardingDraftSchema,
  OnboardingGoalSchema,
  OnboardingProfileSchema,
} from './schemas';

export const ONBOARDING_GOALS = [
  {
    id: 'build_consistency',
    title: 'Build consistency',
    description: 'Show up daily and protect the streak.',
  },
  {
    id: 'deep_work',
    title: 'Do deeper work',
    description: 'Create longer, calmer focus blocks.',
  },
  {
    id: 'study_focus',
    title: 'Study with intention',
    description: 'Turn study sessions into a routine.',
  },
  {
    id: 'beat_distractions',
    title: 'Beat distractions',
    description: 'Start fast and stay locked in.',
  },
] as const;

export type OnboardingGoal = z.infer<typeof OnboardingGoalSchema>;
export type OnboardingDraft = z.infer<typeof OnboardingDraftSchema>;
export type OnboardingProfile = z.infer<typeof OnboardingProfileSchema>;

// PHASE 13.3: Companion element types
export type CompanionElement = z.infer<typeof CompanionElementSchema>;
