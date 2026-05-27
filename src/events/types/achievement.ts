/**
 * Achievement Events
 */

export interface AchievementEventDefinitions {
  "achievement:unlock": { achievementId: string; userId: string };
  "achievement:unlocked": {
    userId: string;
    achievementId: string;
    unlockedAt: number;
  };
  "achievements:unlock_badge": {
    userId: string;
    badgeId: string;
    rarity?: string;
  };
  "achievements:check": {
    userId: string;
    type: string;
    data: Record<string, unknown>;
  };
}
