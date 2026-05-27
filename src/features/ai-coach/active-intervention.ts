import type { BehaviorProfile, CoachMessage, CoachState } from "./schemas";

export type InterventionType =
  | "BURNOUT"
  | "PLATEAU"
  | "STREAK_RISK"
  | "BOSS_FINISH";

export interface ActiveIntervention {
  id: string;
  type: InterventionType;
  message: string;
  actionLabel: string;
  hoursRemaining?: number;
  metadata: Record<string, unknown>;
}

function getISOWeek(): string {
  const date = new Date();
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return `${date.getFullYear()}-${Math.ceil((dayOffset + start.getDay() + 1) / 7)}`;
}

function getSignalValue(
  profile: BehaviorProfile | null | undefined,
  signalType: string,
): number | null {
  const signal = profile?.signals.find(
    (item) => item.signalType === signalType,
  );
  return signal?.value ?? null;
}

export function buildActiveIntervention(input: {
  userId: string | undefined;
  state: CoachState | null | undefined;
  profile: BehaviorProfile | null | undefined;
  messages: CoachMessage[] | null | undefined;
  sessionMode?: "active_focus" | "active_paused" | "active_risk" | "inactive";
  motivationStyle?:
    | "CALM"
    | "FRIENDLY"
    | "STUDY_FOCUSED"
    | "GAME_LIKE"
    | "COACH_LED"
    | "INTENSE";
}): ActiveIntervention | null {
  const { userId, state, profile, messages } = input;
  if (!userId || !state || !profile) {
    return null;
  }

  if (
    input.sessionMode === "active_focus" &&
    input.motivationStyle === "CALM"
  ) {
    return null;
  }

  if (state.currentState === "STREAK_AT_RISK") {
    const rawHours = getSignalValue(profile, "LAST_SESSION_HOURS");
    const hoursRemaining =
      rawHours === null ? 6 : Math.max(0, Math.round(48 - rawHours));
    return {
      id: `STREAK_RISK:${userId}:${Math.floor(Date.now() / (1000 * 60 * 60))}`,
      type: "STREAK_RISK",
      message:
        hoursRemaining <= 2
          ? `Your streak breaks in ${hoursRemaining}h. Start a 15-min session now.`
          : `Streak at risk. ${hoursRemaining} hours to complete today's session.`,
      actionLabel: "Start 15-min Session",
      hoursRemaining,
      metadata: { suggestedDuration: 15 * 60, suggestedMode: "LIGHT_FOCUS" },
    };
  }

  const sessionsLast24h = getSignalValue(profile, "SESSION_FREQUENCY") ?? 0;
  const avgQuality = getSignalValue(profile, "SESSION_QUALITY_TREND") ?? 100;
  if (
    state.currentState === "OVERLOAD_PROTECTION" ||
    (sessionsLast24h >= 5 && avgQuality < 70)
  ) {
    return {
      id: `BURNOUT:${userId}:${new Date().toDateString()}`,
      type: "BURNOUT",
      message: `You've had ${Math.max(5, sessionsLast24h)} sessions today. A shorter session protects your quality score.`,
      actionLabel: "Start Recovery Session",
      metadata: { suggestedDuration: 15 * 60, suggestedMode: "LIGHT_FOCUS" },
    };
  }

  const bossMessage = messages?.find(
    (message) =>
      message.category === "CHALLENGE_PROMPT" &&
      message.content.toLowerCase().includes("boss"),
  );
  if (bossMessage) {
    return {
      id: `BOSS_FINISH:${userId}:${bossMessage.id}`,
      type: "BOSS_FINISH",
      message: "One focused session can finish the active boss.",
      actionLabel: "Deal the Killing Blow",
      metadata: { suggestedDuration: 45 * 60, suggestedMode: "DEEP_WORK" },
    };
  }

  const xpGrowthDelta = getSignalValue(profile, "CONSISTENCY_SCORE") ?? 0;
  if (state.currentState === "LOW_CONFIDENCE" || xpGrowthDelta < -30) {
    return {
      id: `PLATEAU:${userId}:${getISOWeek()}`,
      type: "PLATEAU",
      message:
        "Your XP growth slowed this week. A longer session today breaks the plateau.",
      actionLabel: "Try a Longer Session",
      metadata: { suggestedDuration: 45 * 60 },
    };
  }

  return null;
}
