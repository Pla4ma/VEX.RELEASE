import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FocusScoreHomeWidget } from '../components/focus-score-home-widget';
import type { FocusScoreDashboardModel } from '../hooks-focus-score';

jest.mock('@components/ui/Skeleton', () => ({
  Skeleton: () => null,
}));

jest.mock('@components/primitives/Text', () => {
  const { Text } = require('react-native');
  return { Text };
});

jest.mock('@/shared/ui/components/StatusFeedback', () => {
  const React = require('react');
  const { Text, Pressable, View } = require('react-native');
  return {
    StatusBanner: ({ message, description, onRetry }: { message: string; description?: string; onRetry?: () => void }) =>
      React.createElement(
        View,
        null,
        React.createElement(Text, null, message),
        description ? React.createElement(Text, null, description) : null,
        onRetry ? React.createElement(Pressable, { onPress: onRetry }, React.createElement(Text, null, 'Retry')) : null,
      ),
  };
});

jest.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      spacing: { 1: 4, 2: 8, 4: 16 },
      borderRadius: { lg: 12 },
      typography: {
        display: { large: { fontSize: 32, lineHeight: 38 } },
        heading: { large: { fontSize: 24, lineHeight: 30 }, medium: { fontSize: 20, lineHeight: 26 } },
        body: { large: { fontSize: 16, lineHeight: 22 }, medium: { fontSize: 14, lineHeight: 20 }, small: { fontSize: 12, lineHeight: 18 } },
        label: { medium: { fontSize: 12, lineHeight: 16 } },
      },
      fontWeights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      colors: {
        border: { light: 'lightgray' },
        background: { secondary: 'black' },
        surface: { selected: 'dimgray' },
        status: { error: 'maroon', warning: 'olive', success: 'green', info: 'navy' },
        text: { primary: 'white', secondary: 'silver' },
      },
    },
  }),
}));

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: { View },
    FadeInUp: { duration: () => ({}) },
    FadeOutUp: { duration: () => ({}) },
    useAnimatedStyle: () => ({}),
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (value: unknown) => value,
  };
});

function model(overrides: Partial<FocusScoreDashboardModel> = {}): FocusScoreDashboardModel {
  return {
    current: null,
    history: [],
    monthlyInput: null,
    isOffline: false,
    isPending: false,
    isError: false,
    error: null,
    isRefetching: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('FocusScoreHomeWidget', () => {
  it('renders loading state', () => {
    const screen = render(<FocusScoreHomeWidget model={model({ isPending: true })} onPress={jest.fn()} onRetry={jest.fn()} />);
    expect(screen.getByTestId('focus-score-home-widget-skeleton')).toBeTruthy();
  });

  it('renders error state', () => {
    const screen = render(<FocusScoreHomeWidget model={model({ isError: true, error: new Error('err') })} onPress={jest.fn()} onRetry={jest.fn()} />);
    expect(screen.getByText('Focus Score is unavailable')).toBeTruthy();
  });

  it('renders honest empty copy for new users', () => {
    const screen = render(
      <FocusScoreHomeWidget model={model()} onPress={jest.fn()} onRetry={jest.fn()} />,
    );

    expect(screen.getByText('Focus Score needs three sessions')).toBeTruthy();
    expect(screen.getByText('Finish three sessions and VEX will start reading your focus rhythm.')).toBeTruthy();
  });

  it('renders success and supports tap navigation', () => {
    const onPress = jest.fn();
    const screen = render(
      <FocusScoreHomeWidget
        model={model({
          current: {
            id: '123e4567-e89b-12d3-a456-426614174111',
            userId: '123e4567-e89b-12d3-a456-426614174000',
            currentScore: 640,
            previousScore: 630,
            band: 'Strong',
            factors: {
              consistency: { weightPercent: 35, score: 82, delta: 5, explanation: 'Good consistency.' },
              streakStability: { weightPercent: 25, score: 72, delta: 2, explanation: 'Stable streak.' },
              sessionQuality: { weightPercent: 20, score: 87, delta: 4, explanation: 'Quality up.' },
              intentionalDifficulty: { weightPercent: 10, score: 61, delta: 1, explanation: 'Balanced challenge.' },
              recency: { weightPercent: 10, score: 78, delta: 2, explanation: 'Recent sessions.' },
            },
            updatedAt: '2026-05-06T10:00:00.000Z',
            createdAt: '2026-05-01T10:00:00.000Z',
            lastChangeReason: 'Session quality improved',
          },
          history: [{ timestamp: '2026-05-06T10:00:00.000Z', score: 640, delta: 10, reason: 'Quality improved' }],
        })}
        onPress={onPress}
        onRetry={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByLabelText('Open focus score dashboard'));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByText('640 · Strong')).toBeTruthy();
  });

  it('keeps the dashboard tap target at least 44 points tall', () => {
    const screen = render(
      <FocusScoreHomeWidget
        model={model({
          current: {
            id: '123e4567-e89b-12d3-a456-426614174111',
            userId: '123e4567-e89b-12d3-a456-426614174000',
            currentScore: 640,
            previousScore: 630,
            band: 'Strong',
            factors: {
              consistency: { weightPercent: 35, score: 82, delta: 5, explanation: 'Good consistency.' },
              streakStability: { weightPercent: 25, score: 72, delta: 2, explanation: 'Stable streak.' },
              sessionQuality: { weightPercent: 20, score: 87, delta: 4, explanation: 'Quality up.' },
              intentionalDifficulty: { weightPercent: 10, score: 61, delta: 1, explanation: 'Balanced challenge.' },
              recency: { weightPercent: 10, score: 78, delta: 2, explanation: 'Recent sessions.' },
            },
            updatedAt: '2026-05-06T10:00:00.000Z',
            createdAt: '2026-05-01T10:00:00.000Z',
            lastChangeReason: 'Session quality improved',
          },
        })}
        onPress={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Open focus score dashboard').props.style).toEqual(
      expect.objectContaining({ minHeight: 44, minWidth: 44 }),
    );
  });

  it('renders offline state', () => {
    const screen = render(<FocusScoreHomeWidget model={model({ isOffline: true, current: {
      id: '123e4567-e89b-12d3-a456-426614174111',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      currentScore: 640,
      previousScore: 630,
      band: 'Strong',
      factors: {
        consistency: { weightPercent: 35, score: 82, delta: 5, explanation: 'Good consistency.' },
        streakStability: { weightPercent: 25, score: 72, delta: 2, explanation: 'Stable streak.' },
        sessionQuality: { weightPercent: 20, score: 87, delta: 4, explanation: 'Quality up.' },
        intentionalDifficulty: { weightPercent: 10, score: 61, delta: 1, explanation: 'Balanced challenge.' },
        recency: { weightPercent: 10, score: 78, delta: 2, explanation: 'Recent sessions.' },
      },
      updatedAt: '2026-05-06T10:00:00.000Z',
      createdAt: '2026-05-01T10:00:00.000Z',
      lastChangeReason: 'Session quality improved',
    } })} onPress={jest.fn()} onRetry={jest.fn()} />);
    expect(screen.getByText('Offline focus mode')).toBeTruthy();
    expect(screen.getByText('Cached score shown while VEX waits to sync.')).toBeTruthy();
  });
});
