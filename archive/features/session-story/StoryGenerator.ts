import { eventBus } from '@/events';
import { createDebugger } from '@/utils/debug';
import { v4 } from '@/utils/uuid';
import type { StreakEngineResult } from '@/features/streaks/schemas';
import { calculateStory } from './StoryBeatCalculator';
import * as storyRepository from './repository';
import { trackStoryEvent } from './story-analytics';
import {
  SessionStorySchema,
  GenerateStoryInputSchema,
  type SessionStory,
  type GenerateStoryInput,
} from './schemas';

const debug = createDebugger('session-story:generator');

async function generateSessionStory(context: {
  sessionId: string;
  userId: string;
  sessionSummary: {
    actualDuration: number;
    effectiveDuration: number;
    focusQuality: number;
    focusPurityScore?: number;
    interruptions: number;
    pauses: number;
    streakDays: number;
    streakMaintained: boolean;
    sessionMode: string;
    completionPercentage: number;
    finalScore: number;
  };
  bossContext?: {
    encounter: { id?: string; bossName?: string; healthRemaining?: number; maxHealth?: number } | null;
    damageDealt: number;
    defeated: boolean;
  };
  streakResult?: Omit<StreakEngineResult, 'shieldUsed'> & { shieldUsed: boolean };
  xpEarned: number;
  currentLevel: number;
  xpToNextLevel: number;
  tierProgress: number;
  sessionsToNextTier: number;
}): Promise<SessionStory | null> {
  const input: GenerateStoryInput = {
    sessionId: context.sessionId,
    userId: context.userId,
    sessionSummary: {
      duration: context.sessionSummary.actualDuration,
      effectiveDuration: context.sessionSummary.effectiveDuration,
      focusQuality: context.sessionSummary.focusQuality ?? 0,
      focusPurityScore: context.sessionSummary.focusPurityScore,
      interruptions: context.sessionSummary.interruptions ?? 0,
      pauses: context.sessionSummary.pauses ?? 0,
      streakDays: context.sessionSummary.streakDays ?? 0,
      streakMaintained: context.sessionSummary.streakMaintained ?? true,
      sessionMode: context.sessionSummary.sessionMode ?? 'STANDARD',
      completionPercentage: context.sessionSummary.completionPercentage ?? 100,
      finalScore: context.sessionSummary.finalScore ?? 0,
    },
    bossContext: context.bossContext
      ? {
          encounterId: context.bossContext.encounter?.id,
          bossName: context.bossContext.encounter?.bossName,
          damageDealt: context.bossContext.damageDealt,
          healthRemaining: context.bossContext.encounter?.healthRemaining,
          maxHealth: context.bossContext.encounter?.maxHealth,
          defeated: context.bossContext.defeated,
        }
      : undefined,
    streakContext: {
      previousStreak: context.streakResult?.previousStreak ?? 0,
      newStreak: context.streakResult?.newStreak ?? context.sessionSummary.streakDays ?? 0,
      isMilestone: context.streakResult?.milestoneReached !== null,
      milestoneDay: context.streakResult?.milestoneReached?.days,
      wasProtected: context.streakResult?.shieldUsed ?? false,
      isComeback:
        context.streakResult?.action === 'BROKEN' &&
        context.streakResult?.newStreak === 1 &&
        context.streakResult?.previousStreak > 0,
      daysAbsent: 0,
    },
    progressionContext: {
      xpEarned: context.xpEarned,
      currentLevel: context.currentLevel,
      xpToNextLevel: context.xpToNextLevel,
      tierProgress: context.tierProgress,
      sessionsToNextTier: context.sessionsToNextTier,
    },
  };

  const validated = GenerateStoryInputSchema.safeParse(input);
  if (!validated.success) {
    debug.error('Invalid story input:', validated.error);
    return null;
  }

  const calculated = calculateStory(validated.data);

  const story: SessionStory = {
    id: v4(),
    sessionId: context.sessionId,
    userId: context.userId,
    createdAt: Date.now(),
    title: calculated.title,
    subtitle: calculated.subtitle,
    overallEmotion: calculated.overallEmotion,
    beats: calculated.beats,
    totalBeats: calculated.beats.length,
    sessionContext: {
      durationMinutes: Math.round(context.sessionSummary.effectiveDuration / 60000),
      focusScore: context.sessionSummary.focusQuality ?? 0,
      streakDays:
        calculated.beats.find(
          (b) => b.type === 'STREAK_MOMENT' || b.type === 'MILESTONE_REACHED',
        )?.metadata?.value ?? 0,
      interruptions: context.sessionSummary.interruptions ?? 0,
      pauses: context.sessionSummary.pauses ?? 0,
      sessionMode: context.sessionSummary.sessionMode ?? 'STANDARD',
      bossDamageDealt: context.bossContext?.damageDealt ?? 0,
      bossDefeated: context.bossContext?.defeated ?? false,
      milestoneReached: calculated.beats.find(
        (b) => b.type === 'MILESTONE_REACHED',
      )?.metadata?.value,
      xpEarned: context.xpEarned,
      isPerfectSession:
        context.sessionSummary.interruptions === 0 &&
        context.sessionSummary.pauses === 0,
      isComeback: calculated.beats.some((b) => b.type === 'COMEBACK_TRIUMPH'),
      daysAbsent:
        calculated.beats.find((b) => b.type === 'COMEBACK_TRIUMPH')?.metadata?.value ?? 0,
    },
    nextSessionHooks: calculated.nextSessionHooks,
    viewedAt: null,
    sharedAt: null,
    completionRate: 0,
  };

  const validatedStory = SessionStorySchema.safeParse(story);
  if (!validatedStory.success) {
    debug.error('Generated invalid story:', validatedStory.error);
    return null;
  }

  return validatedStory.data;
}

export interface StoryGeneratorContext {
  sessionId: string;
  userId: string;
  sessionSummary: {
    actualDuration: number;
    effectiveDuration: number;
    focusQuality: number;
    focusPurityScore?: number;
    interruptions: number;
    pauses: number;
    streakDays: number;
    streakMaintained: boolean;
    sessionMode: string;
    completionPercentage: number;
    finalScore: number;
  };
  bossContext?: {
    encounter: { id?: string; bossName?: string; healthRemaining?: number; maxHealth?: number } | null;
    damageDealt: number;
    defeated: boolean;
  };
  streakResult?: Omit<StreakEngineResult, 'shieldUsed'> & { shieldUsed: boolean };
  xpEarned: number;
  currentLevel: number;
  xpToNextLevel: number;
  tierProgress: number;
  sessionsToNextTier: number;
}

export async function generateStoryForCompletedSession(
  context: StoryGeneratorContext,
): Promise<SessionStory | null> {
  const story = await generateSessionStory(context);
  if (story) {
    await storyRepository.saveStory(story);
    eventBus.publish('session:story:ready', {
      storyId: story.id,
      sessionId: context.sessionId,
      userId: context.userId,
      title: story.title,
      beatCount: story.totalBeats,
    });
    trackStoryEvent({
      storyId: story.id,
      userId: context.userId,
      eventType: 'STORY_STARTED',
      timestamp: Date.now(),
    });
    debug.info('Story generated and saved: %s', story.id);
  }
  return story;
}
