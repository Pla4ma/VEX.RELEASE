import type { AdaptationResult } from "./session-behavior-signal-schemas";

/**
 * Returns user-facing copy that proves VEX adapted based on real behavior.
 *
 * Rules:
 * - No fake insight — every message cites a real signal
 * - Cite behavior in plain language
 * - Do not overstate certainty — use "VEX noticed", "VEX thinks", not "VEX knows"
 * - One adaptation proof per key moment
 */

export function getAdaptationProof(
  adaptation: AdaptationResult,
): string | null {
  return adaptation.userFacingAdaptation;
}

export function getRescueAdaptationCopy(trigger: string): string | null {
  const map: Record<string, string> = {
    abandoned_session:
      "VEX noticed you didn't finish last time. This one is shorter.",
    opened_app_no_start:
      "You opened the app but didn't start. VEX made this one tiny.",
    repeated_dismissals:
      "You dismissed a few nudges. Here's a smaller option instead.",
    make_it_smaller:
      "A few sessions didn't finish recently. Let's make this one smaller.",
    recovery_pattern:
      "You came back after a rescue before. Another small block might help.",
    notification_dismissal_pattern:
      "VEX noticed you prefer fewer nudges. Here's a quiet option.",
    missed_planned: "Missed your planned session. VEX has a quick alternative.",
    streak_risk: "Your streak might break. A quick session saves it.",
    user_too_big: "That plan feels big. VEX can break it into something smaller.",
  };
  return map[trigger] ?? null;
}

export function getCompletionAdaptationCopy(
  adaptation: AdaptationResult,
): string {
  if (!adaptation.userFacingAdaptation) {
    return "VEX is still learning from your sessions. Each one helps.";
  }
  return adaptation.userFacingAdaptation;
}

export function getSetupAdaptationCopy(
  adaptation: AdaptationResult,
): string | null {
  if (adaptation.shouldReduceFriction) {
    return "VEX skipped a few setup steps based on how you've been working.";
  }
  if (adaptation.shouldSuggestShorterSessions && adaptation.shorterSessionReason) {
    return adaptation.shorterSessionReason;
  }
  return null;
}

export function getWeeklyAdaptationCopy(
  adaptation: AdaptationResult,
): string | null {
  if (adaptation.shouldSuggestShorterSessions) {
    return "Your session durations this week suggest shorter blocks work better for you.";
  }
  if (adaptation.shouldReduceGameLanguage) {
    return "You switched to a quieter mode this week. VEX adjusted the tone accordingly.";
  }
  if (adaptation.modeChangeDetected && adaptation.fromMode && adaptation.toMode) {
    return `You moved from ${adaptation.fromMode} to ${adaptation.toMode} this week. VEX adjusted your surfaces.`;
  }
  return null;
}

export function getHomeNextActionAdaptationCopy(
  adaptation: AdaptationResult,
): string | null {
  if (adaptation.shouldUseHandoffForNextSession && adaptation.handoffLabel) {
    return `Pick up where you left off: "${adaptation.handoffLabel}"`;
  }
  if (adaptation.shouldSuggestStudyReview && adaptation.studyReviewTarget) {
    return `Review "${adaptation.studyReviewTarget}" — your last study target`;
  }
  if (adaptation.shouldShowRescue && adaptation.rescueReason) {
    return "VEX noticed a pattern and adjusted this session.";
  }
  return null;
}

export function getNotificationAdaptationCopy(
  adaptation: AdaptationResult,
): string | null {
  if (adaptation.shouldQuietEveningNudges) {
    return "VEX noticed you prefer fewer evening nudges and adjusted accordingly.";
  }
  return null;
}
