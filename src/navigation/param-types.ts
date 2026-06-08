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

export interface SessionStackParams {
  [key: string]: object | undefined;
  SessionSetup: SessionSetupParams;
  ActiveSession: { selectedThemeId?: string; sessionId: string };
  SessionComplete: { sessionId: string; summary: SessionSummary };
  SessionHistory: undefined;
}

export interface RootStackParams {
  [key: string]: object | undefined;
  Auth: NavigatorScreenParams<AuthStackParams>;
  Main: NavigatorScreenParams<MainTabParams>;
  Onboarding: { step?: number };
  Paywall: { gatedFeature?: string; source?: string; lane?: string };
  VipPaywall: { source?: string };
  Splash: undefined;
  Settings: NavigatorScreenParams<SettingsStackParams>;
  SessionStack: NavigatorScreenParams<SessionStackParams>;
  CompanionDetail: undefined;
  Comeback: { comebackState: ComebackState };
  StreakFuneral: { diedAt: number; previousStreak: number };
  FocusScoreDashboard: undefined;
  MemoryConsole: undefined;
  Rivals: undefined;
  Search: undefined;
  Vault: undefined;
}

export type ExtendedRootStackParams = RootStackParams & MainStackParams;

export interface AuthStackParams {
  [key: string]: object | undefined;
  Login: { email?: string; returnTo?: string };
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
}

export interface MainTabParams {
  [key: string]: object | undefined;
  Home: undefined;
  Focus: undefined;
  Progress: undefined;
  Profile: {
    tab?: 'stats' | 'achievements' | 'activity' | 'social';
    userId?: string;
  };
}

export interface MainStackParams {
  [key: string]: object | undefined;
  Boss: undefined;
  Notifications: undefined;
  ContentStudy: NavigatorScreenParams<ContentStudyStackParamList> | undefined;
  AICoach: undefined;
  Challenges: undefined;
  Mastery: undefined;
  CompanionDetail: undefined;
  MemoryConsole: undefined;
  Achievements: undefined;
  Analytics: undefined;
}

export interface SettingsStackParams {
  [key: string]: object | undefined;
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
