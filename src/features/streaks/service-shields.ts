import { UseShieldInputSchema, FreezeStreakInputSchema, RestoreStreakInputSchema, type Streak, type UseShieldInput, type RestoreStreakInput } from "./schemas";
import * as repository from "./repository";

async function getOrCreateStreak(userId: string): Promise<Streak> {
  let streak = await repository.fetchStreak(userId);
  if (!streak) {
    streak = await repository.createStreak(userId);
  }
  return streak;
}

export async function applyShieldInternal(
  userId: string,
  streak: Streak,
): Promise<void> {
  const shieldId = await repository.getAvailableShield(userId);
  if (shieldId) {
    await repository.recordShieldUsed(userId, shieldId);
    await repository.updateStreak(userId, {
      shieldsAvailable: streak.shieldsAvailable - 1,
      gracePeriodUsed: true,
    });
  }
}

export async function useShield(input: UseShieldInput): Promise<boolean> {
  const validated = UseShieldInputSchema.parse(input);
  const streak = await getOrCreateStreak(validated.userId);
  if (streak.shieldsAvailable <= 0) {
    return false;
  }
  await applyShieldInternal(validated.userId, streak);
  return true;
}

export async function freezeStreak(userId: string): Promise<void> {
  const validated = FreezeStreakInputSchema.parse({
    userId,
    durationHours: 24,
  });
  const streak = await getOrCreateStreak(validated.userId);
  const frozenUntil = Date.now() + validated.durationHours * 60 * 60 * 1000;
  await repository.updateStreak(validated.userId, {
    currentDays: streak.currentDays,
    longestDays: streak.longestDays,
    lastQualifyingSessionAt: streak.lastQualifyingSessionAt,
    currentDayCompletedAt: streak.currentDayCompletedAt,
    frozenUntil,
    shieldsAvailable: streak.shieldsAvailable,
    gracePeriodUsed: true,
  });
}

export async function restoreStreak(
  input: RestoreStreakInput,
): Promise<boolean>;
export async function restoreStreak(
  userId: string,
  targetDays: number,
): Promise<boolean>;
export async function restoreStreak(
  inputOrUserId: RestoreStreakInput | string,
  targetDays?: number,
): Promise<boolean> {
  const validated =
    typeof inputOrUserId === "string"
      ? RestoreStreakInputSchema.parse({
          userId: inputOrUserId,
          targetDays,
          source: "SPECIAL_EVENT",
        })
      : RestoreStreakInputSchema.parse(inputOrUserId);
  const streak = await getOrCreateStreak(validated.userId);
  if (validated.targetDays > streak.longestDays) {
    return false;
  }
  await repository.updateStreak(validated.userId, {
    currentDays: validated.targetDays,
    lastQualifyingSessionAt: Date.now(),
  });
  return true;
}
