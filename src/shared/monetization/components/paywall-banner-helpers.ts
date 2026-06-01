import { captureSilentFailure } from '../../../utils/silent-failure';
import { MMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';

const RATE_LIMIT_MS = 48 * 60 * 60 * 1000;
const STORAGE_KEY = 'vex_contextual_paywall_last_shown';
const paywallStorage = new MMKVStorageAdapter('contextual-paywall');

export type PaywallTriggerType = 'BOSS_DEFEAT' | 'STREAK_MILESTONE' | 'S_GRADE';

export interface TriggerMessage {
  emoji: string;
  headline: string;
  subtext: string;
}

export function getTriggerMessage(
  trigger: PaywallTriggerType,
  nextBossTier?: number,
  streakDays?: number,
  bonusXp?: number,
): TriggerMessage {
  switch (trigger) {
    case 'BOSS_DEFEAT':
      return {
        emoji: '',
        headline: 'Unlock the next boss tier immediately',
        subtext: `Premium users skip the wait and face Tier ${nextBossTier ?? '++'} bosses right away.`,
      };
    case 'STREAK_MILESTONE':
      return {
        emoji: '',
        headline: 'Protect this streak with Premium',
        subtext: `Streak Insurance covers ${streakDays ?? 'your'} days — one rough day won't erase your progress.`,
      };
    case 'S_GRADE':
      return {
        emoji: '',
        headline: 'Premium users earn 1.1× XP every session',
        subtext: bonusXp
          ? `That session would have earned ${bonusXp} more XP with Premium.`
          : 'Multiply every focus session reward.',
      };
    default:
      return {
        emoji: '',
        headline: 'Unlock Premium features',
        subtext: 'Get the most out of your focus sessions.',
      };
  }
}

export async function canShowBanner(): Promise<boolean> {
  try {
    const lastShown = await paywallStorage.getItem(STORAGE_KEY);
    if (!lastShown) {
      return true;
    }
    const lastTimestamp = parseInt(lastShown, 10);
    const now = Date.now();
    return now - lastTimestamp >= RATE_LIMIT_MS;
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'shared',
      operation: 'ui-fallback',
      type: 'ui',
    });
    return true;
  }
}

export async function recordBannerShown(): Promise<void> {
  try {
    await paywallStorage.setItem(STORAGE_KEY, Date.now().toString());
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'shared',
      operation: 'ui-fallback',
      type: 'ui',
    });
  }
}
