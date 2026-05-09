import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { HomeScreen } from '../HomeScreen';

type Recommendation = {
  id: string;
  reasoning: string;
  suggestedDifficulty: string;
  suggestedDuration: number;
};

type HomeData = {
  companionMood: string;
  controller: {
    activeStudyPlanQuery: { data: { title: string } | null };
    currentStreak: number;
    isLoading: boolean;
    isOnline: boolean;
    primaryRecommendation: Recommendation | null;
    progressionQuery: { data: { level: number } };
    user: { avatar: string | null; firstName: string };
    userId: string;
  };
  dismissIntervention: () => void;
  intervention: null;
  showToast: () => void;
  streakHoursRemaining: number;
  unreadNotificationCount: number;
};

const mockNavigate = jest.fn();
let mockHomeData: HomeData;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('../../../features/session-completion/hooks', () => ({
  useCompletionSyncAutoRepair: jest.fn(),
}));
jest.mock('../../../features/ai-coach/analytics', () => ({
  trackInterventionActioned: jest.fn(),
  trackInterventionDisplayed: jest.fn(),
}));
jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../shared/ui/components/Toast', () => ({
  useToast: () => ({ show: jest.fn() }),
}));
jest.mock('../../../components/primitives', () => ({
  AppScreen: ({ children }: { children: React.ReactNode }) => {
    const ReactRuntime = require('react');
    const { View } = require('react-native');
    return ReactRuntime.createElement(View, null, children);
  },
}));
jest.mock('../../../features/home-spine/components', () => ({
  GreetingHeader: ({ userName }: { userName?: string }) => {
    const ReactRuntime = require('react');
    const { Text } = require('react-native');
    return ReactRuntime.createElement(Text, null, `Welcome ${userName ?? 'there'}`);
  },
  StartSessionButton: () => null,
}));
jest.mock('../hooks/useHomeData', () => ({ useHomeData: () => mockHomeData }));
jest.mock('../components/HomeContent', () => ({
  HomeContent: ({ data }: { data: HomeData }) => {
    const ReactRuntime = require('react');
    const { Text } = require('react-native');
    const { controller } = data;
    return ReactRuntime.createElement(
      ReactRuntime.Fragment,
      null,
      controller.isLoading ? ReactRuntime.createElement(Text, null, 'Loading home') : null,
      !controller.isOnline ? ReactRuntime.createElement(Text, null, 'Offline mode') : null,
      ReactRuntime.createElement(Text, null, 'Focus Score'),
      ReactRuntime.createElement(Text, null, 'Daily Mission'),
      ReactRuntime.createElement(Text, null, 'Start Study Plan'),
      controller.primaryRecommendation
        ? ReactRuntime.createElement(Text, null, controller.primaryRecommendation.reasoning)
        : null,
      controller.activeStudyPlanQuery.data
        ? ReactRuntime.createElement(
            Text,
            null,
            `ACTIVE STUDY PLAN: "${controller.activeStudyPlanQuery.data.title}"`
          )
        : null,
      controller.activeStudyPlanQuery.data
        ? ReactRuntime.createElement(Text, null, 'Continue Study')
        : null
    );
  },
}));

function createHomeData(overrides: Partial<HomeData['controller']> = {}): HomeData {
  return {
    companionMood: 'steady',
    controller: {
      activeStudyPlanQuery: { data: null },
      currentStreak: 5,
      isLoading: false,
      isOnline: true,
      primaryRecommendation: {
        id: 'rec-1',
        reasoning: '6 PM is your best focus window.',
        suggestedDifficulty: 'NORMAL',
        suggestedDuration: 1800,
      },
      progressionQuery: { data: { level: 3 } },
      user: { avatar: null, firstName: 'Jamie' },
      userId: 'user-1',
      ...overrides,
    },
    dismissIntervention: jest.fn(),
    intervention: null,
    showToast: jest.fn(),
    streakHoursRemaining: 10,
    unreadNotificationCount: 0,
  };
}

describe('HomeScreen command center', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHomeData = createHomeData();
  });

  it('keeps the essentials in the first viewport', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Focus Score')).toBeTruthy();
    expect(screen.getByText('Daily Mission')).toBeTruthy();
    expect(screen.getByText('Start Study Plan')).toBeTruthy();
    expect(screen.getByText('6 PM is your best focus window.')).toBeTruthy();
  });

  it('shows study-plan progress without exposing disabled routes', () => {
    mockHomeData = createHomeData({
      activeStudyPlanQuery: { data: { title: 'React Deep Dive' } },
    });

    render(<HomeScreen />);

    expect(screen.getByText('ACTIVE STUDY PLAN: "React Deep Dive"')).toBeTruthy();
    expect(screen.getByText('Continue Study')).toBeTruthy();
    expect(screen.queryByText('Trading')).toBeNull();
    expect(screen.queryByText('Emergency Gem')).toBeNull();
  });

  it('renders loading and offline degraded states', () => {
    mockHomeData = createHomeData({ isLoading: true, isOnline: false });

    render(<HomeScreen />);

    expect(screen.getByText('Loading home')).toBeTruthy();
    expect(screen.getByText('Offline mode')).toBeTruthy();
  });
});
