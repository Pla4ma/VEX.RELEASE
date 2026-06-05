/**
 * Particle data factory for SkiaParticles. Split out to keep
 * SkiaParticles.tsx under the 200 LOC line limit.
 */
export type ParticleHue = 'gold' | 'silver' | 'rose';

export type Particle = {
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
  hue: ParticleHue;
  sizeFactor: number;
  innerColor: string;
  midColor: string;
  outerColor: string;
};

export const PARTICLE_COUNT = 60;
export const PARALLAX_STRENGTH = 28;

const HUE_TABLE: Record<
  ParticleHue,
  { inner: string; mid: string; outer: string }
> = {
  gold: {
    inner: 'rgba(255, 230, 175, 0.95)',
    mid: 'rgba(255, 200, 120, 0.55)',
    outer: 'rgba(255, 200, 120, 0)',
  },
  silver: {
    inner: 'rgba(255, 255, 255, 0.85)',
    mid: 'rgba(220, 235, 255, 0.45)',
    outer: 'rgba(220, 235, 255, 0)',
  },
  rose: {
    inner: 'rgba(255, 210, 220, 0.85)',
    mid: 'rgba(255, 170, 190, 0.45)',
    outer: 'rgba(255, 170, 190, 0)',
  },
};

function pickHue(i: number): ParticleHue {
  const roll = i % 5;
  if (roll === 0) {return 'rose';}
  if (roll === 1) {return 'silver';}
  return 'gold';
}

export function buildParticles(count: number): Particle[] {
  const arr: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    const hue = pickHue(i);
    const palette = HUE_TABLE[hue];
    arr.push({
      baseX: (i * 137 + 23) % 100,
      baseY: (i * 71 + 11) % 100,
      radius: 1.2 + ((i * 19) % 10) * 0.4,
      phase: (i * 0.27) % (Math.PI * 2),
      hue,
      sizeFactor: 0.6 + ((i * 31) % 10) * 0.08,
      innerColor: palette.inner,
      midColor: palette.mid,
      outerColor: palette.outer,
    });
  }
  return arr;
}
