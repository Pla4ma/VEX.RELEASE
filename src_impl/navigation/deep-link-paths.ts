/**
 * Deep Link Paths, Parsing, and URL Generation
 */

import { z } from 'zod';
import { createDebugger } from '../utils/debug';
import * as Sentry from '@sentry/react-native';

const debug = createDebugger('navigation:deep-links');

export type DeepLinkPath =
  | 'session'
  | 'boss'
  | 'squad'
  | 'profile'
  | 'settings'
  | 'invite'
  | 'study'
  | 'coach'
  | 'shop';

export interface DeepLink {
  path: DeepLinkPath;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface ParsedDeepLink {
  valid: boolean;
  link?: DeepLink;
  error?: string;
}

export const DeepLinkUrlSchema = z.object({
  scheme: z.enum(['vex', 'https']),
  host: z.enum(['app.vex.com', 'vex.app', 'localhost', '']),
  path: z.string(),
  queryParams: z.record(z.string()),
});

export function parseDeepLink(url: string): ParsedDeepLink {
  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(':', '');
    const host = parsed.hostname;
    const pathname = parsed.pathname.replace(/^\//, '');
    const searchParams = parsed.searchParams;

    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const validated = DeepLinkUrlSchema.safeParse({
      scheme,
      host,
      path: pathname,
      queryParams,
    });

    if (!validated.success) {
      return { valid: false, error: 'Invalid URL structure' };
    }

    const pathSegments = pathname.split('/').filter(Boolean);
    const path = pathSegments[0] as DeepLinkPath | undefined;

    if (!path || !isValidDeepLinkPath(path)) {
      return { valid: false, error: `Unknown path: ${pathname}` };
    }

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

export function isValidDeepLinkPath(path: string): path is DeepLinkPath {
  const validPaths: DeepLinkPath[] = [
    'session',
    'boss',
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

export function generateDeepLink(
  path: DeepLinkPath,
  params?: Record<string, string>,
): string {
  const baseUrl = 'vex://';
  const paramString = params
    ? Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
    : '';
  return paramString ? `${baseUrl}${path}?${paramString}` : `${baseUrl}${path}`;
}

export function generateInviteLink(squadId: string, code: string): string {
  return `https://vex.app/invite/squad/${squadId}?code=${code}`;
}

export function generateSessionShareLink(sessionId: string): string {
  return `https://vex.app/session/${sessionId}`;
}

export function generateProfileShareLink(userId: string): string {
  return `https://vex.app/profile/${userId}`;
}
