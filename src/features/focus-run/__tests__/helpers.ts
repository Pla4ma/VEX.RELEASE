import { buildFocusRunDisplay, computeFocusRunGrade } from "../service";
import { resolvePersonalBoss } from "../boss-resolution";
import type { FocusRun, FocusRunGrade } from "../schemas";

export const MOCK_RUN: FocusRun = {
  bossId: null,
  cleanStarts: 0,
  completedEncounters: 0,
  events: [],
  finalGrade: null,
  id: "run-1",
  modifiers: ["Phone away", "One tab"],
  recoveryWins: 0,
  reflectionUpgrades: 0,
  status: "active",
  userId: "user-1",
  weekStartsAt: 1,
};

export function weekStartDaysAgo(daysAgo: number): number {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

export function nowForDaysAgo(_daysAgo: number): number {
  return Date.now();
}

export { buildFocusRunDisplay, computeFocusRunGrade, resolvePersonalBoss };
