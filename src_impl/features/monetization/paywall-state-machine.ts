/**
 * Paywall State Machine
 *
 * Manages paywall presentation states and transitions.
 */

import { createDebugger } from '../../utils/debug';

const debug = createDebugger('monetization:paywall-sm');

// Paywall states
export type PaywallState = 'idle' | 'loading' | 'presenting' | 'trial_started' | 'purchasing' | 'success' | 'failed' | 'dismissed' | 'restoring';

// Paywall events
export type PaywallEvent = { type: 'TRIGGER'; context: PaywallContext } | { type: 'LOAD' } | { type: 'PRESENT' } | { type: 'START_TRIAL'; tier: string } | { type: 'PURCHASE'; tier: string } | { type: 'PURCHASE_SUCCESS' } | { type: 'PURCHASE_FAILED'; error: string } | { type: 'DISMISS' } | { type: 'RESTORE' } | { type: 'RESTORE_SUCCESS' } | { type: 'RESTORE_FAILED'; error: string };

// Paywall context
export interface PaywallContext {
  userId: string;
  currentTier: string;
  sessionsCompleted: number;
  lastShownAt?: number;
  selectedTier?: string;
  error?: string;
}

// State machine state
export interface PaywallMachineState {
  state: PaywallState;
  context: PaywallContext;
  canDismiss: boolean;
  canRestore: boolean;
}

// Initial state
export function createInitialState(context: PaywallContext): PaywallMachineState {
  return {
    state: 'idle',
    context,
    canDismiss: true,
    canRestore: true,
  };
}

// State transition function
export function transitionPaywallState(current: PaywallMachineState, event: PaywallEvent): PaywallMachineState {
  debug.info('Paywall transition: %s -> %s', current.state, event.type);

  switch (current.state) {
    case 'idle':
      if (event.type === 'TRIGGER') {
        return {
          ...current,
          state: 'loading',
          context: event.context,
        };
      }
      break;

    case 'loading':
      if (event.type === 'PRESENT') {
        return {
          ...current,
          state: 'presenting',
        };
      }
      if (event.type === 'LOAD') {
        return current;
      }
      break;

    case 'presenting':
      if (event.type === 'START_TRIAL') {
        return {
          ...current,
          state: 'trial_started',
          context: { ...current.context, selectedTier: event.tier },
        };
      }
      if (event.type === 'PURCHASE') {
        return {
          ...current,
          state: 'purchasing',
          context: { ...current.context, selectedTier: event.tier },
        };
      }
      if (event.type === 'RESTORE') {
        return {
          ...current,
          state: 'restoring',
        };
      }
      if (event.type === 'DISMISS') {
        return {
          ...current,
          state: 'dismissed',
        };
      }
      break;

    case 'trial_started':
      if (event.type === 'PURCHASE_SUCCESS') {
        return {
          ...current,
          state: 'success',
        };
      }
      if (event.type === 'DISMISS') {
        return {
          ...current,
          state: 'dismissed',
        };
      }
      break;

    case 'purchasing':
      if (event.type === 'PURCHASE_SUCCESS') {
        return {
          ...current,
          state: 'success',
        };
      }
      if (event.type === 'PURCHASE_FAILED') {
        return {
          ...current,
          state: 'failed',
          context: { ...current.context, error: event.error },
        };
      }
      break;

    case 'failed':
      if (event.type === 'PURCHASE') {
        return {
          ...current,
          state: 'purchasing',
          context: { ...current.context, error: undefined },
        };
      }
      if (event.type === 'DISMISS') {
        return {
          ...current,
          state: 'dismissed',
        };
      }
      break;

    case 'restoring':
      if (event.type === 'RESTORE_SUCCESS') {
        return {
          ...current,
          state: 'success',
        };
      }
      if (event.type === 'RESTORE_FAILED') {
        return {
          ...current,
          state: 'failed',
          context: { ...current.context, error: event.error },
        };
      }
      break;

    case 'success':
    case 'dismissed':
      // Terminal states - reset to idle
      if (event.type === 'TRIGGER') {
        return createInitialState(event.context);
      }
      break;
  }

  // No valid transition
  return current;
}

// Get state message for UI
export function getPaywallStateMessage(state: PaywallState): string {
  switch (state) {
    case 'idle':
      return '';
    case 'loading':
      return 'Loading...';
    case 'presenting':
      return 'Choose your plan';
    case 'trial_started':
      return 'Starting your free trial...';
    case 'purchasing':
      return 'Processing payment...';
    case 'success':
      return 'Welcome to Premium!';
    case 'failed':
      return 'Something went wrong. Please try again.';
    case 'dismissed':
      return 'Maybe later';
    case 'restoring':
      return 'Restoring purchases...';
  }
}

// Check if state allows dismissal
export function canDismissPaywall(state: PaywallState): boolean {
  return ['presenting', 'failed'].includes(state);
}

// Check if state allows purchase
export function canPurchase(state: PaywallState): boolean {
  return ['presenting', 'failed', 'trial_started'].includes(state);
}

// Check if state is terminal
export function isTerminalState(state: PaywallState): boolean {
  return ['success', 'dismissed'].includes(state);
}

// Get retry action for failed state
export function getRetryAction(state: PaywallMachineState): PaywallEvent | null {
  if (state.state !== 'failed') {
    return null;
  }

  if (state.context.selectedTier) {
    return { type: 'PURCHASE', tier: state.context.selectedTier };
  }

  return { type: 'RESTORE' };
}

// Create paywall trigger event
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
