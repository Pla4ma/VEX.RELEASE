import type { HomeModelResult } from '../../screens/home/hooks/useHomeViewModel';
import type { SessionHistoryEntry } from '../../session/types';

export interface LaneViewModel {
  todayFocusMinutes: number;
  streakDays: number;
  hasStudyPlan: boolean;
  todayTasks: Array<{ title: string; done: boolean }>;
  weekProgress: number;
  bossHealth: number;
  bossMaxHealth: number;
  currentRank: string;
  weeklyDamage: number;
  activeProjects: Array<{ name: string; color: string; progress: number }>;
  inspirationPrompt: string;
  lastSession: string | undefined;
  nextSuggestedDuration: number;
  greeting?: string;
  nextReward?: string;
  currentMood?: string;
  lastCreativeSession?: string;
}

export function buildLaneViewModel(homeModel: HomeModelResult): LaneViewModel {
  const sessions = homeModel.sharedInput?.historyQuery?.history ?? [];
  const streakData = homeModel.sharedInput?.streakQuery?.data as { currentDays?: number } | undefined;

  return {
    todayFocusMinutes: sessions.reduce((sum: number, s: SessionHistoryEntry) => sum + (s.duration ?? 0), 0) / 60,
    streakDays: streakData?.currentDays ?? 0,
    hasStudyPlan: false,
    todayTasks: [],
    weekProgress: 0,
    bossHealth: 0,
    bossMaxHealth: 100,
    currentRank: 'Novice',
    weeklyDamage: 0,
    activeProjects: [],
    inspirationPrompt: 'What are you creating today?',
    lastSession: sessions.length > 0 ? `${Math.round((sessions[0]?.duration ?? 0) / 60)}m session` : undefined,
    nextSuggestedDuration: 25,
  };
}
