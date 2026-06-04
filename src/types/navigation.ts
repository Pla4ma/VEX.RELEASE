import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

/** Known modal screen names that can be presented inside the Modal route */
export type ModalScreenName = keyof ModalStackParamList;

/** Known settings sections that can be navigated to directly */
export type SettingsSection =
  | 'account'
  | 'notifications'
  | 'privacy'
  | 'appearance'
  | 'accessibility'
  | 'coach'
  | 'lane'
  | 'data-export'
  | 'about';

/** Known filter keys that can be passed as initial filter state */
export type FilterKey =
  | 'category'
  | 'difficulty'
  | 'duration'
  | 'status'
  | 'tag'
  | 'sort';

export type FilterParams = Partial<Record<FilterKey, string | string[] | number>>;

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Login: { redirectTo?: keyof RootStackParamList };
  Register: undefined;
  ForgotPassword: { email?: string };
  ResetPassword: { token: string };
  VerifyEmail: { token: string };
  Onboarding: { step?: number };
  Modal: { screen: ModalScreenName; params?: ModalStackParamList[ModalScreenName] };
  Settings: { section?: SettingsSection };
  Profile: { userId: string };
  SquadDetails: { squadId: string };
  NotFound: undefined;
  Error: { error?: Error; message?: string };
};
export type MainTabParamList = {
  Home: undefined;
  Explore: { category?: string };
  Create: undefined;
  Squads: undefined;
  Profile: { userId?: string };
};
export type AuthStackParamList = {
  Login: { redirectTo?: keyof RootStackParamList };
  Register: undefined;
  ForgotPassword: { email?: string };
  ResetPassword: { token: string };
  VerifyEmail: { token: string };
};
export type OnboardingStackParamList = {
  Welcome: undefined;
  Permissions: undefined;
  ProfileSetup: undefined;
  Preferences: undefined;
  Complete: undefined;
};
export type ModalStackParamList = {
  Settings: { section?: SettingsSection };
  Notifications: undefined;
  Search: { query?: string };
  Filters: { initialFilters?: FilterParams };
};
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;
export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;
export type ModalScreenProps<T extends keyof ModalStackParamList> =
  NativeStackScreenProps<ModalStackParamList, T>;
export type RouteName =
  | keyof RootStackParamList
  | keyof MainTabParamList
  | keyof AuthStackParamList
  | keyof OnboardingStackParamList
  | keyof ModalStackParamList;
export interface NavigationState {
  currentRoute: RouteName;
  previousRoute?: RouteName;
  routeHistory: RouteName[];
  params?: RootStackParamList[keyof RootStackParamList];
  timestamp: string;
}
export interface DeepLinkConfig {
  prefix: string;
  screens: Record<string, string>;
}
export interface NavigationAnimation {
  enabled: boolean;
  type: 'slide' | 'fade' | 'scale' | 'none';
  duration: number;
}
export interface ScreenTransitionOptions {
  animation?: NavigationAnimation;
  gestureEnabled?: boolean;
  headerShown?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal' | 'containedModal';
}
export interface TabBarConfig {
  visible: boolean;
  activeTintColor: string;
  inactiveTintColor: string;
  showLabels: boolean;
  style: 'default' | 'floating' | 'compact';
}
export interface HeaderConfig {
  visible: boolean;
  title?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  rightActions?: HeaderAction[];
  transparent?: boolean;
  blurEffect?: boolean;
}
export interface HeaderAction {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}
export interface GuardCheckResult {
  allowed: boolean;
  redirectTo?: keyof RootStackParamList;
  message?: string;
  requiresAction?: boolean;
}
export type NavigationGuard = (
  route: keyof RootStackParamList,
  params?: RootStackParamList[keyof RootStackParamList],
) => GuardCheckResult | Promise<GuardCheckResult>;
export type NavigationEventType =
  | 'focus'
  | 'blur'
  | 'stateChange'
  | 'beforeRemove'
  | 'gestureStart'
  | 'gestureEnd'
  | 'transitionStart'
  | 'transitionEnd';
export interface NavigationEvent {
  type: NavigationEventType;
  route: RouteName;
  timestamp: string;
  data?: { [key: string]: string | number | boolean | undefined };
}
export interface NavigationAnalytics {
  screenName: string;
  screenClass: string;
  previousScreen?: string;
  timeOnScreen: number;
  params?: RootStackParamList[keyof RootStackParamList];
}
