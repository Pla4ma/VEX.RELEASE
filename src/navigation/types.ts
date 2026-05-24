import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { ContentStudyStackParamList } from '../features/content-study/types';
import type { ComebackState } from '../features/streaks/types';
import type { Nullable } from '../types/global';

export type RootStackRoute =
  | 'Main'
  | 'Auth'
  | 'Onboarding'
  | 'Paywall'
  | 'Splash'
  | 'Settings'
  | 'SessionStack'
  | 'CompanionDetail'
  | 'Comeback'
  | 'StreakFuneral'
  | 'FocusScoreDashboard'
  | 'VipPaywall';

/** ARCHIVED routes — keep in type space for migration safety but NOT registered. */
export type ArchivedRootStackRoute = 'PostSessionStory';
export type AuthStackRoute = 'Login' | 'Register' | 'ForgotPassword' | 'ResetPassword' | 'VerifyEmail';
export type MainTabRoute = 'Home' | 'Focus' | 'Progress' | 'Profile';
export type SettingsStackRoute =
  | 'SettingsMain'
  | 'AccountSettings'
  | 'NotificationSettings'
  | 'PrivacySettings'
  | 'AppearanceSettings';
export type SessionStackRoute = 'SessionSetup' | 'ActiveSession' | 'SessionComplete' | 'SessionHistory';
export type SessionSetupMode = 'LIGHT_FOCUS' | 'DEEP_WORK' | 'SPRINT' | 'CREATIVE' | 'STUDY' | 'RECOVERY';

/** Grouped sub-types for documentation and future refactoring. Flat params still supported. */
export interface ComebackContext {
  comebackMessage?: string;
  comebackMultiplier?: number;
  comebackQuest?: { requiredSessions: number; streakBefore: number } | null;
}

export interface StudyContext {
  contentId?: string;
  focusAreas?: string[];
  generationId?: string;
  goal?: string;
  studyPlanId?: string;
  suggestedDifficulty?: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
  suggestedDurationSeconds?: number;
}

export interface WarContext {
  warContext?: { squadId: string; squadWarId: string } | null;
}

export interface SessionSetupParams {
  // Flat params (existing callers)
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
  source?: 'content-study' | 'learning-execution' | 'onboarding_first_session';
  studyPlanId?: string;
  suggestedDifficulty?: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
  suggestedDurationSeconds?: number;
  warContext?: { squadId: string; squadWarId: string } | null;
  // Grouped access (preferred for new code)
  comeback?: ComebackContext;
  study?: StudyContext;
  war?: WarContext;
}

export interface SessionStackParams {
  [key: string]: object | undefined;
  SessionSetup: SessionSetupParams;
  ActiveSession: { selectedThemeId?: string; sessionId: string };
  SessionComplete: { sessionId: string; summary: unknown };
  SessionHistory: undefined;
}

export interface RootStackParams {
  [key: string]: object | undefined;
  Auth: { screen?: AuthStackRoute };
  Onboarding: { step?: number };
  Paywall: { gatedFeature?: string; source?: string };
  VipPaywall: { gemCount?: number; source?: string };
  Splash: undefined;
  Settings: { screen?: SettingsStackRoute };
  SessionStack: { params?: SessionStackParams[SessionStackRoute]; screen: SessionStackRoute };
  CompanionDetail: undefined;
  Comeback: { comebackState: ComebackState };
  StreakFuneral: { diedAt: number; previousStreak: number };
  FocusScoreDashboard: undefined;
  /** @archived — PostSessionStory route deactivated in final-release. Kept for migration safety. */
  PostSessionStory: {
    focusScore?: number;
    purityScore?: number;
    sessionId: string;
    summary?: import('../session/types').SessionSummary;
  };
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
  Profile: { tab?: 'stats' | 'achievements' | 'activity' | 'social'; userId?: string };
}

export type MainStackRoute =
  | 'Boss'
  | /** @archived — Guild route deactivated in final-release */
  'Guild'
  | /** @archived — Shop route deactivated in final-release */
  'Shop'
  | /** @archived — Inventory route deactivated in final-release */
  'Inventory'
  | 'Notifications'
  | 'ContentStudy'
  | 'AICoach'
  | 'Challenges'
  | 'Mastery'
  | 'CompanionDetail';

/** ARCHIVED — kept for migration safety, not registered. */
export type ArchivedMainStackRoute = 'Guild' | 'Shop' | 'Inventory' | 'PostSessionStory';

export interface MainStackParams {
  [key: string]: object | undefined;
  Boss: undefined;
  Notifications: undefined;
  ContentStudy: NavigatorScreenParams<ContentStudyStackParamList> | undefined;
  AICoach: undefined;
  Challenges: undefined;
  Mastery: undefined;
  CompanionDetail: undefined;
  /** @archived — Guild route deactivated in final-release. Kept for migration safety. */
  Guild: { guildId?: string } | undefined;
  /** @archived — Shop route deactivated in final-release. Kept for migration safety. */
  Shop: undefined;
  /** @archived — Inventory route deactivated in final-release. Kept for migration safety. */
  Inventory: undefined;
  /** @archived — PostSessionStory route deactivated in final-release. Kept for migration safety. */
  PostSessionStory: {
    focusScore?: number;
    purityScore?: number;
    sessionId: string;
    summary?: import('../session/types').SessionSummary;
  };
}

export interface SettingsStackParams {
  [key: string]: object | undefined;
  SettingsMain: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  AppearanceSettings: undefined;
  CoachSettings: undefined;
}

export interface ScreenOptionsFactory {
  (props: { navigation: unknown; route: { name: string } }):
    | NativeStackNavigationOptions
    | BottomTabNavigationOptions;
}

export interface NavigationState {
  currentRoute: string;
  isNavigating: boolean;
  params: Record<string, unknown>;
  previousRoute: Nullable<string>;
  routeHistory: string[];
}

export type RouteParams<T extends string> =
  T extends RootStackRoute ? RootStackParams[T]
  : T extends AuthStackRoute ? AuthStackParams[T]
  : T extends MainTabRoute ? MainTabParams[T]
  : T extends MainStackRoute ? MainStackParams[T]
  : T extends SettingsStackRoute ? SettingsStackParams[T]
  : undefined;
