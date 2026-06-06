// ── Mocks ──────────────────────────────────────────────────────────

jest.mock('../../liveops-config/hooks/useFeatureAccess', () => ({
  useFeatureAccess: jest.fn(),
}));

jest.mock('../../liveops-config/FeatureFlagService', () => ({
  getFeatureAvailability: jest.fn(),
}));

// ── Imports after mocks ────────────────────────────────────────────

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FeatureGate, withFeatureGate } from '../FeatureGate';
import { createTestHelpers } from './_helpers';

const { useFeatureAccess: mockUseFeatureAccess } = jest.requireMock(
  '../../liveops-config/hooks/useFeatureAccess',
) as { useFeatureAccess: jest.Mock };
const { getFeatureAvailability: mockGetFeatureAvailability } = jest.requireMock(
  '../../liveops-config/FeatureFlagService',
) as { getFeatureAvailability: jest.Mock };

const { makeFeatureAccess, setupFeatureGate } =
  createTestHelpers(mockUseFeatureAccess, mockGetFeatureAvailability);

// ── Components ─────────────────────────────────────────────────────

describe('FeatureGate component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when feature is available', () => {
    setupFeatureGate(
      'challenges',
      makeFeatureAccess({ isUnlocked: true }),
      { state: 'unlocked' },
    );

    const { getByText } = render(
      React.createElement(FeatureGate, { feature: 'challenges' },
        React.createElement(Text, null, 'Feature Content'),
      ),
    );
    expect(getByText('Feature Content')).toBeTruthy();
  });

  it('renders fallback when feature is not available', () => {
    setupFeatureGate(
      'challenges',
      makeFeatureAccess({ isUnlocked: false }),
      { state: 'locked', canRenderEntryPoint: false },
    );

    const { getByText } = render(
      React.createElement(FeatureGate, {
        feature: 'challenges',
        fallback: React.createElement(Text, null, 'Locked Message'),
      }),
    );
    expect(getByText('Locked Message')).toBeTruthy();
  });

  it('renders null when feature not available and no fallback', () => {
    setupFeatureGate(
      'challenges',
      makeFeatureAccess({ isUnlocked: false }),
      { state: 'locked' },
    );

    const { toJSON } = render(
      React.createElement(FeatureGate, { feature: 'challenges' }),
    );
    expect(toJSON()).toBeNull();
  });

  it('passes mode to useFeatureGate hook', () => {
    setupFeatureGate(
      'challenges',
      makeFeatureAccess({ isUnlocked: true }),
      { state: 'unlocked', canNavigate: true, canRegisterRoute: true },
    );

    const { getByText } = render(
      React.createElement(
        FeatureGate,
        { feature: 'challenges', mode: 'navigation' },
        React.createElement(Text, null, 'Content'),
      ),
    );
    expect(getByText('Content')).toBeTruthy();
  });
});

describe('withFeatureGate HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders wrapped component when feature is available', () => {
    setupFeatureGate(
      'challenges',
      makeFeatureAccess({ isUnlocked: true }),
      { state: 'unlocked' },
    );

    function TestComponent() {
      return React.createElement(Text, null, 'Inner');
    }
    const Wrapped = withFeatureGate('challenges', TestComponent);

    const { getByText } = render(React.createElement(Wrapped));
    expect(getByText('Inner')).toBeTruthy();
  });

  it('renders fallback component when feature is not available', () => {
    setupFeatureGate(
      'challenges',
      makeFeatureAccess({ isUnlocked: false }),
      { state: 'locked' },
    );

    function TestComponent() {
      return React.createElement(Text, null, 'Inner');
    }
    function FallbackComponent() {
      return React.createElement(Text, null, 'Fallback');
    }
    const Wrapped = withFeatureGate('challenges', TestComponent, {
      fallback: FallbackComponent,
    });

    const { getByText } = render(React.createElement(Wrapped));
    expect(getByText('Fallback')).toBeTruthy();
  });

  it('renders null when feature not available and no fallback HOC', () => {
    setupFeatureGate(
      'challenges',
      makeFeatureAccess({ isUnlocked: false }),
      { state: 'locked' },
    );

    function TestComponent() {
      return React.createElement('span', null, 'Inner');
    }
    const Wrapped = withFeatureGate('challenges', TestComponent);

    const { toJSON } = render(React.createElement(Wrapped));
    expect(toJSON()).toBeNull();
  });
});
