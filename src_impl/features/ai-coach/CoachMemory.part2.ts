import type { CoachMessage, MessageCategory } from "./types";
import { createDebugger } from "../../utils/debug";
import { createMemory as repoCreateMemory, getMemoriesByUser as repoGetMemoriesByUser, getMemoriesByType as repoGetMemoriesByType, markMemoryReferenced as repoMarkMemoryReferenced, hasMemoryOfType as repoHasMemoryOfType, getMostRecentMemoryByType as repoGetMostRecentMemoryByType } from "./repository/memories";


export async function generateMemoryReferenceMessage(userId: string, category: MessageCategory, persona: 'MENTOR' | 'CHEERLEADER' | 'DRILL_SERGEANT' = 'MENTOR'): Promise<string | null> {
  const memories = await getRelevantMemories(userId, category, 2);

  if (memories.length === 0) {
    return null;
  }

  // Build message referencing memories
  const primaryMemory = memories[0];
  const daysSince = Math.floor((Date.now() - primaryMemory.occurredAt) / (1000 * 60 * 60 * 24));

  const templates: Record<string, Record<string, string>> = {
    MENTOR: {
      FIRST_S_GRADE: `You hit your first S grade ${daysSince} days ago — since then, you've earned ${memories.length > 1 ? 'several more' : 'another one'}. You're improving faster than you realize.`,
      LONGEST_SESSION: `Remember when you completed that ${primaryMemory.metadata.duration}-minute session ${daysSince} days ago? That was a breakthrough moment. You have that capacity within you.`,
      BEST_STREAK: `Your ${primaryMemory.metadata.streakDays}-day streak record still stands. You built that through consistency, not intensity. That's the path forward.`,
      FIRST_BOSS_DEFEATED: `Your first boss victory against ${primaryMemory.metadata.bossName} showed you what focused effort can accomplish. That same determination is available to you now.`,
      ONBOARDING_GOAL: `When you started, you said you wanted to ${primaryMemory.metadata.goal}. Let's look at how you're doing — you've made more progress than you might think.`,
    },
    CHEERLEADER: {
      FIRST_S_GRADE: `OMG! 🌟 You got your first S grade ${daysSince} days ago and you've been CRUSHING IT since! You've earned ${memories.length > 1 ? 'even MORE' : 'another one'}! Keep that momentum!`,
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

export async function getOnboardingGoal(userId: string): Promise<string | null> {
  const memories = await getMemoriesByType(userId, 'ONBOARDING_GOAL');
  if (memories.length === 0) {
    return null;
  }

  // Get most recent
  const sorted = memories.sort((a, b) => b.occurredAt - a.occurredAt);
  return sorted[0].metadata.goal as string;
}

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
  const sGradeCount = memories.filter((m) => m.type === 'FIRST_S_GRADE' || m.metadata.grade === 'S').length;

  return {
    totalMemories: memories.length,
    mostRecent,
    favoriteType,
    streakOfSGrades: sGradeCount,
  };
}