import type { BehaviorProfile, CoachState, InterventionRule } from "../../schemas";

export const mockUserId = "user-123";

export function createMockCoachState(
  overrides: Partial<CoachState> = {},
): CoachState {
  return {
    userId: overrides.userId ?? mockUserId,
    currentState: overrides.currentState ?? "COLD_START",
    previousState: overrides.previousState ?? null,
    stateEnteredAt: overrides.stateEnteredAt ?? Date.now(),
    personaId: overrides.personaId ?? "default",
    behaviorProfile: overrides.behaviorProfile ?? null,
    lastInterventionAt: overrides.lastInterventionAt ?? null,
    interventionsToday: overrides.interventionsToday ?? 0,
    muteUntil: overrides.muteUntil ?? null,
    reduceNotifications: overrides.reduceNotifications ?? false,
  };
}

export function createMockBehaviorProfile(
  overrides: Partial<BehaviorProfile> = {},
): BehaviorProfile {
  return {
    userId: overrides.userId ?? mockUserId,
    signals: overrides.signals ?? [],
    lastUpdated: overrides.lastUpdated ?? Date.now(),
    confidenceLevel: overrides.confidenceLevel ?? "LOW",
    coldStart: overrides.coldStart ?? true,
    dataPoints: overrides.dataPoints ?? 0,
  };
}

export function createMockInterventionRule(
  overrides: Partial<InterventionRule> = {},
): InterventionRule {
  return {
    id: overrides.id ?? "rule-1",
    name: overrides.name ?? "Test Rule",
    trigger: overrides.trigger ?? { type: "STREAK_AT_RISK", threshold: 24 },
    conditions: overrides.conditions ?? [],
    action: overrides.action ?? {
      type: "SEND_MESSAGE",
      messageTemplateId: "template-1",
      deliveryMethod: "BOTH",
      delayMinutes: 0,
    },
    priority: overrides.priority ?? 10,
    cooldownHours: overrides.cooldownHours ?? 4,
    maxPerDay: overrides.maxPerDay ?? 3,
    enabled: overrides.enabled ?? true,
  };
}
