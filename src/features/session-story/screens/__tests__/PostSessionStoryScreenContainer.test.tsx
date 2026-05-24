import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { PostSessionStoryScreenContainer } from '../PostSessionStoryScreenContainer';

const mockNavigate = jest.fn();
const mockRefetch = jest.fn();
const mockUsePostSessionStoryViewModel = jest.fn();
const mockMarkStreakShieldShown = jest.fn<Promise<void>, []>();
const mockUseStreakShieldMoment = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({
    params: {
      sessionId: '550e8400-e29b-41d4-a716-446655440001',
      summary: {
        actualDuration: 1800,
        baseScore: 100,
        coinsEarned: 50,
        completionPercentage: 100,
        createdAt: Date.now() - 1800000,
        damageTaken: 0,
        effectiveDuration: 1800,
        finalScore: 95,
        focusPurityScore: 95,
        focusQuality: 95,
        gemsEarned: 1,
        interruptions: 0,
        pausedDuration: 0,
        pauses: 0,
        penaltiesApplied: [],
        plannedDuration: 1800,
        sessionId: '550e8400-e29b-41d4-a716-446655440001',
        sessionMode: 'DEEP_WORK',
        status: 'COMPLETED',
        streakDays: 5,
        streakIncreased: true,
        streakMaintained: true,
        timeBonus: 0,
        userId: '550e8400-e29b-41d4-a716-446655440002',
        userLevel: 2,
        vsAverage: 0,
        vsBest: 0,
        xpEarned: 100,
      },
    },
  }),
}));

jest.mock('../../../../theme', () => ({
  useTheme: () => ({
    theme: {
      borderRadius: { xl: 16 },
      colors: { background: { secondary: '#111', primary: '#000' }, border: { light: '#333' }, text: { primary: '#fff', secondary: '#ddd' } },
      spacing: { 2: 8, 3: 12, 4: 16, 5: 20 },
    },
  }),
}));

jest.mock('../../../../components/primitives/Text', () => ({
  Text: ({ children, testID }: { children: React.ReactNode; testID?: string }) => {
    const ReactRuntime = require('react');
    const { Text } = require('react-native');
    return ReactRuntime.createElement(Text, { testID }, children);
  },
}));
jest.mock('../../../../components/primitives/Button', () => ({
  Button: ({ children, onPress, accessibilityRole, accessibilityLabel }: { children: React.ReactNode; onPress?: () => void; accessibilityRole?: string; accessibilityLabel?: string }) => {
    const ReactRuntime = require('react');
    const { Pressable, Text } = require('react-native');
    return ReactRuntime.createElement(Pressable, { accessibilityLabel, accessibilityRole, onPress }, ReactRuntime.createElement(Text, null, children));
  },
}));

jest.mock('../../../../store', () => ({ useAuthStore: () => ({ user: { id: '550e8400-e29b-41d4-a716-446655440002' } }) }));
jest.mock('../../../monetization/analytics', () => ({
  trackStreakShieldMomentDismissed: jest.fn(),
  trackStreakShieldMomentViewed: jest.fn(),
}));
jest.mock('../../../monetization/hooks', () => ({
  useStreakShieldMoment: () => mockUseStreakShieldMoment(),
}));
jest.mock('../../../session-completion/hooks', () => ({ usePostSessionStoryViewModel: (...args: unknown[]) => mockUsePostSessionStoryViewModel(...args) }));
jest.mock('../PostSessionStoryScreen', () => ({
  PostSessionStoryScreen: ({
    monetizationMoment,
    onMonetizationAccept,
    onPrimaryAction,
    viewModel,
  }: {
    monetizationMoment?: { copy: { cta: string } } | null;
    onMonetizationAccept?: () => void;
    onPrimaryAction: () => void;
    viewModel: { nextActionCta: { label: string } };
  }) => {
    const ReactRuntime = require('react');
    const { Pressable, Text, View } = require('react-native');
    return ReactRuntime.createElement(
      View,
      null,
      ReactRuntime.createElement(Text, null, viewModel.nextActionCta.label),
      monetizationMoment
        ? ReactRuntime.createElement(Pressable, { accessibilityRole: 'button', onPress: onMonetizationAccept }, ReactRuntime.createElement(Text, null, monetizationMoment.copy.cta))
        : null,
      ReactRuntime.createElement(Pressable, { accessibilityRole: 'button', onPress: onPrimaryAction }, ReactRuntime.createElement(Text, null, 'Go')),
    );
  },
}));

describe('PostSessionStoryScreenContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefetch.mockResolvedValue(undefined);
    mockMarkStreakShieldShown.mockResolvedValue(undefined);
    mockUseStreakShieldMoment.mockReturnValue({ markShown: mockMarkStreakShieldShown, moment: null });
  });

  it('renders loading skeleton', () => {
    mockUsePostSessionStoryViewModel.mockReturnValue({ isPending: true });
    render(<PostSessionStoryScreenContainer />);
    expect(screen.getByTestId('post-session-story-loading')).toBeTruthy();
  });

  it('renders error state and retries', () => {
    mockUsePostSessionStoryViewModel.mockReturnValue({ error: new Error('boom'), isError: true, isPending: false, refetch: mockRefetch });
    render(<PostSessionStoryScreenContainer />);
    fireEvent.press(screen.getByText('Try Again'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders empty fallback when no view model exists', () => {
    mockUsePostSessionStoryViewModel.mockReturnValue({ data: null, isError: false, isPending: false });
    render(<PostSessionStoryScreenContainer />);
    expect(screen.getByTestId('post-session-story-empty')).toBeTruthy();
  });

  it('routes next-session CTA into SessionSetup when recommendation exists', () => {
    mockUsePostSessionStoryViewModel.mockReturnValue({
      data: { nextActionCta: { label: 'Start next focus', route: 'SessionSetup', routeParams: { presetMode: 'DEEP_WORK', recommendationId: 'next-1', suggestedDifficulty: 'NORMAL', suggestedDurationSeconds: 900 } } },
      isError: false,
      isOffline: false,
      isPending: false,
    });
    render(<PostSessionStoryScreenContainer />);
    fireEvent.press(screen.getByText('Go'));
    expect(mockNavigate).toHaveBeenCalledWith({ name: 'SessionSetup', params: { presetMode: 'DEEP_WORK', recommendationId: 'next-1', suggestedDifficulty: 'NORMAL', suggestedDurationSeconds: 900 } });
  });

  it('falls back home when no recommendation exists', () => {
    mockUsePostSessionStoryViewModel.mockReturnValue({
      data: { nextActionCta: { label: 'Return home', route: 'Home', routeParams: null } },
      isError: false,
      isOffline: true,
      isPending: false,
    });
    render(<PostSessionStoryScreenContainer />);
    fireEvent.press(screen.getByText('Go'));
    expect(mockNavigate).toHaveBeenCalledWith('Main', { screen: 'Home' });
  });

  it('opens Streak Shield paywall without replacing the story primary action', () => {
    mockUseStreakShieldMoment.mockReturnValue({
      markShown: mockMarkStreakShieldShown,
      moment: {
        copy: {
          body: 'You just proved this routine matters. Streak Shield can protect one missed day when life interrupts.',
          cta: 'Protect My Streak',
          headline: 'Your streak is worth protecting.',
          secondary: 'Not Now',
        },
        routeParams: {
          contextBody: 'You just proved this routine matters. Streak Shield can protect one missed day when life interrupts.',
          contextCta: 'Protect My Streak',
          contextHeadline: 'Your streak is worth protecting.',
          gatedFeature: 'streak_freeze',
          source: 'post_session_streak_shield',
        },
      },
    });
    mockUsePostSessionStoryViewModel.mockReturnValue({
      data: { nextActionCta: { label: 'Return home', route: 'Home', routeParams: null } },
      isError: false,
      isOffline: false,
      isPending: false,
    });

    render(<PostSessionStoryScreenContainer />);
    fireEvent.press(screen.getByText('Protect My Streak'));

    expect(mockMarkStreakShieldShown).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Paywall', {
      contextBody: 'You just proved this routine matters. Streak Shield can protect one missed day when life interrupts.',
      contextCta: 'Protect My Streak',
      contextHeadline: 'Your streak is worth protecting.',
      gatedFeature: 'streak_freeze',
      source: 'post_session_streak_shield',
    });
  });
});
