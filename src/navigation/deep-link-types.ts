import { z } from 'zod';

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
  | 'shop'
  | 'rescue';

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

export const VALID_DEEP_LINK_PATHS: DeepLinkPath[] = [
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
  'rescue',
];

export interface DeepLinkHandlers {
  onValid: (link: DeepLink) => void;
  onInvalid: (error: string) => void;
  onUnsupported: (path: string) => void;
}
