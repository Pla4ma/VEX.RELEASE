import * as repository from "./repository";
import {
  ActivateComebackInputSchema,
  type ComebackPlan,
  type ComebackStatus,
  type ActivateComebackInput,
} from "./schemas";
import { updateCoachState } from "./persona-manager";
import { generateMessage } from "./message-generator";

const COMEBACK_BONUS_MULTIPLIER = 2.0;
const COMEBACK_TARGET_SESSIONS = 3;
const COMEBACK_EXPIRY_DAYS = 7;

export async function activateComeback(
  input: ActivateComebackInput,
): Promise<ComebackPlan> {
  const validated = ActivateComebackInputSchema.parse(input);
  const existing = await repository.fetchActiveComebackPlan(validated.userId);
  if (existing) {
    if (existing.status === "DECLINED") {
      throw new Error("Comeback was previously declined");
    }
    if (existing.status === "ACTIVE") {
      return existing;
    }
  }
  const now = Date.now();
  const plan: ComebackPlan = {
    id: crypto.randomUUID(),
    userId: validated.userId,
    previousStreak: validated.previousStreak,
    daysInactive: validated.daysInactive,
    status: "OFFERED" as ComebackStatus,
    startedAt: now,
    expiresAt: now + COMEBACK_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    sessionsCompleted: 0,
    targetSessions: COMEBACK_TARGET_SESSIONS,
    bonusMultiplier: COMEBACK_BONUS_MULTIPLIER,
    messages: generateComebackMessages(),
  };
  const saved = await repository.upsertComebackPlan(plan);
  await updateCoachState(validated.userId, "COMEBACK_MODE", {
    previousStreak: validated.previousStreak,
    daysInactive: validated.daysInactive,
  });
  return saved;
}

function generateComebackMessages(): Array<{
  id: string;
  day: number;
  content: string;
  sent: boolean;
  sentAt: number | null;
}> {
  const messages = [
    {
      day: 1,
      content:
        "Welcome back! 💪 Your comeback story starts today. First session gets {{bonusMultiplier}}x XP!",
    },
    {
      day: 2,
      content:
        "Day 2 of your comeback! 🔥 You're rebuilding stronger than before. Keep it up!",
    },
    {
      day: 3,
      content:
        "Comeback complete! 🎉 You've earned your full {{bonusMultiplier}}x bonus. Your streak is back on track!",
    },
  ];
  return messages.map((m) => ({
    id: crypto.randomUUID(),
    day: m.day,
    content: m.content,
    sent: false,
    sentAt: null,
  }));
}

export async function acceptComeback(
  userId: string,
  planId: string,
): Promise<ComebackPlan> {
  const plan = await repository.updateComebackPlanStatus(planId, "ACTIVE");
  const firstMessage = plan.messages[0];
  if (firstMessage) {
  }
  return plan;
}

export async function trackComebackSession(
  userId: string,
  sessionCompleted: boolean,
): Promise<ComebackPlan | null> {
  const plan = await repository.fetchActiveComebackPlan(userId);
  if (!plan || plan.status !== "ACTIVE") {
    return null;
  }
  if (sessionCompleted) {
    const newCount = plan.sessionsCompleted + 1;
    if (newCount >= plan.targetSessions) {
      await repository.updateComebackPlanStatus(plan.id, "COMPLETED", newCount);
      await updateCoachState(userId, "HIGH_CONFIDENCE", {
        comebackCompleted: true,
      });
      const completionMessage = await generateMessage({
        userId,
        category: "MILESTONE_HYPE",
        context: {
          milestoneDays: plan.targetSessions,
          comebackMultiplier: plan.bonusMultiplier,
        },
        preferredDelivery: "BOTH",
      });
      if (completionMessage) {
        await repository.createCoachMessage(completionMessage);
      }
    } else {
      await repository.updateComebackPlanStatus(plan.id, "ACTIVE", newCount);
      const nextMessage = plan.messages[newCount];
      if (nextMessage && !nextMessage.sent) {
      }
    }
  }
  return repository.fetchActiveComebackPlan(userId);
}

export { COMEBACK_BONUS_MULTIPLIER, COMEBACK_TARGET_SESSIONS };
