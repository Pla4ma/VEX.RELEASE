import React from 'react';
import { render } from '@testing-library/react-native';
import { FocusScoreDashboard } from '../FocusScoreDashboard';
import * as useFocusScore from '../hooks-focus-score';
import * as useNetInfo from '@network';
import { mockScore, mockHistoryThreeDays } from './fixtures/focus-score-data';

jest.mock('../hooks-focus-score');
jest.mock('@network', () => ({
  useNetInfo: jest.fn(() => ({ isOffline: false })),
}));
jest.mock('@hooks', () => ({
  useReducedMotion: jest.fn(() => ({ isReducedMotion: true })),
}));
jest.mock('@components/primitives', () => {
  const React = require('react');
  const { Text: NativeText, View, Pressable } = require('react-native');
  return {
    Box: ({
      children,
      testID,
    }: {
      children?: React.ReactNode;
      testID?: string;
    }) => React.createElement(View, { testID }, children),
    Stack: ({
      children,
      testID,
    }: {
      children?: React.ReactNode;
      testID?: string;
    }) => React.createElement(View, { testID }, children),
    Text: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(NativeText, null, children),
    Button: ({
      children,
      onPress,
    }: {
      children?: React.ReactNode;
      onPress?: () => void;
    }) =>
      React.createElement(
        Pressable,
        { onPress },
        React.createElement(NativeText, null, children),
      ),
    Skeleton: ({ testID }: { testID?: string }) =>
      React.createElement(View, { testID }),
  };
});
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('FocusScoreDashboard — advanced states', () => {
  it('renders refetching indicator when refetching', () => {
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: 'success',
      score: mockScore,
      isRefetching: true,
    });
    (useNetInfo.useNetInfo as jest.Mock).mockReturnValue({ isOffline: false });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(getByText('Updating...')).toBeTruthy();
  });

  it('renders empty history message when no history is available', () => {
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: 'success',
      score: mockScore,
      history: [],
      isRefetching: false,
    });
    (useNetInfo.useNetInfo as jest.Mock).mockReturnValue({ isOffline: false });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(getByText('No history available yet.')).toBeTruthy();
  });

  it('renders 30-day trend with history data', () => {
    (useFocusScore.useFocusScore as jest.Mock).mockReturnValue({
      status: 'success',
      score: mockScore,
      history: mockHistoryThreeDays,
      isRefetching: false,
    });
    (useNetInfo.useNetInfo as jest.Mock).mockReturnValue({ isOffline: false });
    const { getByText } = render(<FocusScoreDashboard />);
    expect(getByText('4/1/2026: 700 (+0)')).toBeTruthy();
    expect(getByText('4/2/2026: 710 (+10)')).toBeTruthy();
    expect(getByText('4/3/2026: 705 (-5)')).toBeTruthy();
  });
});
