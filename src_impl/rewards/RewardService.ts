import { createReward } from '../features/rewards/service';
import type { RewardTrigger, RewardType } from '../features/rewards/schemas';

type GrantOptions = {
  bonusType?: string;
  challengeId?: string;
  currency?: 'COINS' | 'GEMS';
  exactAmount?: number;
  previousStreak?: number;
  sessionId?: string;
  streakMultiplier?: number;
};

type GrantCalculation = {
  baseAmount: number;
  levelMultiplier?: number;
  streakMultiplier?: number;
};

type RewardService = {
  grantReward: (
    type: RewardType | 'CURRENCY',
    triggerType: RewardTrigger | 'CHALLENGE_COMPLETE' | 'COMEBACK_BONUS',
    calculation: GrantCalculation,
    options?: GrantOptions
  ) => Promise<void>;
  setUserId: (nextUserId: string) => void;
};

function normalizeRewardType(type: RewardType | 'CURRENCY', options?: GrantOptions): RewardType {
  if (type === 'CURRENCY') {
    return options?.currency ?? 'COINS';
  }
  return type;
}

function normalizeTrigger(triggerType: RewardTrigger | 'CHALLENGE_COMPLETE' | 'COMEBACK_BONUS'): RewardTrigger {
  if (triggerType === 'COMEBACK_BONUS') {
    return 'COMEBACK';
  }
  return triggerType === 'CHALLENGE_COMPLETE' ? 'ACHIEVEMENT_UNLOCK' : triggerType;
}

export function getRewardService(userId?: string): RewardService {
  let activeUserId = userId;
  return {
    setUserId(nextUserId): void {
      activeUserId = nextUserId;
    },
    async grantReward(type, triggerType, calculation, options): Promise<void> {
      if (!activeUserId) {
        return;
      }

      await createReward({
        userId: activeUserId,
        type: normalizeRewardType(type, options),
        triggerType: normalizeTrigger(triggerType),
        triggerId: options?.sessionId ?? options?.challengeId,
        amount: options?.exactAmount ?? Math.max(0, Math.floor(calculation.baseAmount)),
      });
    },
  };
}
