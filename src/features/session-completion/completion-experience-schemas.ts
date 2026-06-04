/**
 * Session Completion Experience Schemas
 * Social/shareable types extracted from completion-experience-types
 */

import type { ShareableCustomization, ShareableTemplate } from './types';

// ─── Social/Shareable Types ──────────────────────────────────────────

export interface ShareableContent {
  type: ShareableType;
  title: string;
  description: string;
  image?: string;
  data: ShareableData;
  platforms: SocialPlatform[];
  template: ShareableTemplate;
  customizations: ShareableCustomization[];
}

export type ShareableType =
  | 'achievement'
  | 'performance'
  | 'milestone'
  | 'streak'
  | 'rank_up'
  | 'unlock'
  | 'completion'
  | 'story';

export interface ShareableData {
  score: number;
  rank: number;
  achievement?: string;
  milestone?: string;
  streak?: number;
  time?: string;
  difficulty?: string;
  highlights: string[];
}

export type SocialPlatform =
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'reddit'
  | 'discord'
  | 'slack'
  | 'whatsapp'
  | 'telegram';
