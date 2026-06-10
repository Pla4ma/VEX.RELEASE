export const ONBOARDING_PROMISE_COPY = {
  primary: 'VEX changes based on how you work.',
  secondary:
    'Answer a few questions and VEX will open around how you work.',
} as const;

export const ONBOARDING_PROGRESS_PHASES = [
  'Understand',
  'Match',
  'Open',
] as const;

export const DEFAULT_COMPANION_ELEMENT = 'LUMINA';
export const DEFAULT_PERSONA_ID = 'mentor';

export const STEP_TITLES = [
  'Pick your first win',
  'How do you want to start?',
  'Confirm your focus mode',
] as const;

export const STARTER_PRESETS = [
  {
    id: 'quick',
    title: 'Quick Focus',
    durationLabel: '15 min',
    subtitle: 'Best first run. Low friction, real streak credit.',
    launchDescription: 'A focused block short enough to finish today.',
  },
  {
    id: 'pomodoro',
    title: 'Standard Focus',
    durationLabel: '25 min',
    subtitle: 'Balanced default for daily consistency.',
    launchDescription:
      'A balanced block: long enough to matter, short enough to complete.',
  },
  {
    id: 'deep',
    title: 'Deep Work',
    durationLabel: '60 min',
    subtitle: 'A serious block for meaningful progress.',
    launchDescription:
      'A bigger first session if you already know what needs your full attention.',
  },
] as const;

export type StarterPreset = (typeof STARTER_PRESETS)[number];

export type OnboardingGoalOption = {
  id: string;
  label: string;
  description: string;
};

export type MotivationStyleOption = {
  id: string;
  title: string;
  description: string;
};

export const MOTIVATION_STYLE_OPTIONS: MotivationStyleOption[] = [
  {
    id: 'calm',
    title: 'Clean',
    description: 'Quiet, minimal, one thing.',
  },
  {
    id: 'worker',
    title: 'Project',
    description: 'Keep the next move close.',
  },
  {
    id: 'study_focused',
    title: 'Study',
    description: 'Structure material and review.',
  },
  {
    id: 'intense',
    title: 'Run',
    description: 'Fast, energized momentum.',
  },
];
