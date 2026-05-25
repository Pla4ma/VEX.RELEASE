import { resolveInitialLane } from '../lane-engine/service';
import { FocusProfileInputSchema, FocusProfileSchema, type FocusProfile, type FocusProfileInput } from './schemas';
import { getStoredFocusProfile, upsertStoredFocusProfile } from './repository';

function buildFallback(input: FocusProfileInput): FocusProfile {
  const updatedAt = input.updatedAt ?? Date.now();
  const laneInput = input.primaryGoal
    ? { primaryGoal: input.primaryGoal, observedAt: updatedAt }
    : { observedAt: updatedAt };
  return FocusProfileSchema.parse({
    userId: input.userId,
    laneProfile: input.laneProfile ?? resolveInitialLane(laneInput),
    primaryGoal: input.primaryGoal ?? 'focus',
    preferredSessionDurationMinutes: input.preferredSessionDurationMinutes ?? 25,
    preferredSessionMode: input.preferredSessionMode ?? 'FOCUS',
    bestFocusWindows: [],
    riskWindows: [],
    avoidanceTriggers: [],
    frictionPreference: 'soft',
    notificationPreference: {
      maxPerDay: 1,
      quietHoursStart: 21,
      quietHoursEnd: 8,
      tone: 'quiet',
    },
    memoryConsent: {
      allowBehaviorMemory: true,
      allowImportedContentMemory: false,
      allowSensitiveInference: false,
    },
    updatedAt,
  });
}

export async function createFocusProfile(rawInput: FocusProfileInput): Promise<FocusProfile> {
  const input = FocusProfileInputSchema.parse(rawInput);
  return upsertStoredFocusProfile(buildFallback(input));
}

export async function getFocusProfile(userId: string): Promise<FocusProfile | null> {
  return getStoredFocusProfile(userId);
}

export async function upsertFocusProfile(rawInput: FocusProfileInput): Promise<FocusProfile> {
  const input = FocusProfileInputSchema.parse(rawInput);
  const existing = await getStoredFocusProfile(input.userId);
  if (!existing) return createFocusProfile(input);
  return upsertStoredFocusProfile(FocusProfileSchema.parse({
    ...existing,
    laneProfile: input.laneProfile ?? existing.laneProfile,
    primaryGoal: input.primaryGoal ?? existing.primaryGoal,
    preferredSessionDurationMinutes: input.preferredSessionDurationMinutes ?? existing.preferredSessionDurationMinutes,
    preferredSessionMode: input.preferredSessionMode ?? existing.preferredSessionMode,
    updatedAt: input.updatedAt ?? Date.now(),
  }));
}
