import React from 'react';
import type { HomeData } from './home-screen-command-types';

export const mockState = {
  navigate: jest.fn(),
  homeData: createCommandHomeData(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockState.navigate }),
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
jest.mock('../../../shared/ui/components/ScreenErrorBoundary', () => ({
  ScreenErrorBoundary: ({ children }: { children: React.ReactNode }) =>
    children,
  withScreenErrorBoundary: (Component: React.ComponentType<unknown>) =>
    Component,
  default: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../../../network', () => ({
  useNetInfo: () => ({ isOffline: false, isConnected: true }),
}));
jest.mock('../../../components/primitives', () => ({
  AppScreen: ({ children }: { children: React.ReactNode }) => {
    const ReactRuntime = require('react');
    const { View } = require('react-native');
    return ReactRuntime.createElement(View, null, children);
  },
  Text: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => {
    const ReactRuntime = require('react');
    const { Text: RNText } = require('react-native');
    return ReactRuntime.createElement(RNText, props, children);
  },
}));
jest.mock('../../../components', () => ({
  Button: ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => {
    const ReactRuntime = require('react');
    const { Pressable, Text } = require('react-native');
    return ReactRuntime.createElement(
      Pressable,
      { onPress },
      ReactRuntime.createElement(Text, null, children),
    );
  },
}));
jest.mock('../../../config/sentry', () => ({
  captureException: jest.fn(),
}));
jest.mock('../../../shared/ui/components/EmptyState', () => ({
  OfflineEmptyState: () => null,
}));
jest.mock('../../../features/home-spine/components', () => ({
  GreetingHeader: ({ userName }: { userName?: string }) => {
    const ReactRuntime = require('react');
    const { Text } = require('react-native');
    return ReactRuntime.createElement(
      Text,
      null,
      `Welcome ${userName ?? 'there'}`,
    );
  },
  StartSessionButton: () => null,
}));
jest.mock('../hooks/useHomeData', () => ({
  useHomeData: () => mockState.homeData,
}));
jest.mock('../hooks/useHomeViewModel', () => ({
  useHomeViewModel: () => ({
    isLoading: false,
    isOnline: true,
    intervention: null,
    stage: 'ENGAGED',
  }),
}));
jest.mock('../containers/HomeStageResolver', () => {
  const Rn = require('react');
  const { View } = require('react-native');
  return {
    HomeStageResolver: (): JSX.Element => {
      const { HomeContent } = require('../components/HomeContent');
      return Rn.createElement(
        View,
        null,
        Rn.createElement(HomeContent, { data: mockState.homeData }),
      );
    },
  };
});
jest.mock('../components/HomeContent', () => ({
  HomeContent: ({ data }: { data: HomeData }) => {
    const ReactRuntime = require('react');
    const { Text } = require('react-native');
    const { controller } = data;
    return ReactRuntime.createElement(
      ReactRuntime.Fragment,
      null,
      controller.isLoading
        ? ReactRuntime.createElement(Text, null, 'Loading home')
        : null,
      !controller.isOnline
        ? ReactRuntime.createElement(Text, null, 'Offline mode')
        : null,
      ReactRuntime.createElement(Text, null, 'Focus Score'),
      ReactRuntime.createElement(Text, null, 'Daily Mission'),
      ReactRuntime.createElement(
        Text,
        null,
        `Start ${controller.learningExecutionLayer.copy.layerName}`,
      ),
      controller.primaryRecommendation
        ? ReactRuntime.createElement(
            Text,
            null,
            controller.primaryRecommendation.reasoning,
          )
        : null,
      controller.activeStudyPlanQuery.data
        ? ReactRuntime.createElement(
            Text,
            null,
            `${controller.learningExecutionLayer.copy.homeTitle}: "${controller.activeStudyPlanQuery.data.title}"`,
          )
        : null,
      controller.activeStudyPlanQuery.data
        ? ReactRuntime.createElement(
            Text,
            null,
            controller.learningExecutionLayer.copy.homeCta,
          )
        : null,
    );
  },
}));

export function createCommandHomeData(
  overrides: Partial<HomeData['controller']> = {},
): HomeData {
  return {
    companionMood: 'steady',
    controller: {
      activeStudyPlanQuery: { data: null },
      currentStreak: 5,
      disclosure: { features: { companion_detail: { isUnlocked: false } } },
      isLoading: false,
      isOnline: true,
      learningExecutionLayer: {
        copy: {
          homeCta: 'Start deep work',
          homeTitle: 'Deep Work Plan',
          layerName: 'Deep Work Plan',
        },
      },
      openSetup: jest.fn(),
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

export function resetCommandMocks(): void {
  jest.clearAllMocks();
  mockState.homeData = createCommandHomeData();
}
