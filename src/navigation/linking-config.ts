/**
 * Deep link configuration for React Navigation.
 *
 * Maps URL paths to navigation screens so that external deep links
 * (from notifications, shared links, OS intents) resolve correctly.
 */

import type { LinkingOptions, PathConfigMap } from "@react-navigation/native";
import type { ExtendedRootStackParams } from "./param-types";

const PREFIXES = ["vex://", "https://app.vex.com", "https://vex.app"];

// React Navigation's nested PathConfigMap types are strict — cast is safe
// because the config matches the actual route structure in param-types.ts.
const SCREEN_CONFIG = {
  Auth: {
    screens: {
      Login: "login",
      Register: "register",
      ForgotPassword: "forgot-password",
      ResetPassword: "reset-password/:token",
      VerifyEmail: "verify-email",
    },
  },
  Main: {
    screens: {
      Home: "home",
      Focus: "focus",
      Progress: "progress",
      Profile: "profile",
    },
  },
  Onboarding: "onboarding",
  Paywall: "paywall",
  Settings: {
    path: "settings",
    screens: {
      SettingsMain: "",
      AccountSettings: "account",
      NotificationSettings: "notifications",
      PrivacySettings: "privacy",
      AppearanceSettings: "appearance",
      CoachSettings: "coach",
      LaneMode: "lane-mode",
    },
  },
  SessionStack: {
    path: "session",
    screens: {
      SessionSetup: "setup",
      ActiveSession: "active/:sessionId",
      SessionComplete: "complete/:sessionId",
      SessionHistory: "history",
    },
  },
  Boss: "boss",
  AICoach: "coach",
  ContentStudy: "study",
  Challenges: "challenges",
  FocusScoreDashboard: "focus-score",
} as PathConfigMap<ExtendedRootStackParams>;

export function createLinkingConfig(): LinkingOptions<ExtendedRootStackParams> {
  return {
    prefixes: PREFIXES,
    config: {
      screens: SCREEN_CONFIG,
    },
    async getInitialURL() {
      return null;
    },
    subscribe() {
      return () => {};
    },
  };
}
