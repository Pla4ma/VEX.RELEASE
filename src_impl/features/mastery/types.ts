/**
 * Mastery System
 *
 * Skill-based progression that rewards technique, not just time.
 * Players feel themselves getting BETTER at focusing.
 */

export type MasteryRank =
  | 'APPRENTICE'    // 0-9
  | 'ADEPT'         // 10-24
  | 'EXPERT'        // 25-49
  | 'MASTER'        // 50-99
  | 'GRANDMASTER';  // 100+

export interface MasteryState {
  userId: string;

  // Overall rank
  totalMasteryPoints: number;
  rank: MasteryRank;

  // Technique levels (each 0-25)
  techniques: {
    durationMastery: number;      // Long sessions without interruption
    purityMastery: number;        // Sustained high focus scores
    consistencyMastery: number; // Daily streaks
    comebackMastery: number;      // Recovering from broken streaks
    bossMastery: number;          // Boss defeat efficiency
  };

  // Active challenges (3 at a time)
  activeChallenges: MasteryChallenge[];

  // Unlocks based on mastery
  unlockedFeatures: string[];

  updatedAt: number;
}

export interface MasteryChallenge {
  id: string;
  technique: keyof MasteryState['techniques'];

  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE';

  // Requirements
  target: number;
  current: number;
  unit: string;

  // Reward
  masteryPoints: number;

  // Status
  status: 'ACTIVE' | 'COMPLETED' | 'CLAIMED';
  completedAt: number | null;
}

// Rank thresholds
export const MASTERY_RANK_THRESHOLDS: Record<MasteryRank, number> = {
  APPRENTICE: 0,
  ADEPT: 10,
  EXPERT: 25,
  MASTER: 50,
  GRANDMASTER: 100,
};

// Technique XP calculation
export function calculateTechniqueXp(
  sessionMinutes: number,
  purityScore: number,
  wasInterrupted: boolean,
  streakDays: number,
  bossDefeated: boolean,
  bossHealthPercent: number
): Record<keyof MasteryState['techniques'], number> {
  return {
    durationMastery: wasInterrupted ? 0 : Math.floor(sessionMinutes * (purityScore / 100)),
    purityMastery: purityScore >= 90 ? Math.floor(purityScore / 10) : 0,
    consistencyMastery: streakDays > 0 ? 2 : 0,
    comebackMastery: streakDays === 1 ? 10 : 0, // Bonus for restarting after break
    bossMastery: bossDefeated
      ? Math.floor(20 * (1 + (1 - bossHealthPercent))) // Faster kills = more XP
      : 0,
  };
}

// Generate challenges based on current technique levels
export function generateMasteryChallenges(
  techniques: MasteryState['techniques'],
  currentRank: MasteryRank
): MasteryChallenge[] {
  const challenges: MasteryChallenge[] = [];

  // Find lowest technique - give challenge for it
  const techniqueEntries = Object.entries(techniques) as [keyof typeof techniques, number][];
  const lowestTechnique = techniqueEntries.sort((a, b) => a[1] - b[1])[0];

  const challengeTemplates: Record<keyof typeof techniques, Array<{
    title: string;
    description: string;
    target: number;
    unit: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE';
    points: number;
  }>> = {
    durationMastery: [
      // Skill-based (not just "complete X sessions")
      { title: 'Deep Focus', description: 'Complete a 45-minute session without pausing', target: 45, unit: 'minutes', difficulty: 'MEDIUM', points: 5 },
      { title: 'Marathon', description: 'Complete a 90-minute session with 90%+ purity', target: 90, unit: 'minutes', difficulty: 'HARD', points: 10 },
      { title: 'Iron Will', description: 'Complete 3 sessions of 60+ minutes with zero pauses this week', target: 3, unit: 'sessions', difficulty: 'ELITE', points: 15 },
      { title: 'The Long Haul', description: 'Maintain 85%+ purity for a full 60-minute session', target: 60, unit: 'minutes', difficulty: 'HARD', points: 8 },
      { title: 'Sprint Endurance', description: 'Complete 4 consecutive sprints (25 min each) without breaks between', target: 4, unit: 'sprints', difficulty: 'ELITE', points: 12 },
    ],
    purityMastery: [
      { title: 'Crystal Clear', description: 'Achieve 95%+ purity in a 30+ minute session', target: 95, unit: '% purity', difficulty: 'MEDIUM', points: 5 },
      { title: 'Perfect Streak', description: 'Complete 3 perfect sessions (95%+ purity) in a row', target: 3, unit: 'sessions', difficulty: 'HARD', points: 10 },
      { title: 'Enlightened', description: 'Maintain 90%+ average purity for 7 consecutive days', target: 7, unit: 'days', difficulty: 'ELITE', points: 15 },
      { title: 'Flawless Victory', description: 'Achieve 100% purity (zero pauses) in a 45+ minute session', target: 1, unit: 'session', difficulty: 'ELITE', points: 20 },
      { title: 'Pure Consistency', description: 'Achieve S grade in 5 consecutive sessions', target: 5, unit: 'sessions', difficulty: 'HARD', points: 12 },
    ],
    consistencyMastery: [
      { title: 'Daily Grind', description: 'Complete a qualifying session (15+ min, 50+ quality) every day for 5 days', target: 5, unit: 'days', difficulty: 'EASY', points: 3 },
      { title: 'Two Weeks Strong', description: 'Maintain a 14-day streak with no breaks', target: 14, unit: 'days', difficulty: 'MEDIUM', points: 5 },
      { title: 'Monthly Master', description: 'Hit a 30-day streak with at least 20 qualifying sessions', target: 30, unit: 'days', difficulty: 'HARD', points: 10 },
      { title: 'Quality Streak', description: 'Maintain a 7-day streak where every session is A grade or higher', target: 7, unit: 'days', difficulty: 'HARD', points: 8 },
      { title: 'Centurion', description: 'Achieve a 100-day streak (one missed day allowed with shield)', target: 100, unit: 'days', difficulty: 'ELITE', points: 25 },
    ],
    comebackMastery: [
      { title: 'Resilience', description: 'Recover from a broken streak and complete a session within 24 hours', target: 1, unit: 'comeback', difficulty: 'EASY', points: 3 },
      { title: 'Phoenix Rising', description: 'Achieve a 7-day streak after breaking a 14+ day streak', target: 7, unit: 'days', difficulty: 'MEDIUM', points: 5 },
      { title: 'Unbreakable', description: 'Reach a 30-day streak after losing a 30+ day streak before', target: 30, unit: 'days', difficulty: 'HARD', points: 10 },
      { title: 'Stronger Than Before', description: 'Beat your previous longest streak after a break', target: 1, unit: 'record', difficulty: 'HARD', points: 8 },
      { title: 'True Grit', description: 'Complete 3 sessions in the first 3 days after a streak break', target: 3, unit: 'sessions', difficulty: 'MEDIUM', points: 6 },
    ],
    bossMastery: [
      { title: 'Boss Slayer', description: 'Defeat a boss in under 50% of the expected session time', target: 50, unit: '% time', difficulty: 'MEDIUM', points: 5 },
      { title: 'Speed Kill', description: 'Defeat a boss in under 25% of expected time with 90%+ purity', target: 25, unit: '% time', difficulty: 'HARD', points: 10 },
      { title: 'Combo Master', description: 'Achieve a 5x damage combo during a boss fight', target: 5, unit: 'combo', difficulty: 'ELITE', points: 15 },
      { title: 'Critical Striker', description: 'Land 3 critical hits in a single boss encounter', target: 3, unit: 'crits', difficulty: 'HARD', points: 8 },
      { title: 'Boss Berserker', description: 'Defeat 3 bosses in a single week', target: 3, unit: 'bosses', difficulty: 'ELITE', points: 12 },
    ],
  };

  // Pick appropriate difficulty based on technique level
  const techniqueLevel = lowestTechnique[1];
  let targetDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE';

  if (techniqueLevel < 5) {targetDifficulty = 'EASY';}
  else if (techniqueLevel < 15) {targetDifficulty = 'MEDIUM';}
  else if (techniqueLevel < 25) {targetDifficulty = 'HARD';}
  else {targetDifficulty = 'ELITE';}

  // Get templates for lowest technique
  const templates = challengeTemplates[lowestTechnique[0]];
  const matchingTemplate = templates.find(t => t.difficulty === targetDifficulty) || templates[0];

  challenges.push({
    id: `mastery_${lowestTechnique[0]}_${Date.now()}`,
    technique: lowestTechnique[0],
    title: matchingTemplate.title,
    description: matchingTemplate.description,
    difficulty: matchingTemplate.difficulty,
    target: matchingTemplate.target,
    current: 0,
    unit: matchingTemplate.unit,
    masteryPoints: matchingTemplate.points,
    status: 'ACTIVE',
    completedAt: null,
  });

  // Add one random challenge from another technique
  const otherTechnique = techniqueEntries.filter(t => t[0] !== lowestTechnique[0])[Math.floor(Math.random() * 4)];
  const otherTemplates = challengeTemplates[otherTechnique[0]];
  const otherTemplate = otherTemplates[Math.floor(Math.random() * otherTemplates.length)];

  challenges.push({
    id: `mastery_${otherTechnique[0]}_${Date.now()}_2`,
    technique: otherTechnique[0],
    title: otherTemplate.title,
    description: otherTemplate.description,
    difficulty: otherTemplate.difficulty,
    target: otherTemplate.target,
    current: 0,
    unit: otherTemplate.unit,
    masteryPoints: otherTemplate.points,
    status: 'ACTIVE',
    completedAt: null,
  });

  return challenges;
}

// Rank display
export function getMasteryRankDisplay(rank: MasteryRank): {
  title: string;
  color: string;
  icon: string;
} {
  const displays: Record<MasteryRank, { title: string; color: string; icon: string }> = {
    APPRENTICE: { title: 'Apprentice', color: '#8B4513', icon: '🌱' },
    ADEPT: { title: 'Adept', color: '#4A5568', icon: '⚔️' },
    EXPERT: { title: 'Expert', color: '#4169E1', icon: '🛡️' },
    MASTER: { title: 'Master', color: '#9400D3', icon: '👑' },
    GRANDMASTER: { title: 'Grandmaster', color: '#FFD700', icon: '⭐' },
  };
  return displays[rank];
}
