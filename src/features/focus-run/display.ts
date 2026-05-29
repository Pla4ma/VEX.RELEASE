import {
  FocusRunDisplaySchema,
  FocusRunGradeSchema,
  type FocusRun,
  type FocusRunDisplay,
  type FocusRunGrade,
} from "./schemas";
import { resolvePersonalBlocker } from "./blocker-resolution";
import type { Lane } from "../lane-engine/types";

function gradeLabel(grade: FocusRunGrade): string {
  const map: Record<FocusRunGrade, string> = {
    S: "exceptional",
    A: "strong",
    B: "solid",
    C: "steady",
    D: "building",
  };
  return map[grade];
}

function gradeDescription(grade: FocusRunGrade): string {
  const map: Record<FocusRunGrade, string> = {
    S: "Exceptional momentum — clean starts, no interruptions, deep flow.",
    A: "Strong run — high focus quality with few interruptions.",
    B: "Solid run — good focus with room to tighten.",
    C: "Steady progress — inconsistent but you showed up.",
    D: "Building momentum — every run is a data point.",
  };
  return map[grade];
}

export function computeFocusRunGrade(run: FocusRun): FocusRunGrade {
  const completedRuns = run.completedRuns ?? 0;
  const cleanStarts = run.cleanStarts ?? 0;
  const recoveryWins = run.recoveryWins ?? 0;
  const upgrades = run.reflectionUpgrades ?? 0;

  if (completedRuns === 0) return "D";

  const score =
    completedRuns * 2 + cleanStarts * 1.5 + recoveryWins * 1 + upgrades * 0.5;

  if (score >= 20) return "S";
  if (score >= 14) return "A";
  if (score >= 8) return "B";
  if (score >= 4) return "C";
  return "D";
}

export function buildFocusRunDisplay(input: {
  lane: Lane;
  run: FocusRun | null;
  signals?: string[];
  firstActiveDay?: number;
}): FocusRunDisplay {
  const laneAllowed = input.lane === "game_like";
  const run = input.run;
  const events = run?.events ?? [];

  const allSignals =
    input.signals ?? events.map((event) => event.signal ?? "").filter(Boolean);

  const blocker = resolvePersonalBlocker({
    firstActiveDay: input.firstActiveDay ?? 0,
    signals: allSignals,
  });

  const completedRuns = run?.completedRuns ?? 0;
  const cleanStarts = run?.cleanStarts ?? 0;
  const recoveryWins = run?.recoveryWins ?? 0;
  const reflectionUpgrades = run?.reflectionUpgrades ?? 0;
  const finalGrade = run?.finalGrade
    ? FocusRunGradeSchema.parse(run.finalGrade)
    : run?.status === "completed"
      ? computeFocusRunGrade(run)
      : null;

  const summaryParts: string[] = [];
  if (completedRuns > 0) {
    summaryParts.push(
      `${completedRuns} run${completedRuns === 1 ? "" : "s"}`,
    );
  }
  if (cleanStarts > 0) {
    summaryParts.push(
      `${cleanStarts} clean start${cleanStarts === 1 ? "" : "s"}`,
    );
  }
  if (recoveryWins > 0) {
    summaryParts.push(
      `${recoveryWins} recovery win${recoveryWins === 1 ? "" : "s"}`,
    );
  }
  const weekSummary =
    summaryParts.length > 0
      ? summaryParts.join(" · ")
      : "No runs yet this week.";

  const bodyText =
    events.length === 0
      ? "Begin with one honest run. Nothing is bought, saved, or boosted."
      : finalGrade
        ? `${gradeLabel(finalGrade)} run · ${gradeDescription(finalGrade)}`
        : `${events.length} run signals logged from real sessions.`;

  const nextActionText =
    blocker.isTeaser ? "Start first run" : `Watch for ${blocker.name}`;

  return FocusRunDisplaySchema.parse({
    body: bodyText,
    blocker,
    cleanStarts,
    completedRuns,
    finalGrade,
    laneAllowed,
    focusModifiers: run?.focusModifiers ?? [
      "Phone away",
      "One tab",
      "Reflection upgrade",
    ],
    nextAction: nextActionText,
    recoveryWins,
    reflectionUpgrades,
    title: laneAllowed ? "Weekly Momentum" : "Run board hidden for this lane",
    weekSummary,
  });
}