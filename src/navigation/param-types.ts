import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ContentStudyStackParamList } from '../features/content-study/types';
import type { ComebackState } from '../features/streaks/schemas';
import type { SessionSummary } from '../session/types/schemas';
import type {
  AuthStackRoute,
  ComebackContext,
  MainStackRoute,
  MainTabRoute,
  RootStackRoute,
  SessionSetupMode,
  SettingsStackRoute,
  StudyContext,
  WarContext,
} from './route-types';

export interface SessionSetupParams {
  comebackMessage?: string;
  comebackMultiplier?: number;
  comebackQuest?: { requiredSessions: number; streakBefore: number } | null;
  contentId?: string;
  focusAreas?: string[];
  generationId?: string;
  goal?: string;
  presetDuration?: number;
  presetId?: string;
  presetMode?: SessionSetupMode;
  recommendationId?: string;
  selectedThemeId?: string;
  sessionCategory?: string;
  sessionTags?: string[];
  learningExecutionLabel?: string;
  learningExecutionTaskId?: string;
  source?:
    | 'content-study'
    | 'learning-execution'
    | 'onboarding_first_session'
    | 'plan'
    | 'rescue';
  studyPlanId?: string;
  suggestedDifficulty?: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
  suggestedDurationSeconds?: number;
  warContext?: { squadId: string; squadWarId: string } | null;
  comeback?: ComebackContext;
  study?: StudyContext;
  war?: WarContext;
  rescuePlanId?: string;
  rescueTaskDescription?: string;
}

export type SessionStackParams = {
  SessionSetup: SessionSetupParams;
  ActiveSession: { selectedThemeId?: string; sessionId: string };
  SessionComplete: { sessionId: string; summary: SessionSummary };
  SessionHistory: undefined;
}

export type RootStackParams = {
  Auth: NavigatorScreenParams<AuthStackParams>;
  Main: NavigatorScreenParams<MainTabParams>;
  Onboarding: { step?: number };
  Paywall: { gatedFeature?: string; source?: string; lane?: string };
  VipPaywall: { source?: string };
  Settings: NavigatorScreenParams<SettingsStackParams>;
  SessionStack: NavigatorScreenParams<SessionStackParams>;
  Guide: undefined;
  CompanionDetail: undefined;
  Comeback: { comebackState: ComebackState };
  StreakFuneral: { diedAt: number; previousStreak: number };
  FocusScoreDashboard: undefined;
  MemoryConsole: undefined;
  Boss: undefined;
  Notifications: undefined;
  ContentStudy: NavigatorScreenParams<ContentStudyStackParamList> | undefined;
  AICoach: undefined;
  Challenges: undefined;
  Mastery: undefined;
  Achievements: undefined;
  Analytics: undefined;
};
export type RootStackParamList = RootStackParams;
export type ExtendedRootStackParams = RootStackParams;

export type AuthStackParams = {
  Login: { email?: string; returnTo?: string };
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
}

export type MainTabParams = {
  Home: undefined;
  Focus: undefined;
  Progress: undefined;
  Profile:
    | {
        tab?: 'stats' | 'achievements' | 'activity' | 'social';
        userId?: string;
      }
    | undefined;
};

// Feature routes are registered on the root stack, so both aliases must
// describe the same navigator contract.
export type MainStackParams = RootStackParams;

export type SettingsStackParams = {
  SettingsMain: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  AppearanceSettings: undefined;
  CoachSettings: undefined;
  LaneMode: undefined;
  DataExport: undefined;
}

export interface ScreenOptionsFactory {
  (props: {
    navigation: unknown;
    route: { name: string };
  }): NativeStackNavigationOptions | BottomTabNavigationOptions;
}

export type RouteParams<T extends string> = T extends RootStackRoute
  ? RootStackParams[T]
  : T extends AuthStackRoute
    ? AuthStackParams[T]
    : T extends MainTabRoute
      ? MainTabParams[T]
      : T extends MainStackRoute
        ? MainStackParams[T]
        : T extends SettingsStackRoute
          ? SettingsStackParams[T]
          : undefined;
