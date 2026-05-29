import { buildFocusRunDisplay, computeFocusRunGrade, resolvePersonalBlocker } from "../service";
import type { FocusRun, FocusRunGrade } from "../schemas";

export const MOCK_RUN: FocusRun = {
  blockerId: null,
  cleanStarts: 0,
  completedRuns: 0,
  events: [],
  finalGrade: null,
  focusModifiers: ["Phone away", "One tab"],
  id: "run-1",
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

export { buildFocusRunDisplay, computeFocusRunGrade, resolvePersonalBlocker };
