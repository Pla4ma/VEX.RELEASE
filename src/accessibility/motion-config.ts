export const DEFAULT_ANIMATION_DURATION = 300;

export const DEFAULT_HAPTIC_TYPES = [
  "light",
  "medium",
  "heavy",
  "success",
  "warning",
  "error",
] as const;

export type HapticType = (typeof DEFAULT_HAPTIC_TYPES)[number];

export interface MotionPerformanceStats {
  totalAnimations: number;
  activeAnimations: number;
  averageDuration: number;
  reducedMotionUsage: number;
}

export function createDefaultPerformanceStats(
  registrySize: number,
  reducedMotion: boolean,
): MotionPerformanceStats {
  return {
    totalAnimations: registrySize,
    activeAnimations: 0,
    averageDuration: DEFAULT_ANIMATION_DURATION,
    reducedMotionUsage: reducedMotion ? 1 : 0,
  };
}
