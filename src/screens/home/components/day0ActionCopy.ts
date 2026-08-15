/**
 * Day-0 action sheet mode copy.
 */
import type { Day0Mode } from '../services/day0-agent-schemas';

export interface Day0ModeCopy {
  title: string;
  eyebrow: string;
  prompt: string;
}

export const DAY0_MODE_LABELS: Record<Day0Mode, Day0ModeCopy> = {
  focus: {
    title: 'Start a focus block',
    eyebrow: 'Timer',
    prompt: 'What needs a clean block?',
  },
  create: {
    title: 'Brain Dump',
    eyebrow: 'Capture',
    prompt: 'Drop the messy thought here.',
  },
  study: {
    title: 'Tiny Study Plan',
    eyebrow: 'Learning',
    prompt: 'What are you trying to learn?',
  },
  quest: {
    title: 'Tiny Quest Plan',
    eyebrow: 'Challenge',
    prompt: 'What win would make today count?',
  },
};
