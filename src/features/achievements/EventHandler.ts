import { eventBus } from "../../events/EventBus";
import type { EventChannels } from "../../events/EventTypes";
import * as Sentry from "@sentry/react-native";
import { createDebugger } from "../../utils/debug";
import { ALL_ACHIEVEMENTS, getAchievementById } from "./definitions";
import type { Achievement, AchievementCategory } from "./types";
import * as achievementRepository from "./repository";
import { getAvailabilityFor } from "../liveops-config/feature-access-store";
import type { EventHandler } from "./event-handler-types";
import {
  handleSessionCompleted,
  handleStreakUpdated,
  handleStreakMilestone,
  handleStreakBroken,
  handleStreakComeback,
  handleBossDefeated,
  handleLevelUp,
  handlePrestige,
  handleAchievementCheck,
} from "./event-handlers";

const FEATURE_KEY = "achievements" as const;
const debug = createDebugger("achievements:event-handler");

export class AchievementEventHandler {
  private unsubscribeFns: Array<() => void> = [];
  private isInitialized = false;

  initialize(): void {
    const availability = getAvailabilityFor(FEATURE_KEY);
    if (!availability.canSubscribeToEvents) {
      debug.info("AchievementEventHandler skipped - feature not available");
      return;
    }
    if (this.isInitialized) {
      debug.warn("AchievementEventHandler already initialized");
      return;
    }
    this.subscribe("session:completed", handleSessionCompleted);
    this.subscribe("streak:updated", handleStreakUpdated);
    this.subscribe("streak:milestone", handleStreakMilestone);
    this.subscribe("streak:broken", handleStreakBroken);
    this.subscribe("streak:comeback", handleStreakComeback);
    this.subscribe("boss:defeated", handleBossDefeated);
    this.subscribe("progression:level_up", handleLevelUp);
    this.subscribe("progression:prestige", handlePrestige);
    this.subscribe("achievements:check", handleAchievementCheck);
    this.isInitialized = true;
    Sentry.addBreadcrumb({
      category: "achievements",
      message: "AchievementEventHandler initialized",
      level: "info",
    });
  }

  destroy(): void {
    this.unsubscribeFns.forEach((fn) => fn());
    this.unsubscribeFns = [];
    this.isInitialized = false;
  }

  private subscribe<T extends keyof EventChannels>(
    channel: T,
    handler: EventHandler<T>,
  ): void {
    const unsubscribe = eventBus.subscribe(channel, handler);
    this.unsubscribeFns.push(unsubscribe);
  }
}

export const achievementEventHandler = new AchievementEventHandler();

export function initializeAchievementEventHandler(): void {
  achievementEventHandler.initialize();
}

export function destroyAchievementEventHandler(): void {
  achievementEventHandler.destroy();
}

export async function checkAchievementManually(
  userId: string,
  achievementId: string,
): Promise<boolean> {
  const achievement = getAchievementById(achievementId);
  if (!achievement) {
    debug.warn(
      `Achievement ${achievementId} not found`,
      new Error("Not found"),
    );
    return false;
  }
  const existing = await achievementRepository.getUserAchievement(
    userId,
    achievementId,
  );
  return !existing?.isUnlocked;
}

export function getAchievementsByCategoryForUser(
  userId: string,
  category: AchievementCategory,
): Achievement[] {
  void userId;
  return ALL_ACHIEVEMENTS.filter((a) => a.category === category);
}
