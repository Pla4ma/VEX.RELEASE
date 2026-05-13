/**
 * PersonalQuestGenerator
 *
 * Generates personalized daily quests based on user patterns.
 * Analyzes historical data once per day.
 * Quests appear in AICoachScreen with progress tracker.
 * Reward: 150% of normal challenge XP.
 *
 * @phase 8
 */

import { z } from 'zod';
import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import type { CoachMessage, MessageCategory } from './types';

const questStorage = new MMKVStorageAdapter('personal-quests');

// ============================================================================
// Types
// ============================================================================
const PersonalQuestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  target: z.number(),
  current: z.number(),
  unit: z.string(),
  rewardXp: z.number(),
  rewardBonus: z.number(),
  expiresAt: z.number(),
  completedAt: z.number().nullable(),
  createdAt: z.number(),
  reasoning: z.string(),
});

function getQuestStorageKey(userId: string): string {
  return `daily:${userId}:${new Date().toISOString().slice(0, 10)}`;
}

// ============================================================================
// Quest Generation Logic
// ============================================================================

/**
 * Select quest type based on user patterns
 */
function selectQuestType(patterns: UserPatterns): QuestType {
  const options: QuestType[] = [];

  // Peak time quest: if user has clear peak time
  if (patterns.peakFocusHour !== null) {
    options.push('PEAK_TIME_FOCUS');
  }

  // No pause challenge: if it's been a while
  if (patterns.daysSinceNoPauseSession > 3) {
    options.push('NO_PAUSE_CHALLENGE');
  }

  // Quality quest: if average quality is mediocre
  if (patterns.avgQualityScore < 80) {
    options.push('QUALITY_GRADE_TARGET');
  }

  // Personal best: if close to beating record
  if (patterns.avgSessionDuration > patterns.maxSessionDuration * 0.8) {
    options.push('BEAT_PERSONAL_BEST');
  }

  // Boss quest: if boss active recently
  if (patterns.lastBossEncounter && Date.now() - patterns.lastBossEncounter < 172800000) {
    options.push('BOSS_DAMAGE_DEALT');
  }

  // Rival quest: if behind rival
  if (patterns.rivalStatus === 'BEHIND') {
    options.push('RIVAL_OUTFOCUS');
  }

  // Pick one randomly or by priority
  return options[Math.floor(Math.random() * options.length)] || 'DURATION_MILESTONE';
}

// ============================================================================
// Quest Generators by Type
// ============================================================================

function generatePeakTimeQuest(userId: string, patterns: UserPatterns, expiresAt: number): PersonalQuest {
  const hour = patterns.peakFocusHour || 20;
  const hourFormatted = hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

  return {
    id: `quest-${Date.now()}-peak`,
    userId,
    type: 'PEAK_TIME_FOCUS',
    title: 'Peak Performance',
    description: `Focus at your peak time (${hourFormatted}) today. Your historical data shows this is when you do your best work.`,
    target: 30, // 30 min session
    current: 0,
    unit: 'minutes',
    rewardXp: 150, // 150 XP (vs 100 for normal challenge)
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `Based on your pattern: highest quality sessions occur around ${hourFormatted}`,
  };
}

function generatePersonalBestQuest(userId: string, patterns: UserPatterns, expiresAt: number): PersonalQuest {
  const targetDuration = patterns.maxSessionDuration + 5; // Just above current best

  return {
    id: `quest-${Date.now()}-pb`,
    userId,
    type: 'BEAT_PERSONAL_BEST',
    title: 'Personal Best Challenge',
    description: `Beat your longest session record! Your current best is ${patterns.maxSessionDuration} minutes. Can you reach ${targetDuration}?`,
    target: targetDuration,
    current: 0,
    unit: 'minutes',
    rewardXp: 200,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `Your recent sessions average ${patterns.avgSessionDuration}min — you're close to your ${patterns.maxSessionDuration}min record`,
  };
}

function generateNoPauseQuest(userId: string, patterns: UserPatterns, expiresAt: number): PersonalQuest {
  const duration = Math.max(15, patterns.avgSessionDuration - 10);

  return {
    id: `quest-${Date.now()}-nopause`,
    userId,
    type: 'NO_PAUSE_CHALLENGE',
    title: 'Uninterrupted Flow',
    description: `Complete a ${duration}-minute session without pausing. Your last pause-free session was ${patterns.daysSinceNoPauseSession} days ago.`,
    target: duration,
    current: 0,
    unit: 'minutes (no pauses)',
    rewardXp: 180,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `You haven't completed a pause-free session in ${patterns.daysSinceNoPauseSession} days — time to rebuild that habit`,
  };
}

function generateQualityQuest(userId: string, patterns: UserPatterns, expiresAt: number): PersonalQuest {
  const targetGrade = patterns.avgQualityScore >= 70 ? 'A' : 'B';

  return {
    id: `quest-${Date.now()}-quality`,
    userId,
    type: 'QUALITY_GRADE_TARGET',
    title: `${targetGrade}-Grade Focus`,
    description: `Achieve a ${targetGrade} grade or higher on your next session. Quality over quantity — minimize pauses and stay focused.`,
    target: targetGrade === 'A' ? 85 : 70,
    current: 0,
    unit: 'quality score',
    rewardXp: 150,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `Your average quality score is ${patterns.avgQualityScore}% — targeting ${targetGrade === 'A' ? '85' : '70'}% to push your limits`,
  };
}

function generateBossQuest(userId: string, patterns: UserPatterns, expiresAt: number): PersonalQuest {
  return {
    id: `quest-${Date.now()}-boss`,
    userId,
    type: 'BOSS_DAMAGE_DEALT',
    title: 'Boss Slayer',
    description: 'Deal 50+ damage to the active boss in one session. Your streak multiplier is active — this is the time to strike!',
    target: 50,
    current: 0,
    unit: 'damage',
    rewardXp: 175,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: 'Boss encounter detected — perfect time to challenge yourself with high-damage session',
  };
}

function generateRivalQuest(userId: string, patterns: UserPatterns, expiresAt: number): PersonalQuest {
  const targetMinutes = patterns.avgSessionDuration + 15;

  return {
    id: `quest-${Date.now()}-rival`,
    userId,
    type: 'RIVAL_OUTFOCUS',
    title: 'Rival Showdown',
    description: `Focus for ${targetMinutes} minutes today to catch up with your rival. You're behind — time to fight back!`,
    target: targetMinutes,
    current: 0,
    unit: 'minutes today',
    rewardXp: 160,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: `You're behind your rival — need ${targetMinutes}min focus today to close the gap`,
  };
}

function generateDefaultQuest(userId: string, patterns: UserPatterns, expiresAt: number): PersonalQuest {
  return {
    id: `quest-${Date.now()}-default`,
    userId,
    type: 'DURATION_MILESTONE',
    title: 'Daily Focus Goal',
    description: `Complete ${patterns.avgSessionDuration} minutes of focused time today. You've got this!`,
    target: patterns.avgSessionDuration,
    current: 0,
    unit: 'minutes',
    rewardXp: 100,
    rewardBonus: 1.5,
    expiresAt,
    completedAt: null,
    createdAt: Date.now(),
    reasoning: 'Daily quest based on your average session duration',
  };
}

// ============================================================================
// Quest as Chat Message
// ============================================================================
// ============================================================================
// Quest Progress Tracking
// ============================================================================
// ============================================================================
// Main Export Functions
// ============================================================================
export default {
  generateDailyQuest,
  getActiveQuest,
  updateQuestProgress,
  isQuestCompleted,
  formatQuestProgress,
  questToCoachMessage,
};

export * from "./PersonalQuestGenerator.types";
export * from "./PersonalQuestGenerator.part1";
