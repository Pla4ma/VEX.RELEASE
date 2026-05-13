/**
 * Deep Link Handlers
 *
 * Navigation routing and feature flag checks for deep links.
 */

import { FEATURE_FLAGS } from '../constants/features';
import type { RootStackParams } from './types';
import type { DeepLink, DeepLinkPath } from './deep-link-paths';
import { parseDeepLink } from './deep-link-paths';

export function isDeepLinkDisabled(
  path: DeepLinkPath,
  featureFlags: Record<string, boolean>,
): boolean {
  switch (path) {
    case 'boss':
      return !featureFlags[FEATURE_FLAGS.BASIC_SOLO_BOSS];
    case 'squad':
    case 'invite':
      return !featureFlags[FEATURE_FLAGS.SQUADS_ACCOUNTABILITY];
    default:
      return false;
  }
}

export function deepLinkToNavigationParams(
  link: DeepLink,
  featureFlags: Record<string, boolean>,
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
              ? parseInt(link.params.comebackMultiplier, 10)
              : undefined,
          },
        },
      };

    case 'boss':
      return { screen: 'Main', params: { screen: 'Boss' } };

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
      return { screen: 'Guild' };

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

export function handleDeepLinkWithFallback(
  url: string,
  featureFlags: Record<string, boolean>,
  handlers: {
    onValid: (link: DeepLink) => void;
    onInvalid: (error: string) => void;
    onUnsupported: (path: string) => void;
  },
): void {
  const result = parseDeepLink(url);

  if (!result.valid) {
    handlers.onInvalid(result.error ?? 'Unknown error');
    return;
  }

  if (!result.link) {
    handlers.onInvalid('No link data');
    return;
  }

  const navParams = deepLinkToNavigationParams(result.link, featureFlags);

  if (!navParams) {
    handlers.onUnsupported(result.link.path);
    return;
  }

  handlers.onValid(result.link);
}
