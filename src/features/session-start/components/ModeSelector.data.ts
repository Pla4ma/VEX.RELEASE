import { SessionMode } from '@/session/modes';

export type ModeCard = {
  description: string;
  glyph: string;
  mode: SessionMode;
  name: string;
};

export const FOCUS_MODE_CARDS: ModeCard[] = [
  {
    description: 'High intensity — for hard, uninterrupted work',
    glyph: 'deep',
    mode: SessionMode.DEEP_WORK,
    name: 'Deep Work',
  },
  {
    description: 'Steady, low-pressure — protect a single thread',
    glyph: 'casual',
    mode: SessionMode.LIGHT_FOCUS,
    name: 'Light Focus',
  },
  {
    description: 'Named study blocks with recall and review built in',
    glyph: 'study',
    mode: SessionMode.STUDY,
    name: 'Study',
  },
  {
    description: 'Open-ended creative flow — no pressure, no timers',
    glyph: 'creative',
    mode: SessionMode.CREATIVE,
    name: 'Creative',
  },
  {
    description: 'Short blocks — chain them for momentum',
    glyph: 'sprint',
    mode: SessionMode.SPRINT,
    name: 'Sprint',
  },
];

export const SESSIONLESS_MODE_CARDS: ModeCard[] = [
  {
    description: 'Plan your week, projects, and study blocks',
    glyph: 'deep',
    mode: SessionMode.PLAN,
    name: 'Plan',
  },
  {
    description: 'Review your progress and insights',
    glyph: 'casual',
    mode: SessionMode.REVIEW,
    name: 'Review',
  },
  {
    description: 'Quick capture — voice, photo, link, brain dump',
    glyph: 'creative',
    mode: SessionMode.CAPTURE,
    name: 'Capture',
  },
  {
    description: 'Track habits and micro-commitments',
    glyph: 'sprint',
    mode: SessionMode.HABIT,
    name: 'Habit',
  },
];