import { type BossTemplate, type BossRewardType } from "./types";


export function getExpansionBosses(): ExpansionBossTemplate[] {
  return EXPANSION_BOSSES;
}

export function getBossById(bossId: string): ExpansionBossTemplate | undefined {
  return EXPANSION_BOSSES.find((boss) => boss.id === bossId);
}

export function getAvailableBosses(
  userProgress: {
    mondaySessions: number;
    sGradeSessions: number;
    lateNightSessions: number;
    squadSessions: number;
    rivalBattles: number;
    distractionHistory: boolean;
    highQualityHistory: boolean;
  },
  currentTime: Date,
): ExpansionBossTemplate[] {
  return EXPANSION_BOSSES.filter((boss) => {
    // Check unlock requirements
    switch (boss.id) {
      case 'boss-doomscroller':
        return userProgress.distractionHistory;
      case 'boss-burnout-beast':
        return userProgress.squadSessions >= 3;
      case 'boss-monday-demon':
        return userProgress.mondaySessions >= 5;
      case 'boss-perfectionist':
        return userProgress.sGradeSessions >= 3;
      case 'boss-midnight-procrastinator':
        return userProgress.lateNightSessions >= 2;
      case 'boss-comparison-trap':
        return userProgress.rivalBattles >= 5;
      default:
        return false;
    }
  }).filter((boss) => {
    // Check spawn conditions
    if (boss.spawnConditions.dayOfWeek) {
      const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      if (dayMap[currentTime.getDay()] !== boss.spawnConditions.dayOfWeek) {
        return false;
      }
    }

    if (boss.spawnConditions.timeOfDay) {
      const [start, end] = boss.spawnConditions.timeOfDay.split('-');
      const currentHour = currentTime.getHours();
      const [startHour] = start.split(':').map(Number);
      const [endHour] = end.split(':').map(Number);

      // Handle midnight wraparound (22:00-02:00)
      if (startHour > endHour) {
        if (currentHour < startHour && currentHour > endHour) {
          return false;
        }
      } else {
        if (currentHour < startHour || currentHour >= endHour) {
          return false;
        }
      }
    }

    return true;
  });
}

export function getBossSpawnSchedule(): {
  bossId: string;
  bossName: string;
  spawnWindow: string;
  daysAvailable: string[];
}[] {
  return EXPANSION_BOSSES.map((boss) => ({
    bossId: boss.id,
    bossName: boss.name,
    spawnWindow: boss.spawnConditions.timeOfDay || 'Any time',
    daysAvailable: boss.spawnConditions.dayOfWeek ? [boss.spawnConditions.dayOfWeek] : ['All days'],
  }));
}

export function getBossFlavorText(bossId: string): string[] {
  const boss = getBossById(bossId);
  return boss?.flavorText || [];
}

export function getBossArtworkDescription(bossId: string): string {
  const boss = getBossById(bossId);
  return boss?.artworkDescription || '';
}