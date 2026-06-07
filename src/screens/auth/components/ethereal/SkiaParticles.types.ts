export type Particle = {
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
  hue: 'gold' | 'silver' | 'rose';
  sizeFactor: number;
};

export const PARTICLE_COUNT = 70;
export const PARALLAX_STRENGTH = 28;

export const HUE_COLORS: Record<Particle['hue'], readonly [string, string, string]> = {
  gold: ['rgba(255, 230, 175, 0.95)', 'rgba(255, 200, 120, 0.55)', 'rgba(255, 200, 120, 0)'],
  silver: ['rgba(255, 255, 255, 0.85)', 'rgba(220, 235, 255, 0.45)', 'rgba(220, 235, 255, 0)'],
  rose: ['rgba(255, 210, 220, 0.85)', 'rgba(255, 170, 190, 0.45)', 'rgba(255, 170, 190, 0)'],
};
