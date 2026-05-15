import { FEATURE_FLAGS } from '../constants/features';

import type { RootStackParams } from './types';
import type { DeepLink, DeepLinkPath } from './deep-link-types';

const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  [FEATURE_FLAGS.BASIC_SOLO_BOSS]: true,
  [FEATURE_FLAGS.SQUADS_ACCOUNTABILITY]: true,
};

export function isDeepLinkDisabled(
  path: DeepLinkPath,
  featureFlags: Record<string, boolean>,
): boolean {
  switch (path) {
    case 'boss':
      return !featureFlags[FEATURE_FLAGS.BASIC_SOLO_BOSS];
    case 'duels':
    case 'squad':
    case 'invite':
      return !featureFlags[FEATURE_FLAGS.SQUADS_ACCOUNTABILITY];
    default:
      return false;
  }
}

export function deepLinkToNavigationParams(
  link: DeepLink,
  featureFlags: Record<string, boolean> = DEFAULT_FEATURE_FLAGS,
): { screen: keyof RootStackParams; params?: unknown } | null {
  if (isDeepLinkDisabled(link.path, featureFlags)) {
    return { screen: 'Main', params: undefined };
  }

  switch (link.path) {
    case 'session':
      return {
        screen: 'SessionStack',
        params: {
          screen: 'SessionSetup',
          params: {
            presetId: link.params.presetId,
            comebackMultiplier: link.params.comebackMultiplier
              ? Number.parseInt(link.params.comebackMultiplier, 10)
              : undefined,
          },
        },
      };
    case 'boss':
      return { screen: 'Main', params: { screen: 'Boss' } };
    case 'duels':
      return { screen: 'Main', params: { screen: 'Home' } };
    case 'squad':
      return { screen: 'Main', params: { screen: 'Guild' } };
    case 'profile':
      return {
        screen: 'Main',
        params: { screen: 'Profile', params: { userId: link.params.userId } },
      };
    case 'settings':
      return { screen: 'Settings', params: { screen: 'SettingsMain' } };
    case 'invite':
      return { screen: 'Main', params: { screen: 'Profile' } };
    case 'study':
      return { screen: 'Main', params: { screen: 'ContentStudy' } };
    case 'coach':
      return { screen: 'Main', params: { screen: 'AICoach' } };
    case 'shop':
      return { screen: 'Main', params: { screen: 'Shop' } };
    default:
      return null;
  }
}
