import React from "react";
import { createRecommendationsHomeData } from "./recommendations-test-data";

export type HomeData = {
  companionMood: string;
  controller: {
    activeStudyPlanQuery: { data: null };
    currentStreak: number;
    disclosure: { features: { companion_detail: { isUnlocked: boolean } } };
    isLoading: boolean;
    isOnline: boolean;
    openSetup: () => void;
    primaryRecommendation: {
      id: string;
      reasoning: string;
      suggestedDifficulty: string;
      suggestedDuration: number;
    };
    progressionQuery: { data: { level: number } };
    user: { avatar: null; firstName: string };
    userId: string;
  };
  dismissIntervention: () => void;
  intervention: null;
  showToast: () => void;
  streakHoursRemaining: number;
  unreadNotificationCount: number;
};

export { createRecommendationsHomeData };

export const mockState = {
  navigate: jest.fn(),
  updateRecommendationStatus: jest.fn(),
  homeData: createRecommendationsHomeData(),
};

export function resetRecommendationsMocks(): void {
  jest.clearAllMocks();
  mockState.homeData = createRecommendationsHomeData();
}

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: mockState.navigate }),
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("../../../features/session-completion/hooks", () => ({
  useCompletionSyncAutoRepair: jest.fn(),
}));
jest.mock("../../../features/ai-coach/analytics", () => ({
  trackInterventionActioned: jest.fn(),
  trackInterventionDisplayed: jest.fn(),
}));
jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../shared/ui/components/Toast", () => ({
  useToast: () => ({ show: jest.fn() }),
}));
jest.mock("../../../shared/ui/components/ScreenErrorBoundary", () => ({
  ScreenErrorBoundary: ({ children }: { children: React.ReactNode }) =>
    children,
  withScreenErrorBoundary: (Component: React.ComponentType<unknown>) =>
    Component,
  default: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("../../../network", () => ({
  useNetInfo: () => ({ isOffline: false, isConnected: true }),
}));
jest.mock("../../../components/primitives", () => ({
  AppScreen: ({ children }: { children: React.ReactNode }) => {
    const ReactRuntime = require("react");
    const { View } = require("react-native");
    return ReactRuntime.createElement(View, null, children);
  },
  Text: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => {
    const ReactRuntime = require("react");
    const { Text: RNText } = require("react-native");
    return ReactRuntime.createElement(RNText, props, children);
  },
}));
jest.mock("../../../components", () => ({
  Button: ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => {
    const ReactRuntime = require("react");
    const { Pressable, Text } = require("react-native");
    return ReactRuntime.createElement(
      Pressable,
      { onPress },
      ReactRuntime.createElement(Text, null, children),
    );
  },
}));
jest.mock("../../../config/sentry", () => ({
  captureException: jest.fn(),
}));
jest.mock("../../../shared/ui/components/EmptyState", () => ({
  OfflineEmptyState: () => null,
}));
jest.mock("../../../features/home-spine/components", () => ({
  GreetingHeader: () => null,
  StartSessionButton: () => null,
}));
jest.mock("../hooks/useHomeData", () => ({
  useHomeData: () => mockState.homeData,
}));
jest.mock("../hooks/useHomeViewModel", () => ({
  useHomeViewModel: () => ({
    isLoading: false,
    isOnline: true,
    intervention: null,
    stage: "ENGAGED",
  }),
}));
jest.mock("../containers/HomeStageResolver", () => {
  const Rn = require("react");
  const { View } = require("react-native");
  return {
    HomeStageResolver: (): JSX.Element => {
      const { HomeContent } = require("../components/HomeContent");
      return Rn.createElement(
        View,
        null,
        Rn.createElement(HomeContent, { data: mockState.homeData }),
      );
    },
  };
});
jest.mock("../components/HomeContent", () => ({
  HomeContent: ({ data }: { data: HomeData }) => {
    const ReactRuntime = require("react");
    const { Pressable, Text } = require("react-native");
    const { controller } = data;
    const recommendation = controller.primaryRecommendation;
    const navigation = require("@react-navigation/native").useNavigation();
    const statusPress =
      (status: "ACCEPTED" | "REJECTED") => async (): Promise<void> => {
        await mockState.updateRecommendationStatus({
          recommendationId: recommendation.id,
          status,
          userId: controller.userId,
        });
        if (status === "ACCEPTED") {
          navigation.navigate("SessionStack", {
            screen: "SessionSetup",
            params: {
              recommendationId: recommendation.id,
              suggestedDifficulty: recommendation.suggestedDifficulty,
              suggestedDurationSeconds: recommendation.suggestedDuration,
            },
          });
        }
      };
    return ReactRuntime.createElement(
      ReactRuntime.Fragment,
      null,
      ReactRuntime.createElement(Text, null, recommendation.reasoning),
      ReactRuntime.createElement(
        Pressable,
        { accessibilityRole: "button", onPress: statusPress("ACCEPTED") },
        ReactRuntime.createElement(Text, null, "Accept suggestion"),
      ),
      ReactRuntime.createElement(
        Pressable,
        { accessibilityRole: "button", onPress: statusPress("REJECTED") },
        ReactRuntime.createElement(Text, null, "Dismiss suggestion"),
      ),
    );
  },
}));
