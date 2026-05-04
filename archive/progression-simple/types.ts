/**
 * Simplified Progression System
 *
 * Collapses 8+ progression tracks into 3 meaningful paths:
 * 1. LEVEL - Long-term character growth (XP from all activities)
 * 2. STREAK - Daily commitment tracking
 * 3. MISSION - Weekly rotating challenge with story context
 *
 * Removes: Battle Pass tiers, Season progress, Squad contribution score,
 * Individual challenge tracking, Crafting levels, Item equipment bonuses
 */

export interface SimplifiedProgression {
  userId: string;

  // === LEVEL (Long-term growth) ===
  level: number; // 1-100
  xp: number; // XP in current level
  xpToNextLevel: number;
  totalXp: number; // All-time XP earned

  // === STREAK (Daily commitment) ===
  currentStreak: number;
  longestStreak: number;
  lastQualifyingSessionDate: string | null; // ISO date
  streakShieldCharges: number; // Freezes for emergencies

  // === MISSION (Weekly challenge) ===
  activeMission: Mission | null;
  missionHistory: CompletedMission[];

  updatedAt: number;
}

export interface Mission {
  id: string;
  weekNumber: number; // 1-52
  year: number;

  // Mission theme
  title: string;
  description: string;
  storyContext: string; // Narrative hook

  // Requirements (ONE clear goal)
  type: MissionType;
  target: number;
  current: number;
  unit: string; // "minutes", "sessions", "bosses"

  // Reward (ONE big reward, not many small ones)
  rewardType: 'LEVEL_BOOST' | 'STREAK_SHIELD' | 'COSMETIC' | 'TITLE';
  rewardValue: number | string;
  rewardRarity: 'RARE' | 'EPIC' | 'LEGENDARY';

  // Time
  expiresAt: number;

  // Status
  status: 'ACTIVE' | 'COMPLETED' | 'CLAIMED';
}

export type MissionType =
  | 'FOCUS_MINUTES'      // Focus for X minutes this week
  | 'PERFECT_SESSIONS'   // Complete X perfect (90%+ purity) sessions
  | 'BOSS_DEFEATS'       // Defeat X bosses
  | 'STREAK_MAINTAIN'    // Maintain streak for X days
  | 'COMPANION_GROWTH';  // Grow companion X levels

export interface CompletedMission {
  missionId: string;
  completedAt: number;
  rewardClaimed: boolean;
}

// XP calculation - simple and transparent
export function calculateSessionXp(
  sessionMinutes: number,
  purityScore: number,
  streakDays: number
): number {
  // Base XP: 10 per minute
  const baseXp = sessionMinutes * 10;

  // Purity bonus: up to 50% extra
  const purityBonus = Math.floor(baseXp * (purityScore / 200));

  // Streak bonus: up to 25% extra
  const streakBonus = Math.min(0.25, streakDays * 0.01);
  const streakXp = Math.floor(baseXp * streakBonus);

  return baseXp + purityBonus + streakXp;
}

// Level thresholds - exponential but not punishing
export function getXpForLevel(level: number): number {
  // Level 1 → 2: 100 XP
  // Level 10 → 11: ~260 XP
  // Level 50 → 51: ~1,200 XP
  // Level 99 → 100: ~4,800 XP
  return Math.floor(100 * Math.pow(1.08, level - 1));
}

// Streak qualification
export const STREAK_QUALIFYING_MINUTES = 15;

// Mission rotation - generated weekly
export function generateWeeklyMission(
  weekNumber: number,
  userLevel: number,
  companionPhase: string
): Mission {
  const missions: MissionType[] = [
    'FOCUS_MINUTES',
    'PERFECT_SESSIONS',
    'BOSS_DEFEATS',
    'STREAK_MAINTAIN',
    'COMPANION_GROWTH',
  ];

  // Rotate based on week number
  const missionType = missions[weekNumber % missions.length];

  // Scale difficulty by user level
  const difficultyMultiplier = 1 + (userLevel * 0.05);

  const templates: Record<MissionType, {
    title: string;
    description: string;
    story: string;
    baseTarget: number;
    unit: string;
  }> = {
    FOCUS_MINUTES: {
      title: 'The Deep Dive',
      description: `Focus for ${Math.floor(150 * difficultyMultiplier)} minutes this week`,
      story: 'Your companion senses a disturbance in the realm. Only deep focus can restore balance.',
      baseTarget: 150,
      unit: 'minutes',
    },
    PERFECT_SESSIONS: {
      title: 'Pure Mastery',
      description: `Complete ${Math.floor(5 * difficultyMultiplier)} perfect sessions`,
      story: 'The ancient texts speak of masters who achieved perfect clarity. Prove yourself worthy.',
      baseTarget: 5,
      unit: 'sessions',
    },
    BOSS_DEFEATS: {
      title: 'Boss Hunter',
      description: `Defeat ${Math.floor(3 * difficultyMultiplier)} bosses`,
      story: 'Dark entities gather at the borders. Your companion needs you to push them back.',
      baseTarget: 3,
      unit: 'bosses',
    },
    STREAK_MAINTAIN: {
      title: 'Unbroken Chain',
      description: `Maintain your streak for ${Math.floor(5 * difficultyMultiplier)} days`,
      story: 'The path of the focused is not easy, but consistency builds legend.',
      baseTarget: 5,
      unit: 'days',
    },
    COMPANION_GROWTH: {
      title: 'Evolution Call',
      description: `Help your companion grow ${Math.floor(3 * difficultyMultiplier)} levels`,
      story: 'Your companion stirs with new potential. Guide its transformation.',
      baseTarget: 3,
      unit: 'levels',
    },
  };

  const template = templates[missionType];

  return {
    id: `mission_${weekNumber}_${Date.now()}`,
    weekNumber,
    year: new Date().getFullYear(),
    title: template.title,
    description: template.description,
    storyContext: template.story,
    type: missionType,
    target: Math.floor(template.baseTarget * difficultyMultiplier),
    current: 0,
    unit: template.unit,
    rewardType: 'LEVEL_BOOST',
    rewardValue: Math.floor(50 * difficultyMultiplier),
    rewardRarity: weekNumber % 4 === 0 ? 'LEGENDARY' : weekNumber % 2 === 0 ? 'EPIC' : 'RARE',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    status: 'ACTIVE',
  };
}
