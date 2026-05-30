/**
 * Shared test helpers for feature-gate tests.
 * Not a test file — jest testMatch only picks up *.test.ts.
 */

export function createTestHelpers(
  mockUseFeatureAccess: { mockReturnValue: (v: unknown) => void },
  mockGetFeatureAvailability: { mockReturnValue: (v: unknown) => void },
) {
  function makeAvailability(overrides: Record<string, unknown> = {}) {
    return {
      state: "unlocked",
      canRenderEntryPoint: true,
      canNavigate: true,
      canQuery: true,
      canUseBackend: true,
      canRegisterRoute: true,
      canSubscribeToEvents: true,
      canShowNotification: true,
      reason: "Unlocked",
      ...overrides,
    };
  }

  function makeFeatureAccess(overrides: Record<string, unknown> = {}) {
    return {
      key: "challenges",
      isUnlocked: true,
      isVisible: true,
      isTeased: false,
      isDegraded: false,
      lockedDescription: "Locked feature",
      recommendedUnlockMoment: "After 5 sessions",
      unlockReason: "Feature unlocked",
      releaseState: "final_release_progressive",
      priority: 10,
      ...overrides,
    };
  }

  function setupFeatureGate(
    featureKey: string,
    featureAccess: Record<string, unknown>,
    availability: Record<string, unknown>,
  ) {
    mockUseFeatureAccess.mockReturnValue({
      features: { [featureKey]: featureAccess },
    });
    mockGetFeatureAvailability.mockReturnValue(makeAvailability(availability));
  }

  return { makeAvailability, makeFeatureAccess, setupFeatureGate };
}
