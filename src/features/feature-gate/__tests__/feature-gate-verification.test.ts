// ── Mocks ──────────────────────────────────────────────────────────

// Mock useFeatureAccess — verification.ts imports from this path
jest.mock('../../liveops-config/hooks/useFeatureAccess', () => ({
  useFeatureAccess: jest.fn(),
}));

// ── Imports after mocks ────────────────────────────────────────────

import { getPhase3VerificationSummary } from '../verification';

// ── Verification ───────────────────────────────────────────────────

describe('getPhase3VerificationSummary', () => {
  it('returns passed=true when all checks pass', () => {
    const results = [
      {
        feature: 'rivals' as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(true);
    expect(summary.failedFeatures).toEqual([]);
  });

  it('returns passed=false when isHidden is false', () => {
    const results = [
      {
        feature: 'rivals' as const,
        isHidden: false,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toContain('rivals');
  });

  it('returns passed=false when hasNoTab fails', () => {
    const results = [
      {
        feature: 'rankings' as const,
        isHidden: true,
        hasNoTab: false,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toContain('rankings');
  });

  it('returns passed=true for empty results', () => {
    const summary = getPhase3VerificationSummary([]);
    expect(summary.passed).toBe(true);
    expect(summary.failedFeatures).toEqual([]);
  });

  it('collects multiple failed features', () => {
    const results = [
      {
        feature: 'rivals' as const,
        isHidden: false,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
      {
        feature: 'rankings' as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: false,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toEqual(['rivals']);
  });

  it('preserves the results array reference', () => {
    const results = [
      {
        feature: 'squads' as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.results).toBe(results);
  });
});
