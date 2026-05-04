/**
 * Streak Narrative Events
 * Event definitions for cross-system communication
 */

export const StreakNarrativeEvents = {
  // Boss encounters
  BOSS_ENCOUNTERED: 'streak:boss_encountered',
  BOSS_TAUNT_SHOWN: 'streak:boss_taunt_shown',
  BOSS_DEFEATED: 'streak:boss_defeated',
  
  // Chapter progression
  CHAPTER_ADVANCED: 'streak:chapter_advanced',
  MILESTONE_REACHED: 'streak:milestone_reached',
  
  // Risk states
  STREAK_AT_RISK: 'streak:at_risk',
  STREAK_WARNING_SHOWN: 'streak:warning_shown',
  STREAK_SAVED: 'streak:saved',
  STREAK_BROKEN: 'streak:broken',
  
  // Recovery
  COMEBACK_STARTED: 'streak:comeback_started',
  COMEBACK_COMPLETED: 'streak:comeback_completed',
  
  // Narrative display
  NARRATIVE_VIEWED: 'streak:narrative_viewed',
  STORY_SHARED: 'streak:story_shared',
} as const;

export interface StreakNarrativeEventPayloads {
  [StreakNarrativeEvents.BOSS_ENCOUNTERED]: {
    bossId: string;
    bossName: string;
    streakDay: number;
  };
  [StreakNarrativeEvents.BOSS_TAUNT_SHOWN]: {
    bossId: string;
    taunt: string;
  };
  [StreakNarrativeEvents.BOSS_DEFEATED]: {
    bossId: string;
    streakDay: number;
    method: 'SESSION_COMPLETE' | 'INSURANCE' | 'TOKEN';
  };
  [StreakNarrativeEvents.CHAPTER_ADVANCED]: {
    fromChapter: string;
    toChapter: string;
    streakDay: number;
  };
  [StreakNarrativeEvents.MILESTONE_REACHED]: {
    milestone: number;
    bossUnlocked: string;
  };
  [StreakNarrativeEvents.STREAK_AT_RISK]: {
    streakDays: number;
    hoursRemaining: number;
    bossId: string;
  };
  [StreakNarrativeEvents.STREAK_WARNING_SHOWN]: {
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    headline: string;
  };
  [StreakNarrativeEvents.STREAK_SAVED]: {
    streakDays: number;
    method: 'SESSION' | 'INSURANCE' | 'TOKEN';
  };
  [StreakNarrativeEvents.STREAK_BROKEN]: {
    previousStreak: number;
    maxStreak: number;
    bossId: string;
  };
  [StreakNarrativeEvents.COMEBACK_STARTED]: {
    tokenCount: number;
    targetStreak: number;
  };
  [StreakNarrativeEvents.NARRATIVE_VIEWED]: {
    chapter: string;
    bossId: string;
    timeSpentMs: number;
  };
}
