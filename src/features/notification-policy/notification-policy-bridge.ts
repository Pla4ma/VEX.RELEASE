import { decideNudge } from "./service";
import type { NudgeDecision, NudgePolicyInput } from "./schemas";
import { getSentToday } from "./hooks";
import type { Lane } from "../lane-engine/types";

export interface BridgeInput {
  userId: string;
  lane: Lane;
  completedSessions: number;
  daysSinceOnboarding: number;
  quietHoursActive: boolean;
  userMuted: boolean;
  context:
    | "none"
    | "avoidance"
    | "deadline"
    | "project_stale"
    | "run_open"
    | "weekly_ready";
  sentToday?: number;
}

export interface BridgeResult {
  blocked: boolean;
  reason: string;
  budgetRemaining: number;
  maxDaily: number;
  decision: NudgeDecision;
}

export function checkNotificationBudget(input: BridgeInput): BridgeResult {
  const sentToday = input.sentToday ?? getSentToday(input.userId);
  // Zod parse boundary — NudgePolicyInputSchema.parse() validates at runtime
  const policyInput = {
    lane: input.lane,
    completedSessions: input.completedSessions,
    daysSinceOnboarding: input.daysSinceOnboarding,
    sentToday,
    recentDismissals: 0,
    quietHoursActive: input.quietHoursActive,
    userMuted: input.userMuted,
    now: Date.now(),
    context: input.context,
  } as NudgePolicyInput;

  const decision = decideNudge(policyInput);
  const maxDaily = input.lane === "minimal_normal" ? 1 : 2;

  return {
    blocked: !decision.allowed,
    reason: decision.reason,
    budgetRemaining: decision.budgetRemaining,
    maxDaily,
    decision,
  };
}
