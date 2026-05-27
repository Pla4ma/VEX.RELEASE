import type { FeatureKey } from "../../../features/liveops-config";
import type { SessionHistoryEntry } from "../../../session/types";
import type { HomeReturnReason } from "./useHomeReturnReason";

export function getFocusedMinutesForToday(entry: SessionHistoryEntry): number {
  const endedAt = entry.endedAt ?? 0;
  if (new Date(endedAt).toDateString() !== new Date().toDateString()) {
    return 0;
  }

  const duration =
    entry.summary?.effectiveDuration ?? entry.summary?.actualDuration ?? 0;
  return Math.max(0, Math.round(duration / 60000));
}

export function getNextUnlockFeature(
  features: Record<
    FeatureKey,
    { isUnlocked: boolean; isVisible: boolean; priority?: number }
  >,
): FeatureKey | null {
  const match = (
    Object.entries(features) as Array<
      [FeatureKey, (typeof features)[FeatureKey]]
    >
  )
    .sort((a, b) => (a[1].priority ?? 0) - (b[1].priority ?? 0))
    .find(([, value]) => !value.isUnlocked && value.isVisible);

  return match?.[0] ?? null;
}

export function buildDisplayedReturnReason(
  displayState: {
    body: string;
    eyebrow: string;
    source: HomeReturnReason["source"];
    title: string;
    tone: HomeReturnReason["tone"];
  },
  returnReason: HomeReturnReason,
): HomeReturnReason {
  return {
    ...returnReason,
    body: displayState.body,
    eyebrow: displayState.eyebrow,
    source: displayState.source,
    title: displayState.title,
    tone: displayState.tone,
  };
}

export {
  buildCompletionHeadline,
  buildEmotionalReturnReason,
  buildSessionStakesReason,
  type EmotionalContext,
} from "./home-emotional-helpers";
