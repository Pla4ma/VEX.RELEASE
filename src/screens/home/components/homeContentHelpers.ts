import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../../../features/liveops-config';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import { navigateToMainStackScreen } from '../../../navigation/navigation-helpers';
import type { HomeController } from '../hooks/home-controller-types';

export type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

export const staggeredEnterStyle = {
  container: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
};

export function buildPromiseSessionParams(promise: {
  targetDurationMinutes: number;
  targetMode: 'FOCUS' | 'RECOVERY' | 'STUDY' | 'BOSS_PREP' | 'HABIT_BUILD';
}): SessionStackParams['SessionSetup'] {
  const presetMode: SessionStackParams['SessionSetup']['presetMode'] =
    promise.targetMode === 'RECOVERY'
      ? 'LIGHT_FOCUS'
      : promise.targetMode === 'STUDY'
        ? 'STUDY'
        : promise.targetMode === 'HABIT_BUILD'
          ? 'SPRINT'
          : 'DEEP_WORK';
  return {
    presetMode,
    suggestedDurationSeconds: promise.targetDurationMinutes * 60,
  };
}

export function openChallenges(
  controller: HomeController,
  navigation: NavigationProp,
): void {
  const challengesAccess = controller.disclosure.features.challenges;
  if (
    isFeatureAvailableForNavigation(getFeatureAvailability(challengesAccess))
  ) {
    navigateToMainStackScreen(navigation, 'Challenges');
    return;
  }
  controller.openSetup();
}

export function openCompanion(
  controller: HomeController,
  navigation: NavigationProp,
): void {
  const companionAccess = controller.disclosure.features.companion_detail;
  if (
    isFeatureAvailableForNavigation(getFeatureAvailability(companionAccess))
  ) {
    navigateToMainStackScreen(navigation, 'CompanionDetail');
    return;
  }
  controller.openSetup();
}
