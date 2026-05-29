import type { Lane } from "../lane-engine/types";
import { MODE_RETENTION_MANIFEST } from "./copy";
import { ModeRetentionScoreSchema } from "./schemas";
import type {
  ModeNotificationCopy,
  ModePremiumBridge,
  ModeRescueCopy,
  ModeRetentionManifest,
  ModeRetentionScore,
  ModeReturnHook,
} from "./schemas";

// ── Helpers ────────────────────────────────────────────────────────────

export function normalizeLane(raw: unknown): Lane {
  if (
    raw === "student" ||
    raw === "game_like" ||
    raw === "deep_creative" ||
    raw === "minimal_normal"
  ) {
    return raw;
  }
  return "minimal_normal";
}

// ── Get manifest for a lane ─────────────────────────────────────────────

export function getModeRetentionManifest(lane: Lane): ModeRetentionManifest {
  return MODE_RETENTION_MANIFEST[lane];
}

// ── Get return hook ─────────────────────────────────────────────────────

export function getModeReturnHook(lane: unknown): ModeReturnHook {
  const l = normalizeLane(lane);
  const manifest = MODE_RETENTION_MANIFEST[l];
  return {
    lane: l,
    corePromise: manifest.returnReason,
    day0Headline: MODE_RETENTION_MANIFEST[l].hookCopy,
    day1Headline: manifest.day1Copy,
    day3MemoryHeadline: manifest.day3Memory,
    day7IntelligenceHeadline: manifest.day7Intelligence,
  };
}

export { getModeDayCopy } from "./service-day-copy";

// ── Get rescue copy ─────────────────────────────────────────────────────

export function getModeRescueCopy(lane: unknown): ModeRescueCopy {
  const l = normalizeLane(lane);
  const base = MODE_RETENTION_MANIFEST[l].rescueCopy;
  return { ...base, lane: l };
}

// ── Get notification copy ───────────────────────────────────────────────

export function getModeNotificationCopy(lane: unknown): ModeNotificationCopy {
  const l = normalizeLane(lane);
  const base = MODE_RETENTION_MANIFEST[l].notificationCopy;
  return { ...base, lane: l };
}

// ── Get premium bridge ──────────────────────────────────────────────────

export function getModePremiumBridge(lane: unknown): ModePremiumBridge {
  const l = normalizeLane(lane);
  const base = MODE_RETENTION_MANIFEST[l].premiumBridge;
  return { ...base, lane: l, triggerDay: 7 };
}

// ── Rate mode retention quality ─────────────────────────────────────────

export interface RetentionScoreInput {
  lane: Lane;
  hasNextAction?: boolean;
  hasCompletionContext?: boolean;
  hasMemoryInsight?: boolean;
  hasWeeklyIntelligence?: boolean;
  nudgeCopyIsSpecific?: boolean;
  returnReasonIsModeSpecific?: boolean;
}

export function scoreModeRetention(input: RetentionScoreInput): ModeRetentionScore {
  const manifest = MODE_RETENTION_MANIFEST[input.lane];

  const returnReasonStrength = input.returnReasonIsModeSpecific ? 9 : 4;
  const nextActionClarity = input.hasNextAction ? 9 : 3;
  const completionContextSaved = input.hasCompletionContext ? 8 : 2;
  const memoryRelevance = input.hasMemoryInsight ? 8 : 2;
  const intelligenceValue = input.hasWeeklyIntelligence ? 9 : 3;
  const nudgeSpecificity = input.nudgeCopyIsSpecific ? 9 : 3;

  const total = [
    returnReasonStrength,
    nextActionClarity,
    completionContextSaved,
    memoryRelevance,
    intelligenceValue,
    nudgeSpecificity,
  ].reduce((sum, v) => sum + v, 0);

  return ModeRetentionScoreSchema.parse({
    lane: input.lane,
    returnReasonStrength,
    nextActionClarity,
    completionContextSaved,
    memoryRelevance,
    intelligenceValue,
    nudgeSpecificity,
    totalScore: total,
    summary: `${manifest.returnReason} (${total}/60)`,
  });
}

// ── Score all modes ─────────────────────────────────────────────────────

export function scoreAllModes(inputs: RetentionScoreInput[]): ModeRetentionScore[] {
  return inputs.map((input) => scoreModeRetention(input));
}

// ── Build full audit scores with defaults applied ───────────────────────

export function buildDefaultAuditScores(): ModeRetentionScore[] {
  const lanes: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

  return lanes.map((lane) =>
    scoreModeRetention({
      lane,
      hasNextAction: true,
      hasCompletionContext: true,
      hasMemoryInsight: lane === "minimal_normal" ? false : true,
      hasWeeklyIntelligence: true,
      nudgeCopyIsSpecific: true,
      returnReasonIsModeSpecific: true,
    }),
  );
}
