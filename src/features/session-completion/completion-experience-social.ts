import type { ShareableContent, ShareableType, ShareableData, SocialPlatform } from './completion-experience-schemas';

export type { ShareableContent, ShareableType, ShareableData, SocialPlatform };

export type CompletionSocialShare = {
  body: string;
  title: string;
};

export function buildCompletionSocialShare(): CompletionSocialShare {
  return {
    body: 'Session complete in VEX.',
    title: 'Focus locked in',
  };
}
