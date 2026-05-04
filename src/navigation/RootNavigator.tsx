/**
 * Root Navigator
 *
 * Root navigation container for auth, onboarding, tabs, and feature stacks.
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';

import { useAuthStore } from '../store';
import { useTheme } from '../theme';
import { useOnboardingStore } from '../onboarding';

import { RootLoadingShell } from './components/RootLoadingShell';
import { useNotificationNavigation } from './hooks/useNotificationNavigation';
import { useStreakFuneralNavigation } from './hooks/useStreakFuneralNavigation';
import { RootStackScreens } from './RootStackScreens';

import type { ExtendedRootStackParams } from './types';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { theme, isDark } = useTheme();
  const navigationRef = useNavigationContainerRef<ExtendedRootStackParams>();
  const { isHydrated: onboardingHydrated, profiles } = useOnboardingStore((state) => ({
    isHydrated: state.isHydrated,
    profiles: state.profiles,
  }));
  const hasCompletedOnboarding = user?.id ? Boolean(profiles[user.id]?.completedAt) : false;

  useEffect(() => {
    const init = async (): Promise<void> => {
      await checkAuth();
      setIsReady(true);
    };

    void init();
  }, [checkAuth]);

  useStreakFuneralNavigation({
    hasCompletedOnboarding,
    isAuthenticated,
    isNavigationReady,
    isReady,
    navigationRef,
    userId: user?.id,
  });

  useNotificationNavigation({
    isAuthenticated,
    navigationRef,
    userId: user?.id,
  });

  if (!isReady || isLoading || (isAuthenticated && !onboardingHydrated)) {
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
          background: theme.colors.background.primary,
          card: theme.colors.background.secondary,
          text: theme.colors.text.primary,
          border: theme.colors.border.DEFAULT,
          notification: theme.colors.error.DEFAULT,
        },
      }}
    >
      <RootStackScreens
        hasCompletedOnboarding={hasCompletedOnboarding}
        isAuthenticated={isAuthenticated}
      />
    </NavigationContainer>
  );
};

export default RootNavigator;
