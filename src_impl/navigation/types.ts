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
  | 'FocusScoreDashboard'
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
 * Extended root stack params including feature module screens
 */
export type ExtendedRootStackParams = RootStackParams & MainStackParams;
/**
 * Main stack route names for feature modules
 */
export type MainStackRoute =
  | 'Boss'
  | 'Guild'
  | 'BattlePass'
  | 'Shop'
  | 'Inventory'
  | 'Notifications'
  | 'Search'
  | 'Analytics'
  | 'ContentStudy'
  | 'ContentReview'
  | 'StudyPlan'
  | 'ContentInput'
  | 'Coach'
  | 'AICoach'
  | 'Challenges'
  | 'Mastery'
  | 'Vault'
  | 'Leaderboard'
  | 'PostSessionStory'
  | 'MonthlyFocusReport';
// ============================================================================
// Navigation Options
// ============================================================================
// ============================================================================
// Navigation State
// ============================================================================
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

export * from "./types.types";
