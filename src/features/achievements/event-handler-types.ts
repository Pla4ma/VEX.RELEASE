import type { EventChannels } from "../../events/EventTypes";

export type EventHandler<T extends keyof EventChannels> = (
  data: EventChannels[T],
) => void;

export interface AchievementCheckContext {
  userId: string;
  eventType: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface AchievementUnlockResult {
  achievementId: string;
  userId: string;
  unlockedAt: number;
  wasAlreadyUnlocked: boolean;
}
