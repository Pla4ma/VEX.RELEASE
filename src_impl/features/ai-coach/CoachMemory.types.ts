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
    studyPatterns: CoachMemory[];
    preferredTechniques: CoachMemory[];
    failureModes: CoachMemory[];
}

export type MemoryType = | 'FIRST_S_GRADE'
      | 'LONGEST_SESSION'
      | 'BEST_STREAK'
      | 'FIRST_BOSS_DEFEATED'
      | 'FIRST_RIVAL_WIN'
      | 'LEVEL_UP'
      | 'STREAK_MILESTONE'
      | 'PERFECT_SESSION'
      | 'ONBOARDING_GOAL'
      | 'SESSION_COUNT_MILESTONE'
      // Phase 1: Memory Deepening
      | 'STUDY_PATTERN'
      | 'PREFERRED_TECHNIQUE'
      | 'FAILURE_MODE'
      | 'OPTIMAL_FOCUS_TIME'
      | 'DOCUMENT_MILESTONE';
