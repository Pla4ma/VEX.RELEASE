/** NO-OP — boss combat archived. Session boss integration returns no-op unsubscriber. */
import { getAvailabilityFor } from '../../../features/liveops-config/feature-access-store';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('session:boss-integration');

export function calculateBossDamage(): number {
  return 0;
}

export function initializeSessionBossIntegration(): () => void {
  const availability = getAvailabilityFor('boss_tab');
  if (!availability.canSubscribeToEvents) {
    debug.info(
      'SessionBossIntegration skipped — boss_tab feature cannot subscribe to events (state: %s)',
      availability.state,
    );
  }
  return () => {};
}
