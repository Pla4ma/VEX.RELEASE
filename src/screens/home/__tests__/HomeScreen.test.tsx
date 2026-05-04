import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { HomeScreen } from '../HomeScreen';
import { useActiveStudyPlan } from '../../../features/content-study';
import { useAuthStore } from '../../../store';
import { usePremiumStatus } from '../../../shared/monetization';
import { useComebackState, useStreakSummary } from '../../../features/streaks/hooks';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { useSessionHistory } from '../../../session/hooks/useSession';
import { useUserSquads } from '../../../features/squads/hooks';
import {
  useActiveRecommendations,
  useCreateRecommendation,
  useUpdateRecommendationStatus,
} from '../../../features/ai-coach';

const mockNavigate = jest.fn();
const mockCreateRecommendation = jest.fn();
const mockUpdateRecommendationStatus = jest.fn();

jest.mock('../../../store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../../shared/monetization', () => ({
  usePremiumStatus: jest.fn(),
}));

jest.mock('../../../features/streaks/hooks', () => ({
  useComebackState: jest.fn(),
  useStreakSummary: jest.fn(),
}));

jest.mock('../../../features/progression/hooks', () => ({
  useProgressionSummary: jest.fn(),
}));

jest.mock('../../../session/hooks/useSession', () => ({
  useSessionHistory: jest.fn(),
}));

jest.mock('../../../features/squads/hooks', () => ({
  useUserSquads: jest.fn(),
}));

jest.mock('../../../features/ai-coach', () => ({
  SessionSuggestionCard: ({ recommendation, onAccept, onDismiss }: any) => {
    const React = require('react');
    const { Fragment } = React;
    const { Pressable, Text } = require('react-native');
    return React.createElement(
      Fragment,
      null,
      React.createElement(Text, null, recommendation.reasoning),
      React.createElement(
        Pressable,
        { onPress: onAccept },
        React.createElement(Text, null, 'Accept suggestion')
      ),
      React.createElement(
        Pressable,
        { onPress: onDismiss },
        React.createElement(Text, null, 'Dismiss suggestion')
      )
    );
  },
  useActiveRecommendations: jest.fn(),
  useCreateRecommendation: jest.fn(),
  useUpdateRecommendationStatus: jest.fn(),
}));

jest.mock('../../../features/content-study', () => ({
  useActiveStudyPlan: jest.fn(),
}));

jest.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: { primary: '#ffffff', secondary: '#f5f5f5' },
        primary: { 500: '#2563eb' },
        text: { primary: '#111111', secondary: '#666666' },
        border: { DEFAULT: '#d4d4d4' },
      },
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../../components/primitives/Button', () => ({
  Button: ({ children, onPress }: any) => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return React.createElement(
      Pressable,
      { accessibilityRole: 'button', onPress },
      React.createElement(Text, null, children)
    );
  },
}));

jest.mock('../../../components/primitives/Text', () => ({
  Text: ({ children, ...props }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, props, children);
  },
}));

const mockedUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockedUseActiveStudyPlan = useActiveStudyPlan as jest.MockedFunction<typeof useActiveStudyPlan>;
const mockedUsePremiumStatus = usePremiumStatus as jest.MockedFunction<typeof usePremiumStatus>;
const mockedUseStreakSummary = useStreakSummary as jest.MockedFunction<typeof useStreakSummary>;
const mockedUseComebackState = useComebackState as jest.MockedFunction<typeof useComebackState>;
const mockedUseProgressionSummary = useProgressionSummary as jest.MockedFunction<typeof useProgressionSummary>;
const mockedUseSessionHistory = useSessionHistory as jest.MockedFunction<typeof useSessionHistory>;
const mockedUseUserSquads = useUserSquads as jest.MockedFunction<typeof useUserSquads>;
const mockedUseActiveRecommendations = useActiveRecommendations as jest.MockedFunction<typeof useActiveRecommendations>;
const mockedUseCreateRecommendation = useCreateRecommendation as jest.MockedFunction<typeof useCreateRecommendation>;
const mockedUseUpdateRecommendationStatus = useUpdateRecommendationStatus as jest.MockedFunction<typeof useUpdateRecommendationStatus>;

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuthStore.mockReturnValue({
      user: { id: 'user-1', firstName: 'Jamie' },
    } as any);

    mockedUsePremiumStatus.mockReturnValue({
      isPremium: false,
    } as any);

    mockedUseActiveStudyPlan.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    mockedUseStreakSummary.mockReturnValue({
      data: { currentDays: 5 },
    } as any);

    mockedUseComebackState.mockReturnValue({
      data: { isComeback: false },
      isLoading: false,
    } as any);

    mockedUseProgressionSummary.mockReturnValue({
      data: { level: 3, xp: 1200 },
    } as any);

    mockedUseSessionHistory.mockReturnValue({
      history: [
        {
          sessionId: 'session-1',
          status: 'COMPLETED',
          endedAt: Date.now() - 2 * 60 * 60 * 1000,
          config: { duration: 1500, customName: 'Deep Work' },
          summary: { actualDuration: 1500, xpEarned: 120 },
        },
      ],
    } as any);

    mockedUseUserSquads.mockReturnValue({
      data: [{ name: 'Deep Workers' }],
    } as any);

    mockedUseActiveRecommendations.mockReturnValue({
      data: [
        {
          id: 'rec-1',
          status: 'ACTIVE',
          expiresAt: Date.now() + 60_000,
          confidence: 0.92,
          reasoning: '6 PM is your best focus window.',
          suggestedDuration: 1800,
          suggestedDifficulty: 'NORMAL',
          type: 'OPTIMAL_TIME',
        },
      ],
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    mockedUseCreateRecommendation.mockReturnValue({
      mutate: mockCreateRecommendation,
      isPending: false,
    } as any);

    mockedUseUpdateRecommendationStatus.mockReturnValue({
      mutateAsync: mockUpdateRecommendationStatus,
    } as any);
  });

  it('renders the primary recommendation', () => {
    render(<HomeScreen />);

    expect(screen.getByText('6 PM is your best focus window.')).toBeTruthy();
    expect(screen.getByText('Start Study Plan')).toBeTruthy();
  });

  it('shows the active study plan state when progress exists', () => {
    mockedUseActiveStudyPlan.mockReturnValue({
      data: {
        generationId: 'gen-1',
        contentId: 'content-1',
        title: 'React Deep Dive',
        totalTasks: 7,
        completedTasks: 2,
        progressPercent: 29,
        remainingMinutes: 200,
        nextTask: { id: 'task-3', content: 'Hooks', estimatedMinutes: 30, priority: 'HIGH' },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<HomeScreen />);

    expect(screen.getByText('ACTIVE STUDY PLAN: "React Deep Dive"')).toBeTruthy();
    expect(screen.getByText('Continue Study')).toBeTruthy();
  });

  it('accepts a recommendation and routes into session setup', async () => {
    mockUpdateRecommendationStatus.mockResolvedValue(undefined);

    render(<HomeScreen />);
    fireEvent.press(screen.getByText('Accept suggestion'));

    await waitFor(() => {
      expect(mockUpdateRecommendationStatus).toHaveBeenCalledWith({
        recommendationId: 'rec-1',
        status: 'ACCEPTED',
        userId: 'user-1',
      });
      expect(mockNavigate).toHaveBeenCalledWith('SessionStack', {
        screen: 'SessionSetup',
        params: {
          suggestedDurationSeconds: 1800,
          suggestedDifficulty: 'NORMAL',
          recommendationId: 'rec-1',
        },
      });
    });
  });

  it('dismisses a recommendation as rejected', async () => {
    mockUpdateRecommendationStatus.mockResolvedValue(undefined);

    render(<HomeScreen />);
    fireEvent.press(screen.getByText('Dismiss suggestion'));

    await waitFor(() => {
      expect(mockUpdateRecommendationStatus).toHaveBeenCalledWith({
        recommendationId: 'rec-1',
        status: 'REJECTED',
        userId: 'user-1',
      });
    });
  });

  it('creates a cold-start recommendation when no active suggestion exists', async () => {
    const refetch = jest.fn();
    mockedUseActiveRecommendations.mockReturnValue({
      data: [],
      isLoading: false,
      refetch,
    } as any);

    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockCreateRecommendation).toHaveBeenCalledWith(
        {
          userId: 'user-1',
          type: 'STREAK_PROTECTION',
          context: {
            streakDays: 5,
            currentLevel: 3,
            hoursSinceLastSession: 2,
          },
        },
        expect.objectContaining({
          onSettled: expect.any(Function),
        })
      );
    });
  });
});
