export interface CoachQuest {
  id: string;
  title: string;
  description: string;
  requirement: {
    type: "SESSION_COUNT" | "PURITY_THRESHOLD" | "STREAK_DAYS" | "BOSS_DEFEAT";
    value: number;
    details?: Record<string, unknown>;
  };
  reward: { coins: number; xp?: number; itemId?: string };
  progress: number;
  completed: boolean;
  expiresAt: number;
}

export function generateDailyQuest(
  userLevel: number,
  streakDays: number,
): CoachQuest {
  const questTypes: CoachQuest["requirement"]["type"][] = [
    "SESSION_COUNT",
    "PURITY_THRESHOLD",
    "STREAK_DAYS",
    "BOSS_DEFEAT",
  ];
  const type = questTypes[Math.floor(Math.random() * questTypes.length)]!;
  const templates: Record<
    CoachQuest["requirement"]["type"],
    Partial<CoachQuest>
  > = {
    SESSION_COUNT: {
      title: "Daily Discipline",
      description: `Complete ${userLevel >= 10 ? 3 : 2} focus sessions today`,
      requirement: { type: "SESSION_COUNT", value: userLevel >= 10 ? 3 : 2 },
      reward: { coins: 100 + userLevel * 10 },
    },
    PURITY_THRESHOLD: {
      title: "Crystal Focus",
      description: "Complete a session with 90%+ purity",
      requirement: { type: "PURITY_THRESHOLD", value: 90 },
      reward: { coins: 150, xp: 50 },
    },
    STREAK_DAYS: {
      title: "Streak Guardian",
      description: `Maintain your ${streakDays} day streak`,
      requirement: { type: "STREAK_DAYS", value: 1 },
      reward: { coins: 50 * Math.min(10, streakDays) },
    },
    BOSS_DEFEAT: {
      title: "Boss Hunter",
      description: "Defeat any boss today",
      requirement: { type: "BOSS_DEFEAT", value: 1 },
      reward: { coins: 200, xp: 100 },
    },
  };
  const template = templates[type];
  return {
    id: `quest_${Date.now()}`,
    title: template.title || "",
    description: template.description || "",
    requirement: template.requirement || { type, value: 1 },
    reward: template.reward || { coins: 100 },
    progress: 0,
    completed: false,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
}
