import type { WeeklyIntelligence } from './schemas';

export function persistWeeklyIntelligence(_intel: WeeklyIntelligence): void {
  // No persistence — weekly intelligence is computed on-demand from session data.
}
