import type { SessionHistoryEntry } from "../types";

export function calculateSessionStreaks(history: SessionHistoryEntry[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (history.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sorted = [...history].sort((a, b) => b.startedAt - a.startedAt);
  const completedDays = new Set(
    sorted
      .filter((h) => h.status === "COMPLETED" || h.status === "PARTIAL")
      .map((h) => new Date(h.startedAt).toDateString()),
  );
  const completedDaysArray = Array.from(completedDays);
  if (completedDaysArray.length === 0)
    return { currentStreak: 0, longestStreak: 0 };

  let currentStreak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const firstDay = completedDaysArray[0];
  if (
    firstDay === undefined ||
    (firstDay !== today && firstDay !== yesterday)
  ) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  for (let i = 1; i < completedDaysArray.length; i++) {
    const prevDay = completedDaysArray[i - 1];
    const currDay = completedDaysArray[i];
    if (prevDay === undefined || currDay === undefined) break;
    const prevDate = new Date(prevDay);
    const currDate = new Date(currDay);
    const diffDays =
      (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < completedDaysArray.length; i++) {
    const prevDay = completedDaysArray[i - 1];
    const currDay = completedDaysArray[i];
    if (prevDay === undefined || currDay === undefined) break;
    const prevDate = new Date(prevDay);
    const currDate = new Date(currDay);
    const diffDays =
      (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  return { currentStreak, longestStreak };
}
