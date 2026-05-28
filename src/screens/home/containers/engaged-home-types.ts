import type { UseQueryResult } from "@tanstack/react-query";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FeatureAccessResult } from "../../../features/liveops-config";
import type { HomeFeatureRuntime } from "../hooks/home-feature-runtime";
import type { SessionHistoryResult } from "../hooks/home-controller-types";
import type { ExtendedRootStackParams } from "../../../navigation/types";

export type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export interface StreakQueryData {
  currentDays?: number;
  isAtRisk?: boolean;
}

export interface ProgressionQueryData {
  xp?: number;
  level?: number;
}

export interface ActiveStudyPlanData {
  completedTasks?: number;
  remainingMinutes?: number;
  title?: string;
  totalTasks?: number;
}

export interface ComebackData {
  isComeback?: boolean;
  message?: string;
}

export interface EngagedContainerInput {
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (
      stage: import("../../../features/liveops-config").UserExperienceStage,
      completedSessions: number,
    ) => void;
  };
  disclosure: FeatureAccessResult;
  historyQuery: SessionHistoryResult;
  isOnline: boolean;
  progressionQuery: UseQueryResult;
  runtime: HomeFeatureRuntime;
  streakQuery: UseQueryResult;
  userId: string;
}
