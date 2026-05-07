/**
 * Navigation Types
 *
 * Type definitions for navigation system.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import type { ContentStudyStackParamList } from '../features/content-study/types';
import type { ComebackState } from '../features/streaks/types';
import type { Nullable } from '../types/global';

// ============================================================================
// Route Names
// ============================================================================

/**
 * Root stack route names
 */
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
  | 'PostSessionStory';

/**
 * Auth stack route names
 */
export type AuthStackRoute =
  | 'Login'
  | 'Register'
  | 'ForgotPassword'
  | 'ResetPassword'
  | 'VerifyEmail';

/**
 * Main tab route names - Launch structure: Home/Focus/Progress/Profile
 * Social removed from bottom tabs, integrated into Profile
 * Start removed - Home has strong Start CTA
 */
export type MainTabRoute =
  | 'Home'
  | 'Focus'
  | 'Progress'
  | 'Profile'
  ;

/**
 * Settings stack route names
 */
export type SettingsStackRoute =
  | 'SettingsMain'
  | 'AccountSettings'
  | 'NotificationSettings'
  | 'PrivacySettings'
  | 'AppearanceSettings';

// ============================================================================
// Route Params
// ============================================================================

/**
 * Session stack route names - Core Focus Loop
 */
export type SessionStackRoute =
  | 'SessionSetup'
  | 'ActiveSession'
  | 'SessionComplete'
  | 'SessionHistory';

/**
 * Session stack params
 */
export interface SessionStackParams {
  [key: string]: object | undefined;
  SessionSetup: {
    presetId?: string;
    presetDuration?: number;
    presetMode?: 'LIGHT_FOCUS' | 'DEEP_WORK' | 'SPRINT' | 'CREATIVE' | 'STUDY';
    selectedThemeId?: string;
    goal?: string;
    suggestedDurationSeconds?: number;
    suggestedDifficulty?: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
    recommendationId?: string;
    comebackMultiplier?: number;
    comebackMessage?: string;
    comebackQuest?: {
      streakBefore: number;
      requiredSessions: number;
    } | null;
    warContext?: {
      squadWarId: string;
      squadId: string;
    } | null;
    // Content Study integration
    focusAreas?: string[];
    source?: 'content-study' | 'onboarding_first_session';
    generationId?: string;
    contentId?: string;
    studyPlanId?: string;
    sessionCategory?: string;
    sessionTags?: string[];
  };
  ActiveSession: { sessionId: string; selectedThemeId?: string };
  SessionComplete: { sessionId: string; summary: unknown };
  SessionHistory: undefined;
}

/**
 * Root stack params
 */
export interface RootStackParams {
  [key: string]: object | undefined;
  Auth: { screen?: AuthStackRoute };
  Onboarding: { step?: number };
  Paywall: { source?: string; gatedFeature?: string };
  VipPaywall: { source?: string; gemCount?: number };
  Splash: undefined;
  Settings: { screen?: SettingsStackRoute };
  SessionStack: { screen: SessionStackRoute; params?: SessionStackParams[SessionStackRoute] };
  CompanionDetail: undefined;
  Comeback: { comebackState: ComebackState };
  StreakFuneral: { previousStreak: number; diedAt: number };
  PostSessionStory: { sessionId: string; focusScore?: number; purityScore?: number; summary?: import('../session/types').SessionSummary };
}

/**
 * Extended root stack params including feature module screens
 */
export type ExtendedRootStackParams = RootStackParams & MainStackParams;

/**
 * Auth stack params
 */
export interface AuthStackParams {
  [key: string]: object | undefined;
  Login: { email?: string; returnTo?: string };
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { email: string };
}

/**
 * Main tab params - Launch structure
 */
export interface MainTabParams {
  [key: string]: object | undefined;
  Home: undefined;
  Focus: undefined;
  Progress: undefined;
  Profile: { userId?: string; tab?: 'stats' | 'achievements' | 'activity' | 'social' };
}

/**
 * Main stack route names for feature modules
 */
export type MainStackRoute =
  | 'Boss'
  | 'Duels'
  | 'ActiveDuel'
  | 'DuelResult'
  | 'Guild'
  | 'BattlePass'
  | 'Crafting'
  | 'Shop'
  | 'Inventory'
  | 'Feed'
  | 'Notifications'
  | 'Search'
  | 'Analytics'
  | 'Rankings'
  | 'ContentStudy'
  | 'ContentReview'
  | 'StudyPlan'
  | 'ContentInput'
  | 'Rivals'
  | 'Coach'
  | 'AICoach'
  | 'SquadWars'
  | 'Challenges'
  | 'Mastery'
  | 'Vault'
  | 'Leaderboard'
  | 'PostSessionStory';

/**
 * Main stack params for feature module screens
 */
export interface MainStackParams {
  [key: string]: object | undefined;
  Boss: undefined;
  Duels: undefined;
  ActiveDuel: { duelId: string };
  DuelResult: { duelId: string; winnerId?: string; forfeitBy?: string };
  Guild: { guildId?: string } | undefined;
  BattlePass: undefined;
  Crafting: undefined;
  Shop: undefined;
  Inventory: undefined;
  Feed: { userId?: string };
  Notifications: undefined;
  Search: { query?: string };
  Analytics: { month?: string }; // Updated to accept month
  Rankings: undefined;
  ContentStudy: NavigatorScreenParams<ContentStudyStackParamList> | undefined;
  ContentReview: { contentId: string };
  StudyPlan: { generationId: string; contentId: string };
  ContentInput: undefined;
  Rivals: undefined;
  Coach: undefined;
  AICoach: undefined;
  SquadWars: undefined;
  Challenges: undefined;
  Mastery: undefined;
  Vault: undefined;
  Leaderboard: { period?: 'DAILY' | 'WEEKLY' | 'MONTHLY'; scope?: 'GLOBAL' | 'FRIENDS' } | undefined;
  PostSessionStory: { sessionId: string; focusScore?: number; purityScore?: number; summary?: import('../session/types').SessionSummary };
}

/**
 * Settings stack params
 */
export interface SettingsStackParams {
  [key: string]: object | undefined;
  SettingsMain: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  AppearanceSettings: undefined;
  CoachSettings: undefined;
}

// ============================================================================
// Navigation Options
// ============================================================================

/**
 * Screen options factory
 */
export interface ScreenOptionsFactory {
  (props: { route: { name: string }; navigation: unknown }):
    | NativeStackNavigationOptions
    | BottomTabNavigationOptions;
}

// ============================================================================
// Navigation State
// ============================================================================

/**
 * Navigation state
 */
export interface NavigationState {
  currentRoute: string;
  previousRoute: Nullable<string>;
  params: Record<string, unknown>;
  routeHistory: string[];
  isNavigating: boolean;
}

// ============================================================================
// Navigation Utils
// ============================================================================

/**
 * Type helper for route params
 */
export type RouteParams<T extends string> =
  T extends RootStackRoute
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
