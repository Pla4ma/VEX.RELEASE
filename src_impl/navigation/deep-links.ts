/**
 * Deep Link Handling System
 *
 * Manages URL routing for external links and deep navigation.
 */

import { z } from 'zod';
import { createDebugger } from '../utils/debug';
import * as Sentry from '@sentry/react-native';
import type { RootStackParams } from './types';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { FEATURE_FLAGS } from '../constants/features';

const debug = createDebugger('navigation:deep-links');

// Supported deep link paths
export type DeepLinkPath =
  | 'session'
  | 'boss'
  | 'duels'
  | 'squad'
  | 'profile'
  | 'settings'
  | 'invite'
  | 'study'
  | 'coach'
  | 'shop';

// Deep link structure
export interface DeepLink {
  path: DeepLinkPath;
  params: Record<string, string>;
  query: Record<string, string>;
}

// URL parsing result
export interface ParsedDeepLink {
  valid: boolean;
  link?: DeepLink;
  error?: string;
}

// Deep link URL schema
export const DeepLinkUrlSchema = z.object({
  scheme: z.enum(['vex', 'https']),
  host: z.enum(['app.vex.com', 'vex.app', 'localhost', '']),
  path: z.string(),
  queryParams: z.record(z.string()),
});

/**
 * Parse deep link URL
 */
export function parseDeepLink(url: string): ParsedDeepLink {
  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(':', '');
    const host = parsed.hostname;
    const pathname = parsed.pathname.replace(/^\//, '');
    const searchParams = parsed.searchParams;

    // Build query params object
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // Validate URL structure
    const validated = DeepLinkUrlSchema.safeParse({
      scheme,
      host,
      path: pathname,
      queryParams,
    });

    if (!validated.success) {
      return { valid: false, error: 'Invalid URL structure' };
    }

    // Extract path segments
    const pathSegments = pathname.split('/').filter(Boolean);
    const path = pathSegments[0] as DeepLinkPath | undefined;

    if (!path || !isValidDeepLinkPath(path)) {
      return { valid: false, error: `Unknown path: ${pathname}` };
    }

    // Build params from remaining path segments
    const params: Record<string, string> = {};
    for (let i = 1; i < pathSegments.length; i += 2) {
      const key = pathSegments[i];
      const value = pathSegments[i + 1] ?? '';
      if (key) {
        params[key] = value;
      }
    }

    const link: DeepLink = {
      path,
      params: { ...params, ...queryParams },
      query: queryParams,
    };

    debug.info('Parsed deep link: %s -> %s', url, path);
    return { valid: true, link };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'deep-links', operation: 'parseDeepLink' },
    });
    debug.info('Failed to parse deep link: %s', url);
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Check if path is a valid deep link path
 */
function isValidDeepLinkPath(path: string): path is DeepLinkPath {
  const validPaths: DeepLinkPath[] = [
    'session',
    'boss',
    'duels',
    'squad',
    'profile',
    'settings',
    'invite',
    'study',
    'coach',
    'shop',
  ];
  return validPaths.includes(path as DeepLinkPath);
}

/**
 * Convert deep link to navigation params
 */
export function deepLinkToNavigationParams(
  link: DeepLink
): { screen: keyof RootStackParams; params?: unknown } | null {
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
      // Check if basic solo boss feature is enabled
      const { isEnabled: isBossEnabled } = useFeatureFlags();
      if (!isBossEnabled(FEATURE_FLAGS.BASIC_SOLO_BOSS)) {
        return {
          screen: 'Main',
          params: undefined,
        };
      }
      return {
        screen: 'Main',
        params: {
          screen: 'Boss',
        },
      };

    case 'duels':
      // Check if duels feature is enabled
      const { isEnabled: areDuelsEnabled } = useFeatureFlags();
      if (!areDuelsEnabled(FEATURE_FLAGS.DUELS)) {
        return {
          screen: 'Main',
          params: undefined,
        };
      }
      return {
        screen: 'Main',
        params: {
          screen: 'Duels',
        },
      };

    case 'squad':
      // Check if squads accountability feature is enabled
      const { isEnabled: areSquadsEnabled } = useFeatureFlags();
      if (!areSquadsEnabled(FEATURE_FLAGS.SQUADS_ACCOUNTABILITY)) {
        return {
          screen: 'Main',
          params: undefined,
        };
      }
      return {
        screen: 'Main',
        params: {
          screen: 'Guild',
        },
      };

    case 'profile':
      return {
        screen: 'Main',
        params: {
          screen: 'Profile',
          params: {
            userId: link.params.userId,
          },
        },
      };

    case 'settings':
      return {
        screen: 'Settings',
        params: {
          screen: 'SettingsMain',
        },
      };

    case 'invite':
      return {
        screen: 'Guild',
      };

    case 'study':
      return {
        screen: 'Main',
        params: {
          screen: 'ContentStudy',
        },
      };

    case 'coach':
      return {
        screen: 'Main',
        params: {
          screen: 'AICoach',
        },
      };

    case 'shop':
      return {
        screen: 'Main',
        params: {
          screen: 'Shop',
        },
      };

    default:
      return null;
  }
}

/**
 * Generate deep link URL from params
 */
export function generateDeepLink(
  path: DeepLinkPath,
  params?: Record<string, string>
): string {
  const baseUrl = 'vex://';
  const paramString = params
    ? Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
    : '';

  return paramString ? `${baseUrl}${path}?${paramString}` : `${baseUrl}${path}`;
}

/**
 * Generate shareable invite link
 */
export function generateInviteLink(squadId: string, code: string): string {
  return `https://vex.app/invite/squad/${squadId}?code=${code}`;
}

/**
 * Generate session share link
 */
export function generateSessionShareLink(sessionId: string): string {
  return `https://vex.app/session/${sessionId}`;
}

/**
 * Generate profile share link
 */
export function generateProfileShareLink(userId: string): string {
  return `https://vex.app/profile/${userId}`;
}

/**
 * Validate invite code format
 */
export function validateInviteCode(code: string): boolean {
  // Invite codes: 8 characters, alphanumeric, uppercase
  const pattern = /^[A-Z0-9]{8}$/;
  return pattern.test(code);
}

/**
 * Handle deep link with fallback
 */
export function handleDeepLinkWithFallback(
  url: string,
  handlers: {
    onValid: (link: DeepLink) => void;
    onInvalid: (error: string) => void;
    onUnsupported: (path: string) => void;
  }
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

  const navParams = deepLinkToNavigationParams(result.link);

  if (!navParams) {
    handlers.onUnsupported(result.link.path);
    return;
  }

  handlers.onValid(result.link);
}

// Re-export from notification-routing for convenience
export { deepLinkToNotificationAction } from './notification-routing';
