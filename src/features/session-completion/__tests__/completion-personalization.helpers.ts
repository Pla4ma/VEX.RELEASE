import { SessionMode } from "../../../session/modes";
import {
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
} from "../service";
import { createSessionSummary } from "./ledger-test-utils";
import type { Lane } from "../../lane-engine/types";

export const LANES: Lane[] = [
  "student",
  "game_like",
  "deep_creative",
  "minimal_normal",
];

export const CLEAN_REFLECTIONS: Record<Lane, string> = {
  student: "What made this study block work?",
  game_like: "What kept the run clean?",
  deep_creative: "What should VEX remember for next block?",
  minimal_normal: "Keep same setup next time?",
};

export const PARTIAL_REFLECTIONS: Record<Lane, string> = {
  student: "Was the task too big or unclear?",
  game_like: "What debuff hit this run?",
  deep_creative: "Where did flow break?",
  minimal_normal: "What made this hard?",
};

export const ABANDONED_REFLECTIONS: Record<Lane, string> = {
  student: "What pulled you away first?",
  game_like: "What interrupted the encounter?",
  deep_creative: "What broke the thread?",
  minimal_normal: "What got in the way?",
};

export const UNLOCK_KEYS: Record<Lane, string> = {
  student: "study_os",
  game_like: "run_board",
  deep_creative: "project_thread",
  minimal_normal: "today_strip",
};

export function buildResult(
  lane: Lane,
  overrides: Record<string, unknown> = {},
) {
  return buildCompletionPersonalizationResult({
    deletedMemoryIds: (overrides.deletedMemoryIds as string[]) ?? [],
    focusScoreDelta: (overrides.focusScoreDelta as number) ?? 8,
    grade: (overrides.grade as string) ?? "A",
    hiddenFeatureKeys: (overrides.hiddenFeatureKeys as string[]) ?? [],
    isComeback: (overrides.isComeback as boolean) ?? false,
    isPersonalBest: (overrides.isPersonalBest as boolean) ?? false,
    lane,
    streakAction: "extended",
    streakDays: (overrides.streakDays as number) ?? 4,
    summary: (overrides.summary as Parameters<typeof createSessionSummary>[0])
      ? createSessionSummary(
          overrides.summary as Parameters<typeof createSessionSummary>[0],
        )
      : createSessionSummary({ sessionMode: SessionMode.FLOW }),
    xpDelta: (overrides.xpDelta as number) ?? 120,
  });
}

export { SessionMode, buildCompletionPersonalization, createSessionSummary };
