/**
 * Wager Ceremony Integration
 *
 * Integrates the wager system with the spectacle ceremony system.
 * Triggers WagerWonCeremony when a wager is won.
 */

import { eventBus } from '../../../events/EventBus';
import { WagerWonCeremony } from '../components/WagerWonCeremony';

let currentOnComplete: (() => void) | null = null;

/**
 * Initialize wager ceremony integration
 */
export function initializeWagerCeremonyIntegration(): () => void {
  const unsubscribe = eventBus.subscribe('economy:wager_won', (event) => {
    const { userId, wagerId, wonAmount } = event;

    // Show the wager won ceremony
    showWagerWonCeremony(wonAmount);
  });

  return unsubscribe;
}

/**
 * Show the wager won ceremony
 */
export function showWagerWonCeremony(
  amount: number,
  onComplete?: () => void
): void {
  // Store callback for later
  currentOnComplete = onComplete || null;

  // Publish event to show ceremony
  // Economy system will trigger the spectacle
  eventBus.publish('economy:wager_won', {
    userId: 'system',
    wagerId: 'ceremony',
    wonAmount: amount,
  });
}

/**
 * Complete the ceremony (called by UI)
 */
export function completeWagerCeremony(): void {
  if (currentOnComplete) {
    currentOnComplete();
    currentOnComplete = null;
  }
}
