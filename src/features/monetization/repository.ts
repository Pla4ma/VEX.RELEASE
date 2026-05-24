import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { StreakShieldRecordSchema } from './schemas';
import type { StreakShieldRecord } from './types';

const storage = new MMKVStorageAdapter('phase-7-monetization');

function keyForUser(userId: string): string {
  return `streak-shield:${userId}`;
}

export class MonetizationRepositoryError extends Error {
  constructor(operation: string, cause: unknown) {
    super(`Monetization repository failed during ${operation}`);
    this.name = 'MonetizationRepositoryError';
    this.cause = cause;
  }
}

export async function getStreakShieldRecord(
  userId: string,
): Promise<StreakShieldRecord | null> {
  try {
    const raw = await storage.getItem(keyForUser(userId));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return StreakShieldRecordSchema.parse(parsed);
  } catch (error) {
    throw new MonetizationRepositoryError('getStreakShieldRecord', error);
  }
}

export async function saveStreakShieldRecord(
  userId: string,
  record: StreakShieldRecord,
): Promise<void> {
  try {
    const parsed = StreakShieldRecordSchema.parse(record);
    await storage.setItem(keyForUser(userId), JSON.stringify(parsed));
  } catch (error) {
    throw new MonetizationRepositoryError('saveStreakShieldRecord', error);
  }
}
