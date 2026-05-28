import {
  FocusRunDisplaySchema,
  FocusRunGradeSchema,
  type FocusRun,
  type FocusRunDisplay,
  type FocusRunGrade,
} from "./schemas";
import { resolvePersonalBoss } from "./boss-resolution";
import type { Lane } from "../lane-engine/types";

export function computeFocusRunGrade(run: FocusRun): FocusRunGrade {
  const encounters = run.completedEncounters ?? 0;
  const cleanStarts = run.cleanStarts ?? 0;
  const recoveryWins = run.recoveryWins ?? 0;
  const upgrades = run.reflectionUpgrades ?? 0;

  if (encounters === 0) return "D";

  const score =
    encounters * 2 + cleanStarts * 1.5 + recoveryWins * 1 + upgrades * 0.5;

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

  const boss = resolvePersonalBoss({
    firstActiveDay: input.firstActiveDay ?? 0,
    signals: allSignals,
  });

  const completedEncounters = run?.completedEncounters ?? 0;
  const cleanStarts = run?.cleanStarts ?? 0;
  const recoveryWins = run?.recoveryWins ?? 0;
  const reflectionUpgrades = run?.reflectionUpgrades ?? 0;
  const finalGrade = run?.finalGrade
    ? FocusRunGradeSchema.parse(run.finalGrade)
    : run?.status === "completed"
      ? computeFocusRunGrade(run)
      : null;

  const summaryParts: string[] = [];
  if (completedEncounters > 0) {
    summaryParts.push(
      `${completedEncounters} encounter${completedEncounters === 1 ? "" : "s"}`,
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
      : "No encounters yet this week.";

  return FocusRunDisplaySchema.parse({
    body:
      events.length === 0
        ? "Begin with one honest encounter. Nothing is bought, saved, or boosted."
        : `${events.length} run signals logged from real sessions.`,
    boss,
    cleanStarts,
    completedEncounters,
    finalGrade,
    laneAllowed,
    modifiers: run?.modifiers ?? [
      "Phone away",
      "One tab",
      "Reflection upgrade",
    ],
    nextAction: boss.isTeaser ? "Start first encounter" : `Face ${boss.name}`,
    recoveryWins,
    reflectionUpgrades,
    title: laneAllowed ? "Weekly Focus Run" : "Run board hidden for this lane",
    weekSummary,
  });
}
