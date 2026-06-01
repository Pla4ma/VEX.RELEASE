import {
  createInitialState,
  transitionPaywallState,
  getPaywallStateMessage,
  canDismissPaywall,
  canPurchase,
  isTerminalState,
  getRetryAction,
  createPaywallTrigger,
} from '../paywall-state-machine';

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn() },
}));

const TEST_USER = 'test-user-001';

describe('monetization feature — comprehensive tests', () => {
  describe('paywall-state-machine', () => {
    const ctx = { userId: TEST_USER, currentTier: 'free', sessionsCompleted: 10 };

    it('createInitialState returns idle state', () => {
      const state = createInitialState(ctx);
      expect(state.state).toBe('idle');
      expect(state.canDismiss).toBe(true);
      expect(state.canRestore).toBe(true);
    });
    it('TRIGGER transitions from idle to loading', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      expect(state.state).toBe('loading');
    });
    it('PRESENT transitions from loading to presenting', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      state = transitionPaywallState(state, { type: 'PRESENT' });
      expect(state.state).toBe('presenting');
    });
    it('PURCHASE transitions from presenting to purchasing', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      state = transitionPaywallState(state, { type: 'PRESENT' });
      state = transitionPaywallState(state, { type: 'PURCHASE', tier: 'premium' });
      expect(state.state).toBe('purchasing');
    });
    it('PURCHASE_SUCCESS transitions to success', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      state = transitionPaywallState(state, { type: 'PRESENT' });
      state = transitionPaywallState(state, { type: 'PURCHASE', tier: 'premium' });
      state = transitionPaywallState(state, { type: 'PURCHASE_SUCCESS' });
      expect(state.state).toBe('success');
    });
    it('PURCHASE_FAILED transitions to failed with error', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      state = transitionPaywallState(state, { type: 'PRESENT' });
      state = transitionPaywallState(state, { type: 'PURCHASE', tier: 'premium' });
      state = transitionPaywallState(state, { type: 'PURCHASE_FAILED', error: 'card_declined' });
      expect(state.state).toBe('failed');
      expect(state.context.error).toBe('card_declined');
    });
    it('DISMISS from presenting goes to dismissed', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      state = transitionPaywallState(state, { type: 'PRESENT' });
      state = transitionPaywallState(state, { type: 'DISMISS' });
      expect(state.state).toBe('dismissed');
    });
    it('TRIGGER from dismissed resets to initial idle state', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      state = transitionPaywallState(state, { type: 'PRESENT' });
      state = transitionPaywallState(state, { type: 'DISMISS' });
      expect(state.state).toBe('dismissed');
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      expect(state.state).toBe('idle');
    });
    it('RESTORE from presenting goes to restoring', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      state = transitionPaywallState(state, { type: 'PRESENT' });
      state = transitionPaywallState(state, { type: 'RESTORE' });
      expect(state.state).toBe('restoring');
    });
    it('RESTORE_SUCCESS goes to success', () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: 'TRIGGER', context: ctx });
      state = transitionPaywallState(state, { type: 'PRESENT' });
      state = transitionPaywallState(state, { type: 'RESTORE' });
      state = transitionPaywallState(state, { type: 'RESTORE_SUCCESS' });
      expect(state.state).toBe('success');
    });

    it('getPaywallStateMessage returns correct messages', () => {
      expect(getPaywallStateMessage('idle')).toBe('');
      expect(getPaywallStateMessage('presenting')).toBe('Choose your plan');
      expect(getPaywallStateMessage('success')).toContain('Premium');
      expect(getPaywallStateMessage('failed')).toContain('try again');
    });
    it('canDismissPaywall is true only for presenting and failed', () => {
      expect(canDismissPaywall('presenting')).toBe(true);
      expect(canDismissPaywall('failed')).toBe(true);
      expect(canDismissPaywall('loading')).toBe(false);
      expect(canDismissPaywall('success')).toBe(false);
    });
    it('canPurchase is true for presenting, failed, and trial_started', () => {
      expect(canPurchase('presenting')).toBe(true);
      expect(canPurchase('failed')).toBe(true);
      expect(canPurchase('trial_started')).toBe(true);
      expect(canPurchase('loading')).toBe(false);
    });
    it('isTerminalState is true for success and dismissed', () => {
      expect(isTerminalState('success')).toBe(true);
      expect(isTerminalState('dismissed')).toBe(true);
      expect(isTerminalState('presenting')).toBe(false);
    });
    it('getRetryAction returns PURCHASE for failed with selectedTier', () => {
      const state = createInitialState(ctx);
      const failedState = {
        ...state,
        state: 'failed' as const,
        context: { ...ctx, selectedTier: 'premium' },
      };
      const action = getRetryAction(failedState);
      expect(action?.type).toBe('PURCHASE');
    });
    it('getRetryAction returns null for non-failed state', () => {
      expect(getRetryAction(createInitialState(ctx))).toBeNull();
    });
    it('createPaywallTrigger creates a TRIGGER event', () => {
      const event = createPaywallTrigger(TEST_USER, 'free', 10);
      expect(event.type).toBe('TRIGGER');
      expect(event.context.userId).toBe(TEST_USER);
    });
  });
});
