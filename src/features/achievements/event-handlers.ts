import * as Sentry from "@sentry/react-native";
import type { EventChannels } from "../../events/EventTypes";
import type { AchievementCheckContext } from "./event-handler-types";
import { checkAchievement, checkCumulativeAchievements } from "./achievement-unlock";

export async function handleSessionCompleted(
  data:
    | EventChannels["session:completed"]
    | EventChannels["sessions:completed"],
): Promise<void> {
  const timestamp = "timestamp" in data ? data.timestamp : Date.now();
  const context: AchievementCheckContext = {
    userId: data.userId,
    eventType: "SESSION_COMPLETE",
    data: {
      duration: data.duration,
      quality:
        "quality" in data
          ? data.quality
          : "qualityScore" in data
            ? data.qualityScore
            : undefined,
      timestamp,
    },
    timestamp: Date.now(),
  };
  await checkCumulativeAchievements(context.userId, "SESSION_COMPLETE", [
    "session-first",
    "session-10",
    "session-50",
    "session-100",
    "session-500",
  ]);
  if (data.duration >= 60 * 60) {
    await checkAchievement(context.userId, "session-60-min");
  }
  if ("quality" in data && data.quality && data.quality >= 95) {
    await checkCumulativeAchievements(
      context.userId,
      "PERFECT_SESSION",
      ["session-first-s-grade", "session-10-perfect"],
    );
  }
  const ts = "timestamp" in data ? data.timestamp : Date.now();
  const hour = new Date(ts).getHours();
  if (hour === 0) {
    await checkAchievement(context.userId, "session-midnight");
  }
  if (hour === 5) {
    await checkAchievement(context.userId, "session-early-bird");
  }
}

export async function handleStreakUpdated(
  data: EventChannels["streak:updated"],
): Promise<void> {
  const streakDays = data.state.currentStreak;
  const streakAchievements = [
    { id: "streak-3", minDays: 3 },
    { id: "streak-7", minDays: 7 },
    { id: "streak-14", minDays: 14 },
    { id: "streak-30", minDays: 30 },
    { id: "streak-60", minDays: 60 },
    { id: "streak-100", minDays: 100 },
    { id: "streak-180", minDays: 180 },
    { id: "streak-365", minDays: 365 },
  ];
  for (const { id, minDays } of streakAchievements) {
    if (streakDays >= minDays) {
      await checkAchievement(data.userId, id);
    }
  }
}

export async function handleStreakMilestone(
  data: EventChannels["streak:milestone"],
): Promise<void> {
  Sentry.addBreadcrumb({
    category: "achievements",
    message: `Streak milestone reached: ${data.milestone}`,
    level: "info",
    data: { userId: data.userId, milestone: data.milestone },
  });
}

export async function handleStreakBroken(
  _data: EventChannels["streak:broken"],
): Promise<void> {}

export async function handleStreakComeback(
  data: EventChannels["streak:comeback"],
): Promise<void> {
  await checkAchievement(data.userId, "streak-phoenix");
}

export async function handleBossDefeated(
  data: EventChannels["boss:defeated"],
): Promise<void> {
  await checkCumulativeAchievements(data.userId, "BOSS_DEFEAT", [
    "boss-first",
    "boss-all-6",
  ]);
  if (!data.participants || data.participants.length === 0) {
    await checkAchievement(data.userId, "boss-solo");
  }
  if (data.participants && data.participants.length > 0) {
    await checkAchievement(data.userId, "boss-squad");
  }
  if (data.damageDealt > 100) {
    await checkAchievement(data.userId, "boss-critical");
  }
}

export async function handleLevelUp(
  data: EventChannels["progression:level_up"],
): Promise<void> {
  const level = data.newLevel;
  const levelAchievements = [
    { id: "prog-level-5", minLevel: 5 },
    { id: "prog-level-10", minLevel: 10 },
    { id: "prog-level-20", minLevel: 20 },
    { id: "prog-level-50", minLevel: 50 },
  ];
  for (const { id, minLevel } of levelAchievements) {
    if (level >= minLevel) {
      await checkAchievement(data.userId, id);
    }
  }
}

export async function handlePrestige(
  data: EventChannels["progression:prestige"],
): Promise<void> {
  await checkAchievement(data.userId, "prog-first-prestige");
}

export async function handleAchievementCheck(
  data: EventChannels["achievements:check"],
): Promise<void> {
  Sentry.addBreadcrumb({
    category: "achievements",
    message: `Manual achievement check: ${data.type}`,
    level: "debug",
    data: { userId: data.userId, type: data.type },
  });
}
