/**
 * Competitive Squads System
 *
 * Transforms squads from passive XP buffs into high-stakes competition.
 * Only ONE person can be Top Contributor each day.
 * Real-time leaderboard updates during sessions.
 * Loss aversion from seeing squadmates pass you.
 */

export interface CompetitiveSquad {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  maxMembers: number; // 5 - small enough for real competition

  // Daily competition
  currentDayFocus: DailyFocusData;

  // Weekly squad mission (shared goal)
  weeklyMission: SquadMission;

  // Streak as a group
  squadStreak: number; // Days all members completed focus
  longestSquadStreak: number;

  createdAt: number;
}

export interface DailyFocusData {
  date: string; // ISO date
  contributions: MemberContribution[];
  topContributorId: string | null;
  totalSquadMinutes: number;
  goalMinutes: number; // Squad daily goal
  achieved: boolean;
}

export interface MemberContribution {
  userId: string;
  username: string;
  avatar: string;

  // Today's stats
  minutesFocused: number;
  sessionsCompleted: number;
  purityScore: number; // Average purity today

  // Real-time status
  isFocusingNow: boolean;
  currentSessionMinutes: number; // Updates live

  // Ranking
  rank: number; // 1-5
  wasTopContributor: boolean; // Yesterday

  // Last update
  lastUpdated: number;
}

export interface SquadMission {
  id: string;
  weekNumber: number;
  title: string;
  description: string;

  // Shared goal
  targetMinutes: number;
  currentMinutes: number;

  // Reward (shared)
  rewardPerMember: {
    type: 'XP_BOOST' | 'COMPANION_XP' | 'STREAK_SHIELD' | 'COSMETIC';
    value: number | string;
  };

  // Status
  status: 'ACTIVE' | 'COMPLETED' | 'CLAIMED';
  completedAt: number | null;

  // Individual contributions to mission
  memberProgress: Record<string, number>; // userId → minutes contributed
}

// Real-time updates during session
export interface LiveSquadUpdate {
  type: 'MEMBER_STARTED' | 'MEMBER_PROGRESS' | 'MEMBER_FINISHED' | 'RANK_CHANGE' | 'TOP_CONTRIBUTOR_CHANGE';
  userId: string;
  timestamp: number;
  data: {
    minutesFocused?: number;
    newRank?: number;
    oldRank?: number;
    passedUserId?: string; // Who they just passed
    message?: string;
  };
}

// Points system - weighted to reward quality, not just time
export function calculateContributionScore(
  minutes: number,
  purityScore: number,
  isPerfectSession: boolean
): number {
  // Base: 10 points per minute
  const basePoints = minutes * 10;

  // Purity multiplier: up to 1.5x
  const purityMultiplier = 0.5 + (purityScore / 200);

  // Perfect session bonus: +50 points
  const perfectBonus = isPerfectSession ? 50 : 0;

  return Math.floor(basePoints * purityMultiplier) + perfectBonus;
}

// Rank titles - only top 3 matter
export function getRankTitle(rank: number, wasTopYesterday: boolean): string {
  if (rank === 1) {return wasTopYesterday ? 'DEFENDING CHAMP' : 'TOP CONTRIBUTOR';}
  if (rank === 2) {return 'CHALLENGER';}
  if (rank === 3) {return 'CONTENDER';}
  return 'FOCUSED';
}

// Squad size limit - small for real competition
export const MAX_SQUAD_SIZE = 5;

// Daily goal per squad
export const SQUAD_DAILY_GOAL_MINUTES = 100; // 5 people × 20 min average

// Messages for real-time updates
export function getRankChangeMessage(
  newRank: number,
  oldRank: number,
  passedUsername: string
): string {
  if (newRank === 1 && oldRank !== 1) {
    return `You passed ${passedUsername} and took 1st place!`;
  }
  if (oldRank - newRank >= 2) {
    return `Jumped ${oldRank - newRank} spots! Passed ${passedUsername}`;
  }
  if (newRank < oldRank) {
    return `Passed ${passedUsername}! Now #${newRank}`;
  }
  return '';
}

export function getDefendingMessage(beingPassedBy: string): string {
  return `⚠️ ${beingPassedBy} is catching up! Focus to defend your spot!`;
}
