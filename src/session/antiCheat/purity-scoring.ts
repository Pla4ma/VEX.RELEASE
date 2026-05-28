import type {
  PurityLabel,
  SeverityLevel,
  EngineStatus,
  ActionResult,
} from "./anti-cheat-types";
import type { AntiCheatFlag } from "../types";
import {
  PURITY_SCORING,
  FLAG_CRITICAL_THRESHOLD,
} from "./AntiCheatConfig";

export function calculatePurityScore(
  backgroundSwitches: number,
  manualPauses: number,
  suspendedCount: number,
  uninterruptedFocusAccumulatedMs: number,
  uninterruptedFocusStartedAt: number | null,
): number {
  const uninterruptedFocusMs =
    uninterruptedFocusAccumulatedMs +
    (uninterruptedFocusStartedAt
      ? Math.max(0, Date.now() - uninterruptedFocusStartedAt)
      : 0);
  const uninterruptedBonus =
    Math.floor(uninterruptedFocusMs / 60000) *
    PURITY_SCORING.UNINTERRUPTED_BONUS_PER_MINUTE;
  const score =
    PURITY_SCORING.MAX_SCORE -
    backgroundSwitches * PURITY_SCORING.BACKGROUND_SWITCH_PENALTY -
    manualPauses * PURITY_SCORING.MANUAL_PAUSE_PENALTY -
    (suspendedCount > 0 ? PURITY_SCORING.SUSPENSION_PENALTY : 0) +
    uninterruptedBonus;
  return Math.max(
    PURITY_SCORING.MIN_SCORE,
    Math.min(PURITY_SCORING.MAX_SCORE, score),
  );
}

export function getPurityLabel(score: number): PurityLabel {
  if (score >= PURITY_SCORING.ELITE_THRESHOLD) return "Elite";
  if (score >= PURITY_SCORING.GOOD_THRESHOLD) return "Good";
  if (score >= PURITY_SCORING.OKAY_THRESHOLD) return "Okay";
  return "Distracted";
}

export function getSeverity(flags: AntiCheatFlag[]): SeverityLevel {
  if (flags.length === 0) return "CLEAN";
  if (flags.some((f) => f.severity === "CRITICAL")) return "CRITICAL";
  if (flags.some((f) => f.severity === "MODERATE")) return "MODERATE";
  if (flags.some((f) => f.severity === "WARNING")) return "WARNING";
  return "CLEAN";
}

export function getStatus(
  flags: AntiCheatFlag[],
  severity: SeverityLevel,
): EngineStatus {
  if (severity === "CLEAN") return "CLEAN";
  if (severity === "WARNING") return "WARNING";
  if (severity === "MODERATE") return "FLAGGED";
  return flags.length > FLAG_CRITICAL_THRESHOLD
    ? "INVALIDATED"
    : "FAILED";
}

export function determineAction(status: EngineStatus): ActionResult {
  switch (status) {
    case "FAILED":
      return {
        action: "SESSION_INVALIDATED",
        scoreReduction: 1,
        shouldInvalidate: true,
      };
    case "FLAGGED":
      return {
        action: "SCORE_REDUCED",
        scoreReduction: 0.3,
        shouldInvalidate: false,
      };
    case "WARNING":
      return {
        action: "FLAGGED",
        scoreReduction: 0.05,
        shouldInvalidate: false,
      };
    default:
      return { action: "NONE", scoreReduction: 0, shouldInvalidate: false };
  }
}
