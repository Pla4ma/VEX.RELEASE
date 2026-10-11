import type { RewardTrigger } from './schemas';
import {
  createReward as createLedgerReward,
  deliverReward,
} from '../reward-ledger/service';
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
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error('Reward amount must be a positive integer');
  }

  const sourceEvent = input.triggerType ?? input.trigger ?? 'SESSION_COMPLETE';
  const triggerId = input.triggerId == null ? 'none' : String(input.triggerId);
  const idempotencyKey =
    input.idempotencyKey ??
    `reward:${input.userId}:${input.type}:${sourceEvent}:${triggerId}`;
  const record = await createLedgerReward({
    amount: input.amount,
    currency: 'XP',
    idempotencyKey,
    rewardType: input.type,
    sourceEvent,
    userId: input.userId,
  });
  return { id: record.id };
}

export async function claimReward(ledgerId: string): Promise<void> {
  if (!ledgerId) {
    throw new Error('Reward ledger id is required');
  }
  await deliverReward(ledgerId);
}
