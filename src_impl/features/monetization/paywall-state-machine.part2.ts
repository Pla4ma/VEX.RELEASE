import { createDebugger } from "../../utils/debug";


export function canDismissPaywall(state: PaywallState): boolean {
  return ['presenting', 'failed'].includes(state);
}

export function canPurchase(state: PaywallState): boolean {
  return ['presenting', 'failed', 'trial_started'].includes(state);
}

export function isTerminalState(state: PaywallState): boolean {
  return ['success', 'dismissed'].includes(state);
}

export function getRetryAction(state: PaywallMachineState): PaywallEvent | null {
  if (state.state !== 'failed') {
    return null;
  }

  if (state.context.selectedTier) {
    return { type: 'PURCHASE', tier: state.context.selectedTier };
  }

  return { type: 'RESTORE' };
}

export function createPaywallTrigger(userId: string, currentTier: string, sessionsCompleted: number, lastShownAt?: number): PaywallEvent {
  return {
    type: 'TRIGGER',
    context: {
      userId,
      currentTier,
      sessionsCompleted,
      lastShownAt,
    },
  };
}