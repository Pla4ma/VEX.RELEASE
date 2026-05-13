import type { CoachMessage, MessageCategory } from "./types";
import { createDebugger } from "../../utils/debug";
import { createMemory as repoCreateMemory, getMemoriesByUser as repoGetMemoriesByUser, getMemoriesByType as repoGetMemoriesByType, markMemoryReferenced as repoMarkMemoryReferenced, hasMemoryOfType as repoHasMemoryOfType, getMostRecentMemoryByType as repoGetMostRecentMemoryByType } from "./repository/memories";


export async function storeStudyPattern(
  userId: string,
  pattern: 'MORNING_PERSON' | 'NIGHT_OWL' | 'WEEKEND_WARRIOR' | 'CONSISTENT_DAILY' | 'BURST_LEARNER',
  confidence: number, // 0-1
  evidence: string,
): Promise<CoachMemory> {
  return storeMemory(userId, 'STUDY_PATTERN', `Pattern: ${pattern}`, evidence, { pattern, confidence, detectedAt: Date.now() });
}

export async function storePreferredTechnique(
  userId: string,
  technique: 'POMODORO' | 'FLOWTIME' | 'DEEP_WORK' | '52_17' | 'CUSTOM',
  effectivenessScore: number, // 0-100
  context: string,
): Promise<CoachMemory> {
  return storeMemory(userId, 'PREFERRED_TECHNIQUE', `Technique: ${technique}`, context, { technique, effectivenessScore, recordedAt: Date.now() });
}

export async function storeFailureMode(userId: string, failureType: 'DISTRACTION' | 'FATIGUE' | 'OVERWHELM' | 'LACK_OF_MOTIVATION' | 'POOR_TIMING', context: string, suggestedIntervention: string): Promise<CoachMemory> {
  return storeMemory(userId, 'FAILURE_MODE', `Challenge: ${failureType}`, context, { failureType, suggestedIntervention, occurredAt: Date.now() });
}

export async function storeOptimalFocusTime(userId: string, dayOfWeek: string, hourRange: string, averageQuality: number, sampleSize: number): Promise<CoachMemory> {
  return storeMemory(userId, 'OPTIMAL_FOCUS_TIME', `Peak: ${dayOfWeek} ${hourRange}`, `You average ${averageQuality.toFixed(0)}% quality during this time`, { dayOfWeek, hourRange, averageQuality, sampleSize, recordedAt: Date.now() });
}

export async function storeDocumentMilestone(userId: string, documentId: string, documentName: string, milestoneType: 'STARTED' | 'HALFWAY' | 'COMPLETED', progressPercent: number): Promise<CoachMemory> {
  const titles: Record<string, string> = {
    STARTED: `Started: ${documentName}`,
    HALFWAY: `Halfway: ${documentName}`,
    COMPLETED: `Finished: ${documentName}`,
  };

  return storeMemory(userId, 'DOCUMENT_MILESTONE', titles[milestoneType], `${documentName} — ${progressPercent}% complete`, { documentId, documentName, milestoneType, progressPercent });
}

export async function getStudyPatterns(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, 'STUDY_PATTERN');
}

export async function getPreferredTechniques(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, 'PREFERRED_TECHNIQUE');
}

export async function getFailureModes(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, 'FAILURE_MODE');
}

export async function getOptimalFocusTimes(userId: string): Promise<CoachMemory[]> {
  return getMemoriesByType(userId, 'OPTIMAL_FOCUS_TIME');
}

export async function storeMemory(userId: string, type: MemoryType, title: string, description: string, metadata: Record<string, unknown> = {}): Promise<CoachMemory> {
  const memory = await repoCreateMemory(userId, type, title, description, metadata);
  debug.info('[CoachMemory] Stored: %s for user %s', type, userId);
  return memory;
}

export async function getUserMemories(userId: string): Promise<CoachMemory[]> {
  return repoGetMemoriesByUser(userId);
}

export async function getMemoriesByType(userId: string, type: MemoryType): Promise<CoachMemory[]> {
  return repoGetMemoriesByType(userId, type);
}

export async function markMemoryReferenced(memoryId: string): Promise<void> {
  await repoMarkMemoryReferenced(memoryId);
}

export async function checkFirstSGrade(userId: string, sessionGrade: string, sessionQuality: number, sessionDate: number): Promise<CoachMemory | null> {
  if (sessionGrade !== 'S') {
    return null;
  }

  // Check if already has S grade memory
  const existing = await getMemoriesByType(userId, 'FIRST_S_GRADE');
  if (existing.length > 0) {
    return null;
  }

  return storeMemory(userId, 'FIRST_S_GRADE', 'First S-Grade Session', `Achieved first perfect S-grade session with ${sessionQuality}% quality`, { grade: sessionGrade, quality: sessionQuality, date: sessionDate });
}

export async function checkLongestSession(userId: string, sessionDuration: number, previousBest: number): Promise<CoachMemory | null> {
  if (sessionDuration <= previousBest) {
    return null;
  }

  return storeMemory(userId, 'LONGEST_SESSION', 'Personal Best Session', `Completed longest session ever: ${sessionDuration} minutes`, { duration: sessionDuration, previousBest });
}

export async function checkBestStreak(userId: string, currentStreak: number, previousBest: number): Promise<CoachMemory | null> {
  if (currentStreak <= previousBest) {
    return null;
  }

  return storeMemory(userId, 'BEST_STREAK', `${currentStreak}-Day Streak Record`, `Achieved new personal best streak of ${currentStreak} days`, { streakDays: currentStreak, previousBest });
}

export async function checkFirstBossDefeated(userId: string, bossName: string, bossTier: number): Promise<CoachMemory | null> {
  const hasExisting = await repoHasMemoryOfType(userId, 'FIRST_BOSS_DEFEATED');
  if (hasExisting) {
    return null;
  }

  return storeMemory(userId, 'FIRST_BOSS_DEFEATED', `First Boss Defeated: ${bossName}`, `Defeated ${bossName} (Tier ${bossTier}) — your first boss victory!`, { bossName, bossTier });
}

export async function checkFirstRivalWin(userId: string, rivalName: string, margin: number): Promise<CoachMemory | null> {
  const hasExisting = await repoHasMemoryOfType(userId, 'FIRST_RIVAL_WIN');
  if (hasExisting) {
    return null;
  }

  return storeMemory(userId, 'FIRST_RIVAL_WIN', 'First Rival Victory', `Beat ${rivalName} by ${margin} minutes in weekly competition`, { rivalName, margin });
}

export async function storeOnboardingGoal(userId: string, goal: string): Promise<CoachMemory> {
  return storeMemory(userId, 'ONBOARDING_GOAL', 'Your Goal', `You said you wanted to: ${goal}`, { goal });
}

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
      case 'STREAK_RISK':
        if (memory.type === 'BEST_STREAK') {
          score += 10;
        }
        if (memory.type === 'FIRST_S_GRADE') {
          score += 5;
        }
        break;
      case 'SESSION_SUGGESTION':
        if (memory.type === 'LONGEST_SESSION') {
          score += 10;
        }
        if (memory.type === 'FIRST_S_GRADE') {
          score += 5;
        }
        break;
      case 'MILESTONE_HYPE':
        if (memory.type.includes('MILESTONE') || memory.type.includes('FIRST')) {
          score += 10;
        }
        break;
      case 'COMEBACK_SUPPORT':
        if (memory.type === 'BEST_STREAK') {
          score += 8;
        }
        if (memory.type === 'FIRST_S_GRADE') {
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