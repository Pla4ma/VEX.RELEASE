export const ONBOARDING_PROMISE_COPY = {
  primary: 'VEX changes based on how you work.',
  secondary:
    'Answer a few questions, start one focused session, and VEX unlocks the system your brain needs.',
} as const;

export const ONBOARDING_PROGRESS_PHASES = [
  'Understand',
  'Match',
  'Start',
] as const;

export const DEFAULT_COMPANION_ELEMENT = 'LUMINA';
export const DEFAULT_PERSONA_ID = 'mentor';

export const STEP_TITLES = [
  'Pick your first win',
  'Choose the motivation style',
  'Confirm your focus mode',
  'Choose your first session',
  'Start now',
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

export const MOTIVATION_STYLE_OPTIONS = [
  {
    id: 'calm',
    title: 'Calm',
    description: 'Quiet guidance, softer reminders, steady recovery language.',
  },
  {
    id: 'friendly',
    title: 'Friendly',
    description:
      'Warm nudges, companion continuity, low-pressure encouragement.',
  },
  {
    id: 'game_like',
    title: 'Structured',
    description: 'Milestones, visible progress, and clear next actions.',
  },
  {
    id: 'intense',
    title: 'Intense',
    description: 'Direct coaching, tighter prompts, less emotional padding.',
  },
  {
    id: 'student',
    title: 'Study-focused',
    description:
      'Recall, deadlines, and review timing move forward when useful.',
  },
] as const;
