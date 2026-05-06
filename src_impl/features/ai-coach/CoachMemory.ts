/**
 * CoachMemory
 *
 * Stores and retrieves key user milestones for personalized coach messages.
 * Milestones: first S grade, longest session, best streak, first boss defeated.
 * References these in messages for relationship depth.
 *
 * @phase 8
 */

import type { CoachMessage, MessageCategory } from "./types";
import { createDebugger } from "../../utils/debug";
import { createMemory as repoCreateMemory, getMemoriesByUser as repoGetMemoriesByUser, getMemoriesByType as repoGetMemoriesByType, markMemoryReferenced as repoMarkMemoryReferenced, hasMemoryOfType as repoHasMemoryOfType, getMostRecentMemoryByType as repoGetMostRecentMemoryByType } from "./repository/memories";

const debug = createDebugger("ai-coach:memory");

// ============================================================================
// Types
// ============================================================================

export type MemoryType =
  | "FIRST_S_GRADE"
  | "LONGEST_SESSION"
  | "BEST_STREAK"
  | "FIRST_BOSS_DEFEATED"
  | "FIRST_RIVAL_WIN"
  | "LEVEL_UP"
  | "STREAK_MILESTONE"
  | "PERFECT_SESSION"
  | "ONBOARDING_GOAL"
  | "SESSION_COUNT_MILESTONE"
  // Phase 1: Memory Deepening
  | "STUDY_PATTERN"
  | "PREFERRED_TECHNIQUE"
  | "FAILURE_MODE"
  | "OPTIMAL_FOCUS_TIME"
  | "DOCUMENT_MILESTONE";

export interface CoachMemory {
  id: string;
  userId: string;
  type: MemoryType;
  title: string;
  description: string;
  occurredAt: number;
  metadata: Record<string, unknown>;
  referencedCount: number;
  lastReferencedAt: number | null;
}

export interface UserMilestones {
  firstSGrade: CoachMemory | null;
  longestSession: CoachMemory | null;
  bestStreak: CoachMemory | null;
  firstBossDefeated: CoachMemory | null;
  firstRivalWin: CoachMemory | null;
  onboardingGoal: string | null;
  recentAchievements: CoachMemory[];
  // Phase 1: Deepening
  studyPatterns: CoachMemory[];
  preferredTechniques: CoachMemory[];
  failureModes: CoachMemory[];
}

// ============================================================================
// Phase 1: Memory Deepening - Study Patterns & Behaviors
// ============================================================================

/**
 * Store user's study pattern observation
 */
export async function storeStudyPattern(
  userId: string,
  pattern: "MORNING_PERSON" | "NIGHT_OWL" | "WEEKEND_WARRIOR" | "CONSISTENT_DAILY" | "BURST_LEARNER",
  confidence: number, // 0-1
  evidence: string,
): Promise<CoachMemory> {
  return storeMemory(userId, "STUDY_PATTERN", `Pattern: ${pattern}`, evidence, { pattern, confidence, detectedAt: Date.now() });
}

/**
 * Store user's preferred focus technique
 */
export async function storePreferredTechnique(
  userId: string,
  technique: "POMODORO" | "FLOWTIME" | "DEEP_WORK" | "52_17" | "CUSTOM",
  effectivenessScore: number, // 0-100
  context: string,
): Promise<CoachMemory> {
  return storeMemory(userId, "PREFERRED_TECHNIQUE", `Technique: ${technique}`, context, { technique, effectivenessScore, recordedAt: Date.now() });
}

/**
 * Store observed failure mode for personalized support
 */
export async function storeFailureMode(userId: string, failureType: "DISTRACTION" | "FATIGUE" | "OVERWHELM" | "LACK_OF_MOTIVATION" | "POOR_TIMING", context: string, suggestedIntervention: string): Promise<CoachMemory> {
  return storeMemory(userId, "FAILURE_MODE", `Challenge: ${failureType}`, context, { failureType, suggestedIntervention, occurredAt: Date.now() });
}

/**
 * Store optimal focus time observation
 */
export async function storeOptimalFocusTime(userId: string, dayOfWeek: string, hourRange: string, averageQuality: number, sampleSize: number): Promise<CoachMemory> {
  return storeMemory(userId, "OPTIMAL_FOCUS_TIME", `Peak: ${dayOfWeek} ${hourRange}`, `You average ${averageQuality.toFixed(0)}% quality during this time`, { dayOfWeek, hourRange, averageQuality, sampleSize, recordedAt: Date.now() });
}

/**
 * Store document milestone (pages read, sections completed)
 */
export async function storeDocumentMilestone(userId: string, documentId: string, documentName: string, milestoneType: "STARTED" | "HALFWAY" | "COMPLETED", progressPercent: number): Promise<CoachMemory> {
  const titles: Record<string, string> = {
    STARTED: `Started: ${documentName}`,
    HALFWAY: `Halfway: ${documentName}`,
    COMPLETED: `Finished: ${documentName}`,
  };

  return storeMemory(userId, "DOCUMENT_MILESTONE", titles[milestoneType], `${documentName} — ${progressPercent}% complete`, { documentId, documentName, milestoneType, progressPercent });
}

/**
 * Get user's study patterns
 */
export async function getStudyPatterns(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, "STUDY_PATTERN");
}

/**
 * Get user's preferred techniques
 */
export async function getPreferredTechniques(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, "PREFERRED_TECHNIQUE");
}

/**
 * Get user's observed failure modes
 */
export async function getFailureModes(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, "FAILURE_MODE");
}

/**
 * Get user's optimal focus times
 */
export async function getOptimalFocusTimes(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, "OPTIMAL_FOCUS_TIME");
}

/**
 * Store a new memory
 */
export async function storeMemory(userId: string, type: MemoryType, title: string, description: string, metadata: Record<string, unknown> = {}): Promise<CoachMemory> {
  const memory = await repoCreateMemory(userId, type, title, description, metadata);
  debug.info("[CoachMemory] Stored: %s for user %s", type, userId);
  return memory;
}

/**
 * Get all memories for user
 */
export async function getUserMemories(userId: string): Promise<CoachMemory[]> {
  return repoGetMemoriesByUser(userId);
}

/**
 * Get memories by type
 */
export async function getMemoriesByType(userId: string, type: MemoryType): Promise<CoachMemory[]> {
  return repoGetMemoriesByType(userId, type);
}

/**
 * Mark memory as referenced
 */
export async function markMemoryReferenced(memoryId: string): Promise<void> {
  await repoMarkMemoryReferenced(memoryId);
}

// ============================================================================
// Milestone Detection
// ============================================================================

/**
 * Check and store first S grade milestone
 */
export async function checkFirstSGrade(userId: string, sessionGrade: string, sessionQuality: number, sessionDate: number): Promise<CoachMemory | null> {
  if (sessionGrade !== "S") {
    return null;
  }

  // Check if already has S grade memory
  const existing = await getMemoriesByType(userId, "FIRST_S_GRADE");
  if (existing.length > 0) {
    return null;
  }

  return storeMemory(userId, "FIRST_S_GRADE", "First S-Grade Session", `Achieved first perfect S-grade session with ${sessionQuality}% quality`, { grade: sessionGrade, quality: sessionQuality, date: sessionDate });
}

/**
 * Check and store longest session milestone
 */
export async function checkLongestSession(userId: string, sessionDuration: number, previousBest: number): Promise<CoachMemory | null> {
  if (sessionDuration <= previousBest) {
    return null;
  }

  return storeMemory(userId, "LONGEST_SESSION", "Personal Best Session", `Completed longest session ever: ${sessionDuration} minutes`, { duration: sessionDuration, previousBest });
}

/**
 * Check and store best streak milestone
 */
export async function checkBestStreak(userId: string, currentStreak: number, previousBest: number): Promise<CoachMemory | null> {
  if (currentStreak <= previousBest) {
    return null;
  }

  return storeMemory(userId, "BEST_STREAK", `${currentStreak}-Day Streak Record`, `Achieved new personal best streak of ${currentStreak} days`, { streakDays: currentStreak, previousBest });
}

/**
 * Check and store first boss defeated
 * NOTE: Boss system being archived, but keeping for compatibility
 */
export async function checkFirstBossDefeated(userId: string, bossName: string, bossTier: number): Promise<CoachMemory | null> {
  const hasExisting = await repoHasMemoryOfType(userId, "FIRST_BOSS_DEFEATED");
  if (hasExisting) {
    return null;
  }

  return storeMemory(userId, "FIRST_BOSS_DEFEATED", `First Boss Defeated: ${bossName}`, `Defeated ${bossName} (Tier ${bossTier}) — your first boss victory!`, { bossName, bossTier });
}

/**
 * Check and store first rival win
 * NOTE: Rivals system being archived, but keeping for compatibility
 */
export async function checkFirstRivalWin(userId: string, rivalName: string, margin: number): Promise<CoachMemory | null> {
  const hasExisting = await repoHasMemoryOfType(userId, "FIRST_RIVAL_WIN");
  if (hasExisting) {
    return null;
  }

  return storeMemory(userId, "FIRST_RIVAL_WIN", "First Rival Victory", `Beat ${rivalName} by ${margin} minutes in weekly competition`, { rivalName, margin });
}

/**
 * Store onboarding goal
 */
export async function storeOnboardingGoal(userId: string, goal: string): Promise<CoachMemory> {
  return storeMemory(userId, "ONBOARDING_GOAL", "Your Goal", `You said you wanted to: ${goal}`, { goal });
}

// ============================================================================
// Memory Retrieval for Messages
// ============================================================================

/**
 * Get relevant memories for message context
 */
export async function getRelevantMemories(userId: string, category: MessageCategory, limit: number = 3): Promise<CoachMemory[]> {
  const allMemories = await getUserMemories(userId);

  // Score memories by relevance to category
  const scoredMemories = allMemories.map((memory) => {
    let score = 0;

    // Boost by recency (newer = more relevant)
    const daysSince = (Date.now() - memory.occurredAt) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSince);

    // Category-specific relevance
    switch (category) {
      case "STREAK_RISK":
        if (memory.type === "BEST_STREAK") {
          score += 10;
        }
        if (memory.type === "FIRST_S_GRADE") {
          score += 5;
        }
        break;
      case "SESSION_SUGGESTION":
        if (memory.type === "LONGEST_SESSION") {
          score += 10;
        }
        if (memory.type === "FIRST_S_GRADE") {
          score += 5;
        }
        break;
      case "MILESTONE_HYPE":
        if (memory.type.includes("MILESTONE") || memory.type.includes("FIRST")) {
          score += 10;
        }
        break;
      case "COMEBACK_SUPPORT":
        if (memory.type === "BEST_STREAK") {
          score += 8;
        }
        if (memory.type === "FIRST_S_GRADE") {
          score += 5;
        }
        break;
    }

    // Penalize over-referenced memories
    score -= memory.referencedCount * 2;

    return { memory, score };
  });

  // Sort by score and take top
  scoredMemories.sort((a, b) => b.score - a.score);

  const selected = scoredMemories.slice(0, limit).map((s) => s.memory);

  // Mark as referenced
  for (const memory of selected) {
    await markMemoryReferenced(memory.id);
  }

  return selected;
}

// ============================================================================
// Memory-Based Message Generation
// ============================================================================

/**
 * Generate message referencing memories
 */
export async function generateMemoryReferenceMessage(userId: string, category: MessageCategory, persona: "MENTOR" | "CHEERLEADER" | "DRILL_SERGEANT" = "MENTOR"): Promise<string | null> {
  const memories = await getRelevantMemories(userId, category, 2);

  if (memories.length === 0) {
    return null;
  }

  // Build message referencing memories
  const primaryMemory = memories[0];
  const daysSince = Math.floor((Date.now() - primaryMemory.occurredAt) / (1000 * 60 * 60 * 24));

  const templates: Record<string, Record<string, string>> = {
    MENTOR: {
      FIRST_S_GRADE: `You hit your first S grade ${daysSince} days ago — since then, you've earned ${memories.length > 1 ? "several more" : "another one"}. You're improving faster than you realize.`,
      LONGEST_SESSION: `Remember when you completed that ${primaryMemory.metadata.duration}-minute session ${daysSince} days ago? That was a breakthrough moment. You have that capacity within you.`,
      BEST_STREAK: `Your ${primaryMemory.metadata.streakDays}-day streak record still stands. You built that through consistency, not intensity. That's the path forward.`,
      FIRST_BOSS_DEFEATED: `Your first boss victory against ${primaryMemory.metadata.bossName} showed you what focused effort can accomplish. That same determination is available to you now.`,
      ONBOARDING_GOAL: `When you started, you said you wanted to ${primaryMemory.metadata.goal}. Let's look at how you're doing — you've made more progress than you might think.`,
    },
    CHEERLEADER: {
      FIRST_S_GRADE: `OMG! 🌟 You got your first S grade ${daysSince} days ago and you've been CRUSHING IT since! You've earned ${memories.length > 1 ? "even MORE" : "another one"}! Keep that momentum!`,
      LONGEST_SESSION: `Remember that EPIC ${primaryMemory.metadata.duration}-minute session?! 🔥 That was ${daysSince} days ago and you HAVEN'T forgotten how to focus! You've got this!`,
      BEST_STREAK: `Your ${primaryMemory.metadata.streakDays}-day streak LEGEND is still alive! 🏆 You built that through showing up every day! That's the champion spirit!`,
      FIRST_BOSS_DEFEATED: `Your first boss takedown of ${primaryMemory.metadata.bossName}?! 👑 That was AMAZING! You have that SAME POWER right now! Use it!`,
      ONBOARDING_GOAL: `You told me you wanted to ${primaryMemory.metadata.goal} — and LOOK AT YOU GO! 🎉 You're making it happen! I'm so proud!`,
    },
    DRILL_SERGEANT: {
      FIRST_S_GRADE: `You got your first S grade ${daysSince} days ago. What happened since? Complacency. You were capable of excellence then, and you're capable now. PROVE IT.`,
      LONGEST_SESSION: `${primaryMemory.metadata.duration} minutes. That was your record. Set ${daysSince} days ago. Pathetic that you haven't beaten it. TODAY IS THE DAY.`,
      BEST_STREAK: `${primaryMemory.metadata.streakDays} days. That was your best. You had discipline then. Where is it now? Find it. Or admit you're weak.`,
      FIRST_BOSS_DEFEATED: `${primaryMemory.metadata.bossName} went down because you had FOCUS. Now you make excuses. Enough. Get back to work.`,
      ONBOARDING_GOAL: `You said you'd ${primaryMemory.metadata.goal}. Words are easy. Actions are hard. Which are you choosing today?`,
    },
  };

  const message = templates[persona][primaryMemory.type];
  return message || null;
}

/**
 * Get user's onboarding goal
 */
export async function getOnboardingGoal(userId: string): Promise<string | null> {
  const memories = await getMemoriesByType(userId, "ONBOARDING_GOAL");
  if (memories.length === 0) {
    return null;
  }

  // Get most recent
  const sorted = memories.sort((a, b) => b.occurredAt - a.occurredAt);
  return sorted[0].metadata.goal as string;
}

/**
 * Get milestone summary for progress tracking
 */
export async function getMilestoneSummary(userId: string): Promise<{
  totalMemories: number;
  mostRecent: CoachMemory | null;
  favoriteType: MemoryType | null;
  streakOfSGrades: number;
}> {
  const memories = await getUserMemories(userId);

  if (memories.length === 0) {
    return {
      totalMemories: 0,
      mostRecent: null,
      favoriteType: null,
      streakOfSGrades: 0,
    };
  }

  // Most recent
  const sorted = memories.sort((a, b) => b.occurredAt - a.occurredAt);
  const mostRecent = sorted[0];

  // Favorite type
  const typeCounts = memories.reduce(
    (acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0] as MemoryType;

  // Count S-grade memories
  const sGradeCount = memories.filter((m) => m.type === "FIRST_S_GRADE" || m.metadata.grade === "S").length;

  return {
    totalMemories: memories.length,
    mostRecent,
    favoriteType,
    streakOfSGrades: sGradeCount,
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  storeMemory,
  getUserMemories,
  getMemoriesByType,
  markMemoryReferenced,
  checkFirstSGrade,
  checkLongestSession,
  checkBestStreak,
  checkFirstBossDefeated,
  checkFirstRivalWin,
  storeOnboardingGoal,
  getRelevantMemories,
  generateMemoryReferenceMessage,
  getOnboardingGoal,
  getMilestoneSummary,
  // Phase 1: Memory Deepening
  storeStudyPattern,
  storePreferredTechnique,
  storeFailureMode,
  storeOptimalFocusTime,
  storeDocumentMilestone,
  getStudyPatterns,
  getPreferredTechniques,
  getFailureModes,
  getOptimalFocusTimes,
};
