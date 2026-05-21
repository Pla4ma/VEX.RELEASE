import { resolveMonthlyReportAction } from '../progress-actions';
import type { FeatureAccess } from '../../../features/liveops-config/feature-access';

const makeFeature = (overrides: Partial<FeatureAccess>): FeatureAccess => ({
  isDegraded: false,
  isTeased: false,
  isUnlocked: false,
  isVisible: false,
  key: 'premium_paywall',
  lockedDescription: 'Premium is hidden.',
  recommendedUnlockMoment: 'Not in beta',
  releaseState: 'disabled_beta',
  requiredSessions: 0,
  unlockReason: 'Unavailable.',
  ...overrides,
});

describe('resolveMonthlyReportAction', () => {
  it('does not route to paywall when premium is disabled beta', () => {
    expect(resolveMonthlyReportAction(makeFeature({}))).toBe('start-session');
  });

  it('routes to paywall only when premium navigation is available', () => {
    expect(
      resolveMonthlyReportAction(
        makeFeature({
          isUnlocked: true,
          isVisible: true,
          releaseState: 'core',
        }),
      ),
    ).toBe('paywall');
  });
});
