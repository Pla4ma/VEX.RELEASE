import { z } from "zod";
import type {
  CoachMemoryConfidence,
  CoachPresenceMotivationStyle,
} from "./schemas";

const LatestSessionSchema = z
  .object({
    durationMinutes: z.number().int().min(0),
    focusPurityScore: z.number().min(0).max(100),
    mode: z.string().min(1),
    isComeback: z.boolean(),
  })
  .strict();

const CoachPresenceContextSchema = z
  .object({
    motivationStyle: z.enum([
      "CALM",
      "FRIENDLY",
      "STUDY_FOCUSED",
      "GAME_LIKE",
      "COACH_LED",
      "INTENSE",
    ]),
    primaryGoal: z.enum([
      "focus",
      "study",
      "work",
      "creative",
      "personal",
      "learning",
    ]),
    firstWeekStage: z.string().min(1).nullable(),
    latestSession: LatestSessionSchema.nullable(),
    memoryConfidence: z.enum(["none", "weak", "medium", "strong"]),
    sessionMode: z.enum([
      "inactive",
      "active_focus",
      "active_paused",
      "active_risk",
      "completed",
    ]),
    comebackState: z
      .enum([
        "none",
        "missed_1_day",
        "missed_2_3_days",
        "missed_week",
        "returning_after_long_gap",
      ])
      .nullable(),
    studyLayerLabel: z.string().min(1).nullable(),
    bossIntensity: z
      .enum([
        "hidden",
        "subtle",
        "tiny_tease",
        "visible",
        "standard",
        "game-like",
        "intense",
      ])
      .nullable(),
    completionContext: z
      .enum([
        "first_session",
        "comeback",
        "streak_recovery",
        "high_focus",
        "low_energy",
        "study",
        "short",
        "long",
        "normal",
      ])
      .nullable(),
    premiumMoment: z
      .enum([
        "none",
        "soft_tease",
        "weekly_value",
        "hidden",
        "session_value",
        "advanced_study",
        "weekly_intelligence",
        "custom_identity",
      ])
      .nullable(),
    aiAvailable: z.boolean(),
  })
  .strict();

const CoachPresenceMessageOutputSchema = z
  .object({
    message: z.string().min(1).max(96),
    tone: z.enum(["calm", "warm", "direct", "playful", "sharp", "studious"]),
    visualMood: z.enum([
      "steady",
      "focused",
      "celebrating",
      "recovering",
      "ready",
    ]),
    safeIntent: z.enum([
      "START_SESSION",
      "START_STUDY_SESSION",
      "REVIEW_PROGRESS",
      "TAKE_BREAK",
      "CONTINUE_PLAN",
      "REFLECT",
    ]),
    optionalActionLabel: z.string().min(1).max(32).nullable(),
    shouldShow: z.boolean(),
    displayMode: z.enum([
      "quiet",
      "welcome",
      "reflection",
      "pattern",
      "intervention",
    ]),
  })
  .strict();

export type CoachPresenceContext = z.infer<typeof CoachPresenceContextSchema>;
export type CoachPresenceMessageOutput = z.infer<
  typeof CoachPresenceMessageOutputSchema
>;

const TONE_MAP: Record<
  CoachPresenceMotivationStyle,
  CoachPresenceMessageOutput["tone"]
> = {
  CALM: "calm",
  FRIENDLY: "warm",
  COACH_LED: "direct",
  GAME_LIKE: "playful",
  INTENSE: "sharp",
  STUDY_FOCUSED: "studious",
};

const MOOD_MAP: Record<
  CoachPresenceMotivationStyle,
  CoachPresenceMessageOutput["visualMood"]
> = {
  CALM: "steady",
  FRIENDLY: "focused",
  COACH_LED: "ready",
  GAME_LIKE: "celebrating",
  INTENSE: "ready",
  STUDY_FOCUSED: "steady",
};

function styleMessage(
  style: CoachPresenceMotivationStyle,
  messages: Record<CoachPresenceMotivationStyle, string>,
): string {
  return messages[style];
}

function resolveIntent(
  ctx: CoachPresenceContext,
): CoachPresenceMessageOutput["safeIntent"] {
  if (ctx.completionContext === "low_energy") return "TAKE_BREAK";
  if (ctx.primaryGoal === "study" || ctx.primaryGoal === "learning")
    return "START_STUDY_SESSION";
  return "START_SESSION";
}

function resolveActionLabel(ctx: CoachPresenceContext): string | null {
  if (ctx.completionContext === "low_energy") return "Take a break";
  if (ctx.comebackState && ctx.comebackState !== "none") return "Start small";
  if (ctx.primaryGoal === "study" || ctx.primaryGoal === "learning")
    return "Next study block";
  return "Start focus";
}

function getDisplayMode(
  ctx: CoachPresenceContext,
): CoachPresenceMessageOutput["displayMode"] {
  if (ctx.sessionMode === "active_focus" && ctx.motivationStyle === "CALM")
    return "quiet";
  if (ctx.sessionMode === "active_paused" || ctx.sessionMode === "active_risk")
    return "intervention";
  if (ctx.memoryConfidence === "none") return "welcome";
  if (ctx.memoryConfidence === "weak") return "reflection";
  return "pattern";
}

function getConfidence(sessionCount: number): CoachMemoryConfidence {
  if (sessionCount <= 0) return "none";
  if (sessionCount < 3) return "weak";
  if (sessionCount < 5) return "medium";
  return "strong";
}

export function getCoachMemoryConfidence(
  sessionCount: number,
  syncAvailable: boolean,
): CoachMemoryConfidence {
  if (!syncAvailable) return "none";
  return getConfidence(sessionCount);
}

function buildDayZeroMessage(ctx: CoachPresenceContext): string {
  if (!ctx.aiAvailable)
    return "Coach memory is offline. Start one clean block.";
  return styleMessage(ctx.motivationStyle, {
    CALM: "Welcome. Start one clean block; I will learn from real sessions.",
    COACH_LED: "Start the first block. I will coach from real proof after.",
    FRIENDLY:
      "Welcome in. Finish one block and I will shape the next step from it.",
    GAME_LIKE: "First mission: finish one block. Memory starts after that.",
    INTENSE: "No history yet. Prove the first block.",
    STUDY_FOCUSED:
      "Start one review-ready block. Study memory begins after it.",
  });
}

function buildSessionMessage(ctx: CoachPresenceContext): string | null {
  if (!ctx.latestSession || ctx.memoryConfidence === "none") return null;
  if (
    ctx.latestSession.isComeback ||
    (ctx.comebackState && ctx.comebackState !== "none")
  ) {
    return `Your last session was a ${ctx.latestSession.durationMinutes}-min return. Keep the next block small.`;
  }
  if (ctx.latestSession.mode === "STUDY") {
    return `Your last session was ${ctx.latestSession.durationMinutes} min of study. Review next.`;
  }
  return `Your last session was ${ctx.latestSession.durationMinutes} min at ${Math.round(ctx.latestSession.focusPurityScore)} focus.`;
}

function buildPatternMessage(ctx: CoachPresenceContext): string | null {
  if (ctx.memoryConfidence === "none" || ctx.memoryConfidence === "weak")
    return null;
  if (ctx.memoryConfidence === "medium") {
    return ctx.primaryGoal === "study"
      ? "Your study sessions show a rhythm forming. Review before adding more."
      : "Your session pattern is emerging. Repeat the clean opening.";
  }
  return styleMessage(ctx.motivationStyle, {
    CALM: "You usually restart best from one quiet block.",
    COACH_LED: "You usually move after a clear target. Start there.",
    FRIENDLY: "You usually build momentum from one simple next step.",
    GAME_LIKE: "You usually bank the run by taking the next small mission.",
    INTENSE: "You usually respond to a clear target. Take it.",
    STUDY_FOCUSED: "You usually hold study better when review comes first.",
  });
}

function buildActiveMessage(ctx: CoachPresenceContext): string | null {
  if (ctx.sessionMode === "active_focus" && ctx.motivationStyle === "CALM")
    return null;
  if (ctx.sessionMode === "active_paused")
    return "Session paused. Resume when ready.";
  if (ctx.sessionMode === "active_risk")
    return ctx.motivationStyle === "INTENSE"
      ? "Distraction. Recover the block now."
      : "Interruption noticed. Return with one clean breath.";
  return null;
}

function buildMessage(ctx: CoachPresenceContext): string {
  const active = buildActiveMessage(ctx);
  if (active) return active;
  if (ctx.completionContext === "first_session")
    return "First session is real now. Choose the next block.";
  if (ctx.completionContext === "comeback")
    return "That return counted. Keep the next block small.";
  if (ctx.completionContext === "low_energy")
    return "Low-energy day, still banked. Recover with care.";
  if (ctx.comebackState && ctx.comebackState !== "none") {
    return "You are not behind. Start with one clean session.";
  }
  if (ctx.memoryConfidence === "none") return buildDayZeroMessage(ctx);
  if (
    ctx.premiumMoment &&
    ctx.premiumMoment !== "none" &&
    ctx.premiumMoment !== "hidden" &&
    ctx.memoryConfidence === "strong"
  ) {
    return "Your rhythm is real now. VEX Pro can go deeper with it.";
  }
  return (
    buildPatternMessage(ctx) ??
    buildSessionMessage(ctx) ??
    buildDayZeroMessage(ctx)
  );
}

export function getCoachPresenceMessage(
  rawContext: unknown,
): CoachPresenceMessageOutput {
  const ctx = CoachPresenceContextSchema.parse(rawContext);
  const displayMode = getDisplayMode(ctx);
  return CoachPresenceMessageOutputSchema.parse({
    message: buildMessage(ctx),
    tone: TONE_MAP[ctx.motivationStyle],
    visualMood: MOOD_MAP[ctx.motivationStyle],
    safeIntent: resolveIntent(ctx),
    optionalActionLabel: resolveActionLabel(ctx),
    shouldShow: displayMode !== "quiet",
    displayMode,
  });
}
