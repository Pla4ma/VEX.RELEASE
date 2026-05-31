import type { RewardTrigger } from './schemas';

const BASE_XP = 50;
const MULTIPLIER_PER_MINUTE = 1.5;

export function calculateXpReward(
  durationMinutes: number = 25,
  trigger: RewardTrigger = 'SESSION_COMPLETE',
  streakMultiplier: number = 1.0,
): number {
  const base = BASE_XP + durationMinutes * MULTIPLIER_PER_MINUTE;
  let total = Math.round(base * streakMultiplier);

  switch (trigger) {
    case 'STREAK':
      total = Math.round(total * 1.5);
      break;
    case 'COMEBACK':
      total = Math.round(total * 2.0);
      break;
    default:
      break;
  }

  return Math.max(10, total);
}

export async function createReward(input: {
  userId: string;
  type: string;
  trigger?: string;
  triggerType?: string;

  triggerId?: unknown;
  idempotencyKey?: string;
  amount: number;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string }> {
  void input;
  return { id: `reward_${input.userId}_${Date.now()}` };
}

export async function claimReward(): Promise<void> {
  return Promise.resolve();
}
