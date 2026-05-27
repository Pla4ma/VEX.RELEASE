/**
 * Navigation System Export
 */

// Types
export type {
  RootStackRoute,
  AuthStackRoute,
  MainTabRoute,
  SettingsStackRoute,
  RootStackParams,
  AuthStackParams,
  MainTabParams,
  SettingsStackParams,
  NavigationState,
  RouteParams,
} from "./types";

// Safe navigation
export { openFeature, resolveFeatureRoute } from "./openFeature";
export type { OpenFeatureResult } from "./openFeature";

// Navigators
export { RootNavigator } from "./RootNavigator";
export { MainNavigator } from "./MainNavigator";
export { AuthNavigator } from "./AuthNavigator";
export { ContentStudyNavigator } from "./ContentStudyNavigator";
