import type { FocusGoal } from './schemas';

export const ONBOARDING_GOALS: Array<{
  id: FocusGoal;
  label: string;
  description: string;
}> = [
  {
    id: 'WORK',
    label: 'Find My Rhythm',
    description: 'Let VEX learn what kind of sessions fit you best.',
  },
  {
    id: 'STUDY',
    label: 'Study Better',
    description: 'Turn material into focused blocks.',
  },
  {
    id: 'CREATIVE',
    label: 'Start a Project',
    description: 'Open around one clear next move.',
  },
  {
    id: 'PERSONAL',
    label: 'Recover Momentum',
    description: 'Begin gently without losing the day.',
  },
];
