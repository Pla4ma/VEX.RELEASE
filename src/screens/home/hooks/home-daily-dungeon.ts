export function createHomeDailyDungeon(userId: string): {
  dungeon: {
    id: string;
    date: string;
    bossName: string;
    theme: string;
    specialMechanic: string;
    guaranteedDrop: { type: string; rarity: string; amount: number };
  };
  attempt: {
    userId: string;
    dungeonId: string;
    completed: boolean;
    score: number;
  };
  timeRemaining: { hours: number; minutes: number };
} {
  const today = new Date().toISOString().split('T')[0] ?? '';
  const dungeonId = `dungeon_${today}`;
  return {
    attempt: { completed: false, dungeonId, score: 0, userId },
    dungeon: {
      bossName: 'Procrastination Demon',
      date: today,
      guaranteedDrop: { amount: 1, rarity: 'RARE', type: 'CHEST' },
      id: dungeonId,
      specialMechanic: 'DISTRACTION_FIELDS',
      theme: 'VOID',
    },
    timeRemaining: {
      hours: Math.max(0, 24 - new Date().getHours()),
      minutes: 60 - new Date().getMinutes(),
    },
  };
}
