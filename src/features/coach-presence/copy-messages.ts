import type { CoachPresenceMotivationStyle } from "./schemas";
import type { CoachPresenceContext } from "./copy-schemas";

function styleMessage(
  style: CoachPresenceMotivationStyle,
  messages: Record<CoachPresenceMotivationStyle, string>,
): string {
  return messages[style];
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

export function buildMessage(ctx: CoachPresenceContext): string {
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
    return "VEX is starting to see your rhythm. Premium keeps deeper history and sharper weekly intelligence.";
  }
  if (
    ctx.premiumMoment &&
    ctx.premiumMoment !== "none" &&
    ctx.premiumMoment !== "hidden" &&
    (ctx.memoryConfidence === "weak" || ctx.memoryConfidence === "medium")
  ) {
    return "Premium unlocks deeper history when VEX has enough signals.";
  }
  return (
    buildPatternMessage(ctx) ??
    buildSessionMessage(ctx) ??
    buildDayZeroMessage(ctx)
  );
}
