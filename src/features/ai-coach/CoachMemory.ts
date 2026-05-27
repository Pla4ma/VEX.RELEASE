import { createDebugger } from "../../utils/debug";
import {
  createMemory as repoCreateMemory,
  getMemoriesByUser as repoGetMemoriesByUser,
  getMemoriesByType as repoGetMemoriesByType,
  markMemoryReferenced as repoMarkMemoryReferenced,
  deleteMemory as repoDeleteMemory,
} from "./repository/memories";
import {
  MemoryTypeSchema,
  type CoachMemory,
  type MemoryType,
} from "./memory-schemas";

const debug = createDebugger("ai-coach:memory");

export type { CoachMemory, MemoryType };

export {
  storeStudyPattern,
  storePreferredTechnique,
  storeFailureMode,
  storeOptimalFocusTime,
  storeDocumentMilestone,
  getStudyPatterns,
  getPreferredTechniques,
  getFailureModes,
  getOptimalFocusTimes,
} from "./memory-patterns";

export {
  checkFirstSGrade,
  checkLongestSession,
  checkBestStreak,
  checkFirstBossDefeated,
  checkFirstRivalWin,
} from "./memory-milestones";

export { generateMemoryReferenceMessage } from "./memory-reference-message";

export {
  hashEvidence,
  buildColdStartEvidence,
  buildMemoryEvidence,
  generateRecommendationEvidence,
  canClaimStrongPattern,
} from "./coach-memory-evidence";

export {
  getRelevantMemories,
  getOnboardingGoal,
  getMilestoneSummary,
} from "./coach-memory-queries";

export interface UserMilestones {
  firstSGrade: CoachMemory | null;
  longestSession: CoachMemory | null;
  bestStreak: CoachMemory | null;
  firstBossDefeated: CoachMemory | null;
  firstRivalWin: CoachMemory | null;
  onboardingGoal: string | null;
  recentAchievements: CoachMemory[];
  studyPatterns: CoachMemory[];
  preferredTechniques: CoachMemory[];
  failureModes: CoachMemory[];
}

export async function storeMemory(
  userId: string,
  type: MemoryType,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {},
): Promise<CoachMemory> {
  const memory = await repoCreateMemory(
    userId,
    type,
    title,
    description,
    metadata,
  );
  debug.info("[CoachMemory] Stored: %s for user %s", type, userId);
  return memory;
}

export async function getUserMemories(userId: string): Promise<CoachMemory[]> {
  try {
    return await repoGetMemoriesByUser(userId);
  } catch (error) {
    debug.warn(
      "[CoachMemory] Failed to fetch memories, returning empty:",
      error,
    );
    return [];
  }
}

export async function getMemoriesByType(
  userId: string,
  type: MemoryType,
): Promise<CoachMemory[]> {
  try {
    return await repoGetMemoriesByType(userId, type);
  } catch (error) {
    debug.warn(
      "[CoachMemory] Failed to fetch memories by type, returning empty:",
      error,
    );
    return [];
  }
}

export async function markMemoryReferenced(memoryId: string): Promise<void> {
  try {
    await repoMarkMemoryReferenced(memoryId);
  } catch (error) {
    debug.warn("[CoachMemory] Failed to mark memory referenced:", error);
  }
}

export async function storeOnboardingGoal(
  userId: string,
  goal: string,
): Promise<CoachMemory> {
  return storeMemory(
    userId,
    "ONBOARDING_GOAL",
    "Your Goal",
    `You said you wanted to: ${goal}`,
    {
      goal,
    },
  );
}

export async function softDeleteMemory(memoryId: string): Promise<void> {
  try {
    await repoDeleteMemory(memoryId);
  } catch (error) {
    debug.warn("[CoachMemory] Failed to soft delete memory:", error);
    throw error;
  }
}

const SENSITIVE_MEMORY_TYPES: MemoryType[] = [
  "DOCUMENT_MILESTONE",
  "STUDY_PATTERN",
];

export function isSensitiveMemoryType(type: MemoryType): boolean {
  return SENSITIVE_MEMORY_TYPES.includes(type);
}

export function scopeMemoryForContext(
  memory: CoachMemory,
  context: "generic_coach" | "task_specific" | "premium",
): { usable: boolean; scopedMessage?: string } {
  if (context === "task_specific") {
    return { usable: true };
  }
  if (
    isSensitiveMemoryType(memory.type) &&
    memory.metadata.source === "import"
  ) {
    return { usable: false };
  }
  return { usable: true };
}
