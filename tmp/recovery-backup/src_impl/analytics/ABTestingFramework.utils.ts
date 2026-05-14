import { type Experiment } from './ABTestingFramework.types';

export function isUserEligible(experiment: Experiment, profile: { sessions: number; isPremium: boolean; platform: string; segment: string }): boolean {
  const { targeting } = experiment;

  if (targeting.minSessions && profile.sessions < targeting.minSessions) {
    return false;
  }
  if (targeting.maxSessions && profile.sessions > targeting.maxSessions) {
    return false;
  }

  if (targeting.premiumStatus === 'free' && profile.isPremium) {
    return false;
  }
  if (targeting.premiumStatus === 'premium' && !profile.isPremium) {
    return false;
  }

  if (targeting.platforms && !targeting.platforms.includes(profile.platform as any)) {
    return false;
  }

  if (targeting.userSegments && !targeting.userSegments.includes(profile.segment)) {
    return false;
  }

  return true;
}

export function selectVariant(allocation: Record<string, number>): string | null {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const [variantId, percentage] of Object.entries(allocation)) {
    cumulative += percentage;
    if (random <= cumulative) {
      return variantId;
    }
  }

  return null;
}
