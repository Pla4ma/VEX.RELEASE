import {
  SessionCompletionHeroSchema,
  SessionCompletionNavigationParamsSchema,
  SessionCompletionReturnPlanSchema,
  type SessionCompletionHero,
  type SessionCompletionNavigationParams,
  type SessionCompletionReturnPlan,
} from "./schemas";
import { z } from "zod";
import { type SessionStudyContext } from "./study-context";

export {
  buildCompletionLedger,
  type BuildCompletionLedgerInput,
} from "./ledger-service";
export { calculateSessionGrade } from "./grading-service";
export {
  buildSessionSummaryFromCompletionLedger,
  recoverSessionCompletionParams,
} from "./recovery-service";
export { buildPostSessionNextAction } from "./post-session-next-action";
export {
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
} from "./completion-personalization";
export type {
  SessionGradingInput,
  SessionGradingResult,
} from "./grading-schemas";

const RecoverableSessionRouteSchema = z
  .object({ sessionId: z.string().uuid() })
  .passthrough();

export function parseSessionCompletionParams(input: unknown): {
  params: SessionCompletionNavigationParams | null;
  recoverySessionId: string | null;
  warningMessage: string | null;
} {
  const result = SessionCompletionNavigationParamsSchema.safeParse(input);
  if (result.success) {
    return {
      params: result.data,
      recoverySessionId: null,
      warningMessage: null,
    };
  }
  const recoverable = RecoverableSessionRouteSchema.safeParse(input);

  return {
    params: null,
    recoverySessionId: recoverable.success ? recoverable.data.sessionId : null,
    warningMessage: recoverable.success
      ? "We could not read the finished session summary, so VEX is trying to rebuild it from your saved completion record."
      : "We could not restore the finished session summary, so we sent you back to a safe exit.",
  };
}

export function buildSessionCompletionHero(input: {
  focusedDurationLabel: string;
  interruptions: number;
  streakIncreased: boolean;
}): SessionCompletionHero {
  const { focusedDurationLabel, interruptions, streakIncreased } = input;
  const title =
    interruptions === 0
      ? "Clean finish. VEX noted what kept you in flow."
      : streakIncreased
        ? "Streak protected. VEX saved your pattern from this block."
        : "Session complete. VEX is processing what it learned.";

  return SessionCompletionHeroSchema.parse({
    body: focusedDurationLabel,
    eyebrow: "Session Complete",
    title,
  });
}

/**
 * Mode-specific return hooks — what to say at the end of each session
 * so the user knows why tomorrow will be easier.
 */
export function getModeReturnHook(
  mode?: "student" | "game_like" | "deep_creative" | "minimal_normal",
): string | undefined {
  if (!mode) return undefined;

  const hooks: Record<
    "student" | "game_like" | "deep_creative" | "minimal_normal",
    string
  > = {
    student:
      "Your review queue updated. Tomorrow's study block already knows what to cover.",
    game_like:
      "Your momentum data saved. Tomorrow's clean start builds on today's run.",
    deep_creative:
      "Your handoff note is the next move. Tomorrow picks up exactly here.",
    minimal_normal:
      "One clean block banked. Tomorrow starts with the same simplicity.",
  };

  return hooks[mode];
}

export function buildSessionCompletionReturnPlan(input: {
  completionPercentage: number;
  hasStudyFollowUp: boolean;
  mode?: "student" | "game_like" | "deep_creative" | "minimal_normal";
  streakDays: number;
  streakIncreased: boolean;
  studyContext?: SessionStudyContext;
}): SessionCompletionReturnPlan {
  const {
    completionPercentage,
    hasStudyFollowUp,
    mode,
    streakDays,
    streakIncreased,
  } = input;

  const studyLabel = input.studyContext?.learningExecutionLabel ?? "plan";
  const modeReturnHook = getModeReturnHook(mode);

  if (streakIncreased) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage:
        "Home is primed with tomorrow's anchor so this win turns into a return plan.",
      highlightTitle: `${streakDays}-day streak secured`,
      highlightTone: "celebration",
      homeCtaLabel: "See tomorrow plan",
      modeReturnHook,
      nextSessionLabel: "Bank another block",
      returnReasonBody:
        "Go home to see what this session unlocked and the simplest reason to return tomorrow.",
      returnReasonTitle: "Tomorrow already has a clear anchor",
    });
  }

  if (hasStudyFollowUp) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage: `Home will bring your active ${studyLabel} back to the front so this session keeps compounding.`,
      highlightTitle: "Plan momentum saved",
      highlightTone: "info",
      homeCtaLabel: "Continue on home",
      modeReturnHook,
      nextSessionLabel: "Start another session",
      returnReasonBody:
        "Return home and keep moving through the plan while the context is still fresh.",
      returnReasonTitle: "Your follow-up is already queued",
    });
  }

  if (completionPercentage >= 100) {
    return SessionCompletionReturnPlanSchema.parse({
      highlightMessage:
        "Home will show how this win changed today and what the next useful move is.",
      highlightTitle: "Session banked cleanly",
      highlightTone: "celebration",
      homeCtaLabel: "See next move",
      modeReturnHook,
      nextSessionLabel: "Bank another block",
      returnReasonBody:
        "Return home for the next best action and the progress signal from this finish.",
      returnReasonTitle: "This finish now points to the next one",
    });
  }

  return SessionCompletionReturnPlanSchema.parse({
    highlightMessage:
      "Home will help you turn this partial win into a cleaner follow-up session.",
    highlightTitle: "Progress locked in",
    highlightTone: "info",
    homeCtaLabel: "Plan the next move",
    modeReturnHook,
    nextSessionLabel: "Start a recovery session",
    returnReasonBody:
      "Go home and take the next easiest session while the context is still warm.",
    returnReasonTitle: "The loop stays alive with one more clean rep",
  });
}
