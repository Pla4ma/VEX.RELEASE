import type { Day0Mode } from '../services/day0-agent-schemas';

export interface Day0Action {
  id: Day0Mode;
  title: string;
  eyebrow: string;
  body: string;
  icon: string;
}

export const DAY0_ACTIONS: Day0Action[] = [
  {
    id: 'focus',
    title: 'Focus',
    eyebrow: 'Timer',
    body: 'Start a clean block and create your first baseline.',
    icon: 'target',
  },
  {
    id: 'create',
    title: 'Create',
    eyebrow: 'Brain dump',
    body: 'Drop an idea, voice note, link, or messy thought.',
    icon: 'file',
  },
  {
    id: 'study',
    title: 'Study',
    eyebrow: 'Tiny plan',
    body: 'Let VEX shape one study target into three steps.',
    icon: 'book',
  },
  {
    id: 'quest',
    title: 'Quest',
    eyebrow: 'Challenge',
    body: 'Turn today into a small win with a finish line.',
    icon: 'sparkles',
  },
];
