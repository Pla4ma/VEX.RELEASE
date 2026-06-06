// ── Mocks ──────────────────────────────────────────────────────────

jest.mock('../../liveops-config/hooks/useFeatureAccess', () => ({
  useFeatureAccess: jest.fn(),
}));

jest.mock('../../liveops-config/FeatureFlagService', () => ({
  getFeatureAvailability: jest.fn(),
}));

// ── Imports after mocks ────────────────────────────────────────────

import { useMultiFeatureGate } from '../hooks';
import { renderHook } from '@testing-library/react-native';
import { createTestHelpers } from './_helpers';

const { useFeatureAccess: mockUseFeatureAccess } = jest.requireMock(
  '../../liveops-config/hooks/useFeatureAccess',
) as { useFeatureAccess: jest.Mock };
const { getFeatureAvailability: mockGetFeatureAvailability } = jest.requireMock(
  '../../liveops-config/FeatureFlagService',
) as { getFeatureAvailability: jest.Mock };

const { makeAvailability, makeFeatureAccess } =
  createTestHelpers(mockUseFeatureAccess, mockGetFeatureAvailability);

// ── Hooks: useMultiFeatureGate ─────────────────────────────────────

describe('useMultiFeatureGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setupMultiGate(
    features: Record<string, Record<string, unknown>>,
    availabilityMap: Record<string, Record<string, unknown>>,
  ) {
    mockUseFeatureAccess.mockReturnValue({ features });
    mockGetFeatureAvailability.mockImplementation(
      (featureAccess: Record<string, unknown>) => {
        const key = featureAccess?.key as string;
        return makeAvailability(availabilityMap[key] ?? { state: 'unlocked' });
      },
    );
  }

  it('returns isAvailable true when all features available (requireAll=true)', () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: 'challenges', isUnlocked: true }),
        achievements: makeFeatureAccess({ key: 'achievements', isUnlocked: true }),
      },
      {
        challenges: { state: 'unlocked' },
        achievements: { state: 'unlocked' },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(['challenges', 'achievements']),
    );
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.availableFeatures).toEqual([
      'challenges',
      'achievements',
    ]);
    expect(result.current.unavailableFeatures).toEqual([]);
  });

  it('returns isAvailable false when one feature is locked (requireAll=true)', () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: 'challenges', isUnlocked: true }),
        achievements: makeFeatureAccess({ key: 'achievements', isUnlocked: false }),
      },
      {
        challenges: { state: 'unlocked' },
        achievements: { state: 'locked', canRenderEntryPoint: false },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(['challenges', 'achievements']),
    );
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.availableFeatures).toEqual(['challenges']);
    expect(result.current.unavailableFeatures).toEqual(['achievements']);
  });

  it('returns isAvailable true when any feature available (requireAll=false)', () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: 'challenges', isUnlocked: false }),
        achievements: makeFeatureAccess({ key: 'achievements', isUnlocked: true }),
      },
      {
        challenges: { state: 'locked' },
        achievements: { state: 'unlocked' },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(['challenges', 'achievements'], {
        requireAll: false,
      }),
    );
    expect(result.current.isAvailable).toBe(true);
  });

  it('returns isAvailable false when no features available (requireAll=false)', () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: 'challenges', isUnlocked: false }),
        achievements: makeFeatureAccess({ key: 'achievements', isUnlocked: false }),
      },
      {
        challenges: { state: 'locked' },
        achievements: { state: 'locked' },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(['challenges', 'achievements'], {
        requireAll: false,
      }),
    );
    expect(result.current.isAvailable).toBe(false);
  });

  it('handles empty feature list', () => {
    setupMultiGate({}, {});

    const { result } = renderHook(() => useMultiFeatureGate([]));
    // [].every(...) === true (vacuously true)
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.featureStates).toEqual([]);
  });

  it('correctly categorizes available and unavailable features', () => {
    setupMultiGate(
      {
        challenges: makeFeatureAccess({ key: 'challenges', isUnlocked: true }),
        achievements: makeFeatureAccess({ key: 'achievements', isUnlocked: false }),
        rankings: makeFeatureAccess({ key: 'rankings', isUnlocked: true }),
      },
      {
        challenges: { state: 'unlocked' },
        achievements: { state: 'locked' },
        rankings: { state: 'unlocked' },
      },
    );

    const { result } = renderHook(() =>
      useMultiFeatureGate(['challenges', 'achievements', 'rankings']),
    );
    expect(result.current.availableFeatures).toEqual(['challenges', 'rankings']);
    expect(result.current.unavailableFeatures).toEqual(['achievements']);
  });
});
