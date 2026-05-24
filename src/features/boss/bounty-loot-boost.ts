import { z } from 'zod';

import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';

const BOUNTY_LOOT_BOOST_TTL_MS = 60 * 60 * 1000;

const BountyLootBoostSchema = z.object({
  userId: z.string(),
  sessionId: z.string().uuid(),
  encounterId: z.string().uuid(),
  lootMultiplier: z.number().min(1).max(8),
  consumedCount: z.number().int().min(1).max(4),
  createdAt: z.number(),
  expiresAt: z.number(),
}).strict();

export type BountyLootBoost = z.infer<typeof BountyLootBoostSchema>;

const keyForBoost = (userId: string, sessionId: string): string =>
  `boss_bounty_loot_boost:${userId}:${sessionId}`;

export function recordBountyLootBoost(input: {
  userId: string;
  sessionId: string;
  encounterId: string;
  lootMultiplier: number;
  consumedCount: number;
}): BountyLootBoost {
  const now = Date.now();
  const boost = BountyLootBoostSchema.parse({
    ...input,
    lootMultiplier: Math.max(1, Math.min(8, input.lootMultiplier)),
    createdAt: now,
    expiresAt: now + BOUNTY_LOOT_BOOST_TTL_MS,
  });

  getDefaultStorageAdapter().setJSONSync(keyForBoost(boost.userId, boost.sessionId), boost);
  return boost;
}

export function consumeBountyLootBoost(input: {
  userId: string;
  sessionId: string;
}): BountyLootBoost | null {
  const storage = getDefaultStorageAdapter();
  const key = keyForBoost(input.userId, input.sessionId);
  const stored = storage.getJSONSync<unknown>(key);
  storage.removeItemSync(key);

  const parsed = BountyLootBoostSchema.safeParse(stored);
  if (!parsed.success || parsed.data.expiresAt <= Date.now()) {
    return null;
  }

  return parsed.data;
}
