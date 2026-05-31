/**
 * Paywall State Machine — transition tests
 */
import {
  createInitialState,
  createPaywallTrigger,
  transitionPaywallState,
  type PaywallContext,
} from '../paywall-state-machine';

describe('Paywall State Machine — transitions', () => {
  const mockContext: PaywallContext = {
    userId: 'user-1',
    currentTier: 'free',
    sessionsCompleted: 10,
  };

  describe('createInitialState', () => {
    it('creates idle state', () => {
      const state = createInitialState(mockContext);
      expect(state.state).toBe('idle');
      expect(state.context).toEqual(mockContext);
      expect(state.canDismiss).toBe(true);
      expect(state.canRestore).toBe(true);
    });
  });

  describe('transitionPaywallState', () => {
    it('transitions idle to loading on trigger', () => {
      const initial = createInitialState(mockContext);
      const triggerEvent = createPaywallTrigger('user-1', 'free', 10);
      const next = transitionPaywallState(initial, triggerEvent);
      expect(next.state).toBe('loading');
    });

    it('transitions loading to presenting', () => {
      const loading = {
        ...createInitialState(mockContext),
        state: 'loading' as const,
      };
      const next = transitionPaywallState(loading, { type: 'PRESENT' });
      expect(next.state).toBe('presenting');
    });

    it('transitions presenting to purchasing', () => {
      const presenting = {
        ...createInitialState(mockContext),
        state: 'presenting' as const,
      };
      const next = transitionPaywallState(presenting, {
        type: 'PURCHASE',
        tier: 'plus',
      });
      expect(next.state).toBe('purchasing');
      expect(next.context.selectedTier).toBe('plus');
    });

    it('transitions presenting to trial_started', () => {
      const presenting = {
        ...createInitialState(mockContext),
        state: 'presenting' as const,
      };
      const next = transitionPaywallState(presenting, {
        type: 'START_TRIAL',
        tier: 'plus',
      });
      expect(next.state).toBe('trial_started');
      expect(next.context.selectedTier).toBe('plus');
    });

    it('transitions purchasing to success', () => {
      const purchasing = {
        ...createInitialState(mockContext),
        state: 'purchasing' as const,
      };
      const next = transitionPaywallState(purchasing, {
        type: 'PURCHASE_SUCCESS',
      });
      expect(next.state).toBe('success');
    });

    it('transitions purchasing to failed', () => {
      const purchasing = {
        ...createInitialState(mockContext),
        state: 'purchasing' as const,
      };
      const next = transitionPaywallState(purchasing, {
        type: 'PURCHASE_FAILED',
        error: 'Payment declined',
      });
      expect(next.state).toBe('failed');
      expect(next.context.error).toBe('Payment declined');
    });

    it('transitions presenting to dismissed', () => {
      const presenting = {
        ...createInitialState(mockContext),
        state: 'presenting' as const,
      };
      const next = transitionPaywallState(presenting, { type: 'DISMISS' });
      expect(next.state).toBe('dismissed');
    });

    it('transitions failed to purchasing on retry', () => {
      const failed = {
        ...createInitialState(mockContext),
        state: 'failed' as const,
        context: { ...mockContext, selectedTier: 'plus' },
      };
      const next = transitionPaywallState(failed, {
        type: 'PURCHASE',
        tier: 'plus',
      });
      expect(next.state).toBe('purchasing');
      expect(next.context.error).toBeUndefined();
    });

    it('transitions presenting to restoring', () => {
      const presenting = {
        ...createInitialState(mockContext),
        state: 'presenting' as const,
      };
      const next = transitionPaywallState(presenting, { type: 'RESTORE' });
      expect(next.state).toBe('restoring');
    });

    it('transitions restoring to success', () => {
      const restoring = {
        ...createInitialState(mockContext),
        state: 'restoring' as const,
      };
      const next = transitionPaywallState(restoring, {
        type: 'RESTORE_SUCCESS',
      });
      expect(next.state).toBe('success');
    });

    it('transitions restoring to failed', () => {
      const restoring = {
        ...createInitialState(mockContext),
        state: 'restoring' as const,
      };
      const next = transitionPaywallState(restoring, {
        type: 'RESTORE_FAILED',
        error: 'No purchases found',
      });
      expect(next.state).toBe('failed');
    });

    it('resets from success to idle on trigger', () => {
      const success = {
        ...createInitialState(mockContext),
        state: 'success' as const,
      };
      const triggerEvent = createPaywallTrigger('user-1', 'plus', 20);
      const next = transitionPaywallState(success, triggerEvent);
      expect(next.state).toBe('idle');
    });

    it('ignores invalid transitions', () => {
      const idle = createInitialState(mockContext);
      const next = transitionPaywallState(idle, {
        type: 'PURCHASE',
        tier: 'plus',
      });
      expect(next.state).toBe('idle');
    });
  });

  describe('createPaywallTrigger', () => {
    it('creates trigger event with context', () => {
      const event = createPaywallTrigger(
        'user-1',
        'free',
        10,
        Date.now() - 86400000,
      );
      expect(event.type).toBe('TRIGGER');
      expect(event.context.userId).toBe('user-1');
      expect(event.context.currentTier).toBe('free');
      expect(event.context.sessionsCompleted).toBe(10);
    });

    it('creates trigger without lastShownAt', () => {
      const event = createPaywallTrigger('user-1', 'free', 10);
      expect(event.context.lastShownAt).toBeUndefined();
    });
  });
});
