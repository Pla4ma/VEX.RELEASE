import type { JourneyState } from './schemas';

export function persistJourneyState(_state: JourneyState): void {
  // No persistence — journey state is computed on-demand.
}
