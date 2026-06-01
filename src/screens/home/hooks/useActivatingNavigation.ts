import { useCallback } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { SessionStackParams, ExtendedRootStackParams } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface ActivatingNavigationParams {
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (
      stage: import('../../../features/liveops-config').UserExperienceStage,
      completedSessions: number,
    ) => void;
  };
  disclosure: FeatureAccessResult;
  navigation: Nav;
  userId: string;
}

export function useActivatingNavigation(params: ActivatingNavigationParams) {
  const { analytics, disclosure, navigation, userId } = params;

  const openSetup = useCallback(
    (params?: Record<string, unknown>): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(
          userId,
          (params as SessionStackParams['SessionSetup'] | undefined)?.source ??
            'home',
        );
      }
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: (params ?? {}) as SessionStackParams['SessionSetup'],
      });
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback((): void => {
    navigation.navigate('Main', { screen: 'Progress' });
  }, [navigation]);

  const openNextAction = useCallback((): void => {
    analytics.trackNextBestActionPressed(
      disclosure.stage,
      disclosure.inputs.totalCompletedSessions,
    );
    openSetup();
  }, [
    analytics,
    disclosure.inputs.totalCompletedSessions,
    disclosure.stage,
    openSetup,
  ]);

  return {
    openSetup,
    openProgress,
    openNextAction,
  };
}
