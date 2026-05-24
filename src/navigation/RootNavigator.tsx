/**
 * Root Navigator
 *
 * Root navigation container for auth, onboarding, tabs, and feature stacks.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";

import { useAuthStore } from "../store";
import { useTheme } from "../theme";
import { useOnboardingStore } from "../onboarding";
import { useFeatureAccess } from "../features/liveops-config";
import { useFeatureHealth } from "../features/liveops-config/hooks/useFeatureHealth";

import { RootLoadingShell } from "./components/RootLoadingShell";
import { RootCrashBoundary } from "./components/RootCrashBoundary";
import { useNotificationNavigation } from "./hooks/useNotificationNavigation";
import { useStreakFuneralNavigation } from "./hooks/useStreakFuneralNavigation";
import { RootStackScreens } from "./RootStackScreens";

import type { ExtendedRootStackParams } from "./types";

function readOnboardingCompletedAt(user: unknown): string | null {
  if (!user || typeof user !== "object" || !("onboardingCompletedAt" in user)) {
    return null;
  }

  const value = user.onboardingCompletedAt;
  return typeof value === "string" ? value : null;
}

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { theme, isDark } = useTheme();
  const navigationRef = useNavigationContainerRef<ExtendedRootStackParams>();
  const {
    canCompleteForUser,
    canPreviewHome,
    completedAt,
    completedForUserId,
    isOnboarded,
    resetOnboarding,
    setCompletionFromBackend,
  } = useOnboardingStore((state) => ({
    canCompleteForUser: state.canCompleteForUser,
    canPreviewHome: state.canPreviewHome,
    completedAt: state.completedAt,
    completedForUserId: state.completedForUserId,
    isOnboarded: state.isOnboarded,
    resetOnboarding: state.resetOnboarding,
    setCompletionFromBackend: state.setCompletionFromBackend,
  }));

  const featureAccess = useFeatureAccess();
  const totalCompletedSessions = featureAccess.inputs.totalCompletedSessions;
  useFeatureHealth(totalCompletedSessions);

  const hasCompletedOnboarding = useMemo(
    () => canCompleteForUser(user?.id),
    [canCompleteForUser, user?.id],
  );

  /** Home Preview: profile steps done but first session not yet completed. */
  const canShowHomePreview = useMemo(
    () => canPreviewHome(user?.id),
    [canPreviewHome, user?.id],
  );

  const hasStaleOnboardingState = Boolean(
    user?.id &&
    isOnboarded &&
    (!completedAt || !completedForUserId || completedForUserId !== user.id),
  );
  const backendOnboardingCompletedAt = readOnboardingCompletedAt(user);

  useEffect(() => {
    const init = async (): Promise<void> => {
      await checkAuth();
      setIsReady(true);
    };

    init().catch(() => undefined);
  }, [checkAuth]);

  useEffect(() => {
    if (!hasStaleOnboardingState) {
      return;
    }

    if (user?.id && backendOnboardingCompletedAt) {
      const backendCompletedAt = Date.parse(backendOnboardingCompletedAt);
      if (!Number.isNaN(backendCompletedAt) && backendCompletedAt > 0) {
        setCompletionFromBackend(user.id, backendCompletedAt);
        return;
      }
    }

    resetOnboarding();
  }, [
    hasStaleOnboardingState,
    resetOnboarding,
    setCompletionFromBackend,
    backendOnboardingCompletedAt,
    user?.id,
  ]);

  useStreakFuneralNavigation({
    hasCompletedOnboarding,
    isAuthenticated,
    isNavigationReady,
    isReady,
    navigationRef,
    totalCompletedSessions,
    userId: user?.id,
  });

  useNotificationNavigation({
    featureAccess: featureAccess.features,
    isAuthenticated,
    navigationRef,
    userId: user?.id,
  });

  if (!isReady || isLoading) {
    return <RootLoadingShell />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setIsNavigationReady(true)}
      theme={{
        dark: isDark,
        colors: {
          primary: theme.colors.primary[500],
          background: theme.colors.semantic.background,
          card: theme.colors.semantic.surface,
          text: theme.colors.text.primary,
          border: theme.colors.semantic.border,
          notification: theme.colors.error.DEFAULT,
        },
      }}
    >
      <RootCrashBoundary
        colors={{
          background: theme.colors.semantic.background,
          border: theme.colors.semantic.border,
          primary: theme.colors.semantic.primary,
          surface: theme.colors.semantic.surfaceElevated,
          textPrimary: theme.colors.semantic.textPrimary,
          textSecondary: theme.colors.semantic.textSecondary,
        }}
        resetKey={`${user?.id ?? "signed-out"}:${hasCompletedOnboarding ? "main" : "setup"}`}
      >
        <RootStackScreens
          hasCompletedOnboarding={hasCompletedOnboarding}
          canShowHomePreview={canShowHomePreview}
          isAuthenticated={isAuthenticated}
        />
      </RootCrashBoundary>
    </NavigationContainer>
  );
};

export default RootNavigator;
