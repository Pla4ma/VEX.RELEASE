import { createReward } from '../features/rewards/service';
import type { RewardTrigger, RewardType } from '../features/rewards/schemas';

type GrantOptions = {
  bonusType?: string;
  challengeId?: string;
  exactAmount?: number;
  idempotencyKey?: string;
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
    type: RewardType,
    triggerType: RewardTrigger | 'COMEBACK_BONUS',
    calculation: GrantCalculation,
    options?: GrantOptions,
  ) => Promise<void>;
  setUserId: (nextUserId: string) => void;
};

function normalizeTrigger(
  triggerType: RewardTrigger | 'COMEBACK_BONUS',
): RewardTrigger {
  if (triggerType === 'COMEBACK_BONUS') {
    return 'COMEBACK';
  }
  return triggerType;
}

export function getRewardService(userId?: string): RewardService {
  let activeUserId = userId;
  return {
    setUserId(nextUserId): void {
      activeUserId = nextUserId;
    },
    async grantReward(type, triggerType, calculation, options): Promise<void> {
      if (!activeUserId || type !== 'XP') {
        return;
      }
      await createReward({
        userId: activeUserId,
        type,
        triggerType: normalizeTrigger(triggerType),
        triggerId: options?.sessionId ?? options?.challengeId,
        idempotencyKey: options?.idempotencyKey,
        amount:
          options?.exactAmount ??
          Math.max(0, Math.floor(calculation.baseAmount)),
      });
    },
  };
}
