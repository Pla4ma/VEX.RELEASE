import { z } from 'zod';


export const MasteryTrackSchema = z.enum([
  'DURATION',
  'PURITY',
  'CONSISTENCY',
  'COMEBACK',
  'BOSS',
]);
export type MasteryTrack = z.infer<typeof MasteryTrackSchema>;

export const MASTERY_TRACKS: MasteryTrack[] = [
  'DURATION',
  'PURITY',
  'CONSISTENCY',
  'COMEBACK',
  'BOSS',
];

export interface MasteryTrackState {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  milestonesCompleted: number[];
}

export interface UnifiedMasteryState {
  userId: string;
  tracks: Record<MasteryTrack, MasteryTrackState>;
  overallLevel: number;
  overallRank: MasteryRank;
  prestigeLevel: number;
  prestigeBonuses: string[];
  lastUpdated: number;
  createdAt: number;
}

export type MasteryRank =
  | 'APPRENTICE'
  | 'ADEPT'
  | 'EXPERT'
  | 'MASTER'
  | 'GRANDMASTER'
  | 'TRANSCENDENT';

export const RANK_CONFIG: Record<
  MasteryRank,
  {
    minLevel: number;
    maxLevel: number;
    displayName: string;
    color: string;
    icon: string;
    unlocks: string[];
  }
> = {
  APPRENTICE: {
    minLevel: 1,
    maxLevel: 10,
    displayName: 'Apprentice',
    color: '#8b4513',
    icon: '🌱',
    unlocks: ['Basic bosses', 'Light Focus mode'],
  },
  ADEPT: {
    minLevel: 11,
    maxLevel: 20,
    displayName: 'Adept',
    color: '#4a5568',
    icon: '⚔️',
    unlocks: ['Sprint mode', 'Study mode', 'Advanced challenges'],
  },
  EXPERT: {
    minLevel: 21,
    maxLevel: 30,
    displayName: 'Expert',
    color: '#4169e1',
    icon: '🛡️',
    unlocks: [
      'Deep Work mode',
      'Creative mode',
      'Squad access',
      'Daily dungeons',
    ],
  },
  MASTER: {
    minLevel: 31,
    maxLevel: 40,
    displayName: 'Master',
    color: '#9400d3',
    icon: '👑',
    unlocks: ['Nightmare bosses', 'Rival system', 'Item crafting'],
  },
  GRANDMASTER: {
    minLevel: 41,
    maxLevel: 50,
    displayName: 'Grandmaster',
    color: '#ffd700',
    icon: '⭐',
    unlocks: ['Transcendence (Prestige)', 'Legendary items', 'Guild Wars'],
  },
  TRANSCENDENT: {
    minLevel: 51,
    maxLevel: 999,
    displayName: 'Transcendent',
    color: '#ff00ff',
    icon: '✨',
    unlocks: ['All previous + prestige bonuses'],
  },
};

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export interface SessionMasteryXp {
  track: MasteryTrack;
  xpEarned: number;
  reason: string;
}

export interface SessionMasteryResult {
  totalXp: number;
  byTrack: Record<MasteryTrack, number>;
  levelUps: Array<{ track: MasteryTrack; newLevel: number }>;
  overallLevelUp: boolean;
}

export interface ApplyXpResult {
  newState: UnifiedMasteryState;
  levelUps: Array<{ track: MasteryTrack; oldLevel: number; newLevel: number }>;
  overallLevelUp: {
    oldLevel: number;
    newLevel: number;
    newRank: MasteryRank;
  } | null;
}

export function calculateMasteryRank(
  overallLevel: number,
  prestigeLevel: number,
): MasteryRank {
  if (prestigeLevel > 0) {
    return 'TRANSCENDENT';
  }
  if (overallLevel >= 41) {
    return 'GRANDMASTER';
  }
  if (overallLevel >= 31) {
    return 'MASTER';
  }
  if (overallLevel >= 21) {
    return 'EXPERT';
  }
  if (overallLevel >= 11) {
    return 'ADEPT';
  }
  return 'APPRENTICE';
}
