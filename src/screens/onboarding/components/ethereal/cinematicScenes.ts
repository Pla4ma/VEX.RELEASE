import type { MascotMood } from './VexMascotGuide.tokens';

export type CinematicScene = {
  mood: MascotMood;
  title: string;
  subtitle: string;
  chip: string;
};

export const CINEMATIC_SCENES: readonly CinematicScene[] = [
  {
    mood: 'wave',
    title: 'VEX is waking your focus lens.',
    subtitle: 'Mascot reads your first signal, then shapes the day around one clean block.',
    chip: 'Signal 01',
  },
  {
    mood: 'thinking',
    title: 'Energy scan is running.',
    subtitle: 'No generic plan. VEX adapts pace, pressure, and first move from your answers.',
    chip: 'Energy 02',
  },
  {
    mood: 'pointing',
    title: 'First block is forming.',
    subtitle: 'Pick three fast signals. VEX opens with a guided setup, not dead questions.',
    chip: 'Block 03',
  },
];

export const FALLBACK_CINEMATIC_SCENE: CinematicScene = {
  mood: 'wave',
  title: 'VEX is waking your focus lens.',
  subtitle: 'Mascot reads your first signal, then shapes the day around one clean block.',
  chip: 'Signal 01',
};
