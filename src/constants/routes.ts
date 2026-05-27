/**
 * Route Constants
 *
 * Screen names and route configuration for navigation.
 * Centralized route management for type safety.
 */

/**
 * Root stack route names
 */
export const ROUTES = {
  // Root
  ROOT: "Root",
  MAIN: "Main",

  // Auth
  AUTH: "Auth",
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",
  RESET_PASSWORD: "ResetPassword",
  VERIFY_EMAIL: "VerifyEmail",

  // Onboarding
  ONBOARDING: "Onboarding",
  ONBOARDING_WELCOME: "Welcome",
  ONBOARDING_PERMISSIONS: "Permissions",
  ONBOARDING_PROFILE: "ProfileSetup",
  ONBOARDING_PREFERENCES: "Preferences",
  ONBOARDING_COMPLETE: "Complete",

  // Main Tabs
  HOME_TAB: "HomeTab",
  EXPLORE_TAB: "ExploreTab",
  CREATE_TAB: "CreateTab",
  SQUADS_TAB: "SquadsTab",
  PROFILE_TAB: "ProfileTab",

  // Home Stack
  HOME: "Home",
  HOME_DETAIL: "HomeDetail",

  // Explore Stack
  EXPLORE: "Explore",
  SEARCH: "Search",
  CATEGORY: "Category",
  TRENDING: "Trending",

  // Create Stack
  CREATE: "Create",
  CREATE_SELECT_TYPE: "CreateSelectType",
  CREATE_FORM: "CreateForm",
  CREATE_PREVIEW: "CreatePreview",

  // Squads Stack
  SQUADS: "Squads",
  SQUAD_DETAIL: "SquadDetails",
  SQUAD_CREATE: "SquadCreate",
  SQUAD_EDIT: "SquadEdit",
  SQUAD_MEMBERS: "SquadMembers",
  SQUAD_INVITE: "SquadInvite",

  // Profile Stack
  PROFILE: "Profile",
  EDIT_PROFILE: "EditProfile",
  SETTINGS: "Settings",
  SETTINGS_APPEARANCE: "AppearanceSettings",
  SETTINGS_NOTIFICATIONS: "NotificationSettings",
  SETTINGS_PRIVACY: "PrivacySettings",
  SETTINGS_ACCESSIBILITY: "AccessibilitySettings",
  SETTINGS_ABOUT: "AboutSettings",
  ACHIEVEMENTS: "Achievements",
  WALLET: "Wallet",
  TRANSACTIONS: "Transactions",

  // Modals
  MODAL: "Modal",
  SETTINGS_MODAL: "SettingsModal",
  NOTIFICATIONS_MODAL: "NotificationsModal",
  FILTERS_MODAL: "FiltersModal",
  SHARE_MODAL: "ShareModal",

  // Shared
  USER_PROFILE: "UserProfile",
  ACHIEVEMENT_DETAIL: "AchievementDetail",
  NOTIFICATIONS: "Notifications",

  // Error
  NOT_FOUND: "NotFound",
  ERROR: "Error",
} as const;

/**
 * Deep link URL schemes
 */
export const DEEP_LINKS = {
  scheme: "vex://",
  https: "https://vex.app",

  // Auth
  verifyEmail: "auth/verify-email",
  resetPassword: "auth/reset-password",

  // User
  profile: "user/:id",

  // Squads
  squad: "squad/:id",
  joinSquad: "squad/:id/join",

  // Content
  share: "share/:type/:id",
} as const;

/**
 * Route display names
 */
export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: "Home",
  [ROUTES.EXPLORE]: "Explore",
  [ROUTES.CREATE]: "Create",
  [ROUTES.SQUADS]: "Squads",
  [ROUTES.PROFILE]: "Profile",
  [ROUTES.SETTINGS]: "Settings",
  [ROUTES.ACHIEVEMENTS]: "Achievements",
  [ROUTES.WALLET]: "Wallet",
  [ROUTES.NOTIFICATIONS]: "Notifications",
};

/**
 * Tab bar icons mapping
 */
export const TAB_ICONS: Record<string, string> = {
  [ROUTES.HOME_TAB]: "home",
  [ROUTES.EXPLORE_TAB]: "compass",
  [ROUTES.CREATE_TAB]: "plus-circle",
  [ROUTES.SQUADS_TAB]: "users",
  [ROUTES.PROFILE_TAB]: "user",
};

/**
 * Routes that require authentication
 */
export const PROTECTED_ROUTES = [
  ROUTES.CREATE_TAB,
  ROUTES.SQUADS_TAB,
  ROUTES.PROFILE_TAB,
  ROUTES.SETTINGS,
  ROUTES.EDIT_PROFILE,
  ROUTES.ACHIEVEMENTS,
  ROUTES.WALLET,
  ROUTES.TRANSACTIONS,
] as const;

/**
 * Routes that are only accessible in onboarding
 */
export const ONBOARDING_ROUTES = [
  ROUTES.ONBOARDING,
  ROUTES.ONBOARDING_WELCOME,
  ROUTES.ONBOARDING_PERMISSIONS,
  ROUTES.ONBOARDING_PROFILE,
  ROUTES.ONBOARDING_PREFERENCES,
  ROUTES.ONBOARDING_COMPLETE,
] as const;

/**
 * Routes that can be accessed as modals
 */
export const MODAL_ROUTES = [
  ROUTES.SETTINGS_MODAL,
  ROUTES.NOTIFICATIONS_MODAL,
  ROUTES.FILTERS_MODAL,
  ROUTES.SHARE_MODAL,
] as const;
