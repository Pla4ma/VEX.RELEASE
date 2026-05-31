import { Linking } from "react-native";
import * as Notifications from "expo-notifications";
import type { LinkingOptions, PathConfigMap } from "@react-navigation/native";
import type { ExtendedRootStackParams } from "./param-types";

const PREFIXES = ["vex://", "https://app.vex.com", "https://vex.app"];

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
      const url = await Linking.getInitialURL();
      if (url != null) return url;
      const response = await Notifications.getLastNotificationResponseAsync();
      const notifUrl = response?.notification.request.content.data?.url;
      return typeof notifUrl === "string" ? notifUrl : null;
    },
    subscribe(listener) {
      const linkingSub = Linking.addEventListener("url", ({ url }) => {
        listener(url);
      });
      const notifSub = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const url = response.notification.request.content.data?.url;
          if (typeof url === "string") {
            listener(url);
          }
        },
      );
      return () => {
        linkingSub.remove();
        notifSub.remove();
      };
    },
  };
}
