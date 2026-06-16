import type { BehaviorResolverInput } from './behavior-signal-schemas';

export const DISMISS_THRESHOLD = 3;
export const CLICK_TO_REINFORCE_THRESHOLD = 2;
export const SIGNIFICANT_CLICK_WINDOW = 2;

export function countByType(
  signals: BehaviorResolverInput['recentSignals'],
  type: string,
): number {
  return signals.filter((s) => s.signalType === type).length;
}

export function countDistinctSurfaces(
  signals: BehaviorResolverInput['recentSignals'],
  type: string,
): Set<string> {
  const surfaces = new Set<string>();
  for (const s of signals) {
    if (s.signalType === type) {surfaces.add(s.surfaceKey);}
  }
  return surfaces;
}

export function hasMinimumSignals(
  signals: BehaviorResolverInput['recentSignals'],
  type: string,
  threshold: number,
): boolean {
  return countByType(signals, type) >= threshold;
}

export function hasSurfacesDismissedMultipleTimes(
  signals: BehaviorResolverInput['recentSignals'],
): string[] {
  const dismissCounts = new Map<string, number>();
  for (const s of signals) {
    if (s.signalType === 'surface_dismissed') {
      const key = s.surfaceKey;
      dismissCounts.set(key, (dismissCounts.get(key) ?? 0) + 1);
    }
  }
  const result: string[] = [];
  for (const [key, count] of dismissCounts.entries()) {
    if (count >= DISMISS_THRESHOLD) { result.push(key); }
  }
  return result;
}

export function hasSurfacesClickedMultipleTimes(
  signals: BehaviorResolverInput['recentSignals'],
): string[] {
  const clickCounts = new Map<string, number>();
  for (const s of signals) {
    if (s.signalType === 'surface_clicked') {
      const key = s.surfaceKey;
      clickCounts.set(key, (clickCounts.get(key) ?? 0) + 1);
    }
  }
  const result: string[] = [];
  for (const [key, count] of clickCounts.entries()) {
    if (count >= CLICK_TO_REINFORCE_THRESHOLD) { result.push(key); }
  }
  return result;
}
