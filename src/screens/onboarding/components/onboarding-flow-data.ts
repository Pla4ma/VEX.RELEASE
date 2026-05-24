export const DEFAULT_COMPANION_ELEMENT = 'LUMINA';
export const DEFAULT_PERSONA_ID = 'mentor';

export const STEP_TITLES = [
  'Pick your first win',
  'Choose the motivation style',
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
    title: 'Pomodoro',
    durationLabel: '25 min',
    subtitle: 'Balanced default for daily consistency.',
    launchDescription: 'The classic balance: long enough to matter, short enough to complete.',
  },
  {
    id: 'deep',
    title: 'Deep Work',
    durationLabel: '60 min',
    subtitle: 'A serious block for meaningful progress.',
    launchDescription: 'A bigger first session if you already know what needs your full attention.',
  },
] as const;

export type StarterPreset = typeof STARTER_PRESETS[number];

export const MOTIVATION_STYLE_OPTIONS = [
  {
    id: 'calm',
    title: 'Calm',
    description: 'Quiet guidance, fewer game surfaces, steady recovery language.',
  },
  {
    id: 'friendly',
    title: 'Friendly',
    description: 'Warm nudges, companion continuity, low-pressure encouragement.',
  },
  {
    id: 'game_like',
    title: 'Game-like',
    description: 'Bosses and challenges show earlier, always tied to focus time.',
  },
  {
    id: 'intense',
    title: 'Intense',
    description: 'Direct coaching, sharper challenge timing, less emotional padding.',
  },
  {
    id: 'student',
    title: 'Study-focused',
    description: 'Study OS and review timing move forward as priority layers.',
  },
] as const;
