/**
 * Navigation Type Definitions
 *
 * Type definitions for React Navigation with strongly-typed
 * route parameters and screen props.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

/**
 * Root stack navigator parameter list
 * Defines all screens in the root navigation stack
 */
export type RootStackParamList = {
  // Main flow
  Main: undefined;

  // Auth flow
  Auth: undefined;
  Login: { redirectTo?: keyof RootStackParamList };
  Register: undefined;
  ForgotPassword: { email?: string };
  ResetPassword: { token: string };
  VerifyEmail: { token: string };

  // Onboarding
  Onboarding: { step?: number };

  // Modal screens
  Modal: { screen: string; params?: Record<string, unknown> };
  Settings: { section?: string };
  Profile: { userId: string };
  SquadDetails: { squadId: string };

  // Error screens
  NotFound: undefined;
  Error: { error?: Error; message?: string };
};

/**
 * Main tab navigator parameter list
 * Defines all tabs in the bottom tab bar
 */
export type MainTabParamList = {
  Home: undefined;
  Explore: { category?: string };
  Create: undefined;
  Squads: undefined;
  Profile: { userId?: string };
};

/**
 * Auth stack navigator parameter list
 */
export type AuthStackParamList = {
  Login: { redirectTo?: keyof RootStackParamList };
  Register: undefined;
  ForgotPassword: { email?: string };
  ResetPassword: { token: string };
  VerifyEmail: { token: string };
};

/**
 * Onboarding stack navigator parameter list
 */
export type OnboardingStackParamList = {
  Welcome: undefined;
  Permissions: undefined;
  ProfileSetup: undefined;
  Preferences: undefined;
  Complete: undefined;
};

/**
 * Modal stack navigator parameter list
 */
export type ModalStackParamList = {
  Settings: { section?: string };
  Notifications: undefined;
  Search: { query?: string };
  Filters: { initialFilters?: Record<string, unknown> };
};

/**
 * Type-safe screen props for root stack screens
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Type-safe screen props for main tab screens
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

/**
 * Type-safe screen props for auth screens
 */
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

/**
 * Type-safe screen props for onboarding screens
 */
export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

/**
 * Type-safe screen props for modal screens
 */
export type ModalScreenProps<T extends keyof ModalStackParamList> =
  NativeStackScreenProps<ModalStackParamList, T>;

/**
 * Navigation route names as union type
 */
export type RouteName =
  | keyof RootStackParamList
  | keyof MainTabParamList
  | keyof AuthStackParamList
  | keyof OnboardingStackParamList
  | keyof ModalStackParamList;

/**
 * Navigation state tracking
 */
export interface NavigationState {
  currentRoute: RouteName;
  previousRoute?: RouteName;
  routeHistory: RouteName[];
  params?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Deep link configuration
 */
export interface DeepLinkConfig {
  prefix: string;
  screens: Record<string, string>;
}

/**
 * Navigation animation preferences
 */
export interface NavigationAnimation {
  enabled: boolean;
  type: 'slide' | 'fade' | 'scale' | 'none';
  duration: number;
}

/**
 * Screen transition options
 */
export interface ScreenTransitionOptions {
  animation?: NavigationAnimation;
  gestureEnabled?: boolean;
  headerShown?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal' | 'containedModal';
}

/**
 * Tab bar configuration
 */
export interface TabBarConfig {
  visible: boolean;
  activeTintColor: string;
  inactiveTintColor: string;
  showLabels: boolean;
  style: 'default' | 'floating' | 'compact';
}

/**
 * Header configuration
 */
export interface HeaderConfig {
  visible: boolean;
  title?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  rightActions?: HeaderAction[];
  transparent?: boolean;
  blurEffect?: boolean;
}

/**
 * Header action definition
 */
export interface HeaderAction {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

/**
 * Navigation guard check result
 */
export interface GuardCheckResult {
  allowed: boolean;
  redirectTo?: keyof RootStackParamList;
  message?: string;
  requiresAction?: boolean;
}

/**
 * Navigation guard function type
 */
export type NavigationGuard = (
  route: keyof RootStackParamList,
  params?: Record<string, unknown>
) => GuardCheckResult | Promise<GuardCheckResult>;

/**
 * Navigation event types
 */
export type NavigationEventType =
  | 'focus'
  | 'blur'
  | 'stateChange'
  | 'beforeRemove'
  | 'gestureStart'
  | 'gestureEnd'
  | 'transitionStart'
  | 'transitionEnd';

/**
 * Navigation event payload
 */
export interface NavigationEvent {
  type: NavigationEventType;
  route: RouteName;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * Navigation analytics data
 */
export interface NavigationAnalytics {
  screenName: string;
  screenClass: string;
  previousScreen?: string;
  timeOnScreen: number;
  params?: Record<string, unknown>;
}
