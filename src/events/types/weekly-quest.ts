export interface WeeklyQuestEventDefinitions {
  'weekly_quest:progress': unknown;
  'weekly_quest:completed': {
    userId: string;
    weekKey: string;
    reward: {
      coins: number;
      gems: number;
      nextChest: 'LEGENDARY';
    };
  };
  // Daily Quest Events
  'DAILY_QUESTS_READY': {
    userId: string;
    questCount: number;
    streak: number;
  };
  'QUEST_COMPLETED': {
    userId: string;
    questId: string;
    questTitle: string;
    difficulty: string;
    reward: unknown;
  };
  'ALL_QUESTS_COMPLETED': {
    userId: string;
    streak: number;
  };
  'QUEST_REWARD_CLAIMED': {
    userId: string;
    questId: string;
    reward: unknown;
  };
}
