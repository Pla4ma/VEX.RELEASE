/**
 * Story Beat Calculator
 *
 * Transforms raw session data into emotional narrative beats.
 * The heart of the story generation - determines WHAT to tell.
 *
 * Features:
 * - Pattern matching for story moments
 * - Priority-based beat ordering
 * - Emotional arc calculation
 * - Context-aware narrative selection
 */

import { createDebugger } from '@/utils/debug';
import type { StoryBeat, StoryBeatType, EmotionalArc, GenerateStoryInput } from './schemas';
import { STORY_BEAT_DURATIONS, STORY_PRIORITIES } from './schemas';

const debug = createDebugger('session-story:calculator');

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Beat Templates
// ============================================================================

const BEAT_TEMPLATES: BeatCandidate[] = [
  // ==========================================================================
  // OPENING - Always first
  // ==========================================================================
  {
    type: 'OPENING',
    priority: STORY_PRIORITIES.OPENING,
    condition: () => true, // Always included
    generator: (input) => {
      const duration = input.sessionSummary.duration / 60000;
      const mood = getEntryMood(input.sessionSummary.focusQuality);

      const headlines: Record<string, string> = {
        FOCUSED: 'You entered with clarity.',
        SCATTERED: 'You began amidst chaos.',
        DETERMINED: 'You stepped in ready.',
        RELUCTANT: 'You showed up anyway.',
      };

      return {
        type: 'OPENING',
        headline: headlines[mood] ?? 'You began your journey.',
        subtext: duration >= 45 ? `A ${Math.round(duration)}-minute commitment awaited.` : duration >= 25 ? '25 minutes of pure focus ahead.' : 'A focused sprint begins.',
        emotion: mood === 'DETERMINED' ? 'DETERMINATION' : mood === 'FOCUSED' ? 'MASTERY' : 'RESILIENCE',
        visualCue: 'NONE',
        durationMs: STORY_BEAT_DURATIONS.QUICK,
        hapticPattern: 'LIGHT',
      };
    },
  },

  // ==========================================================================
  // PERFECTION MOMENT - Zero interruptions
  // ==========================================================================
  {
    type: 'PERFECTION_MOMENT',
    priority: STORY_PRIORITIES.PERFECTION_MOMENT,
    condition: (input) => input.sessionSummary.interruptions === 0 && input.sessionSummary.pauses === 0 && input.sessionSummary.focusQuality >= 90,
    generator: (input) => {
      const isExtended = input.sessionSummary.duration >= 45 * 60000;

      return {
        type: 'PERFECTION_MOMENT',
        headline: isExtended ? 'Pure mastery. Not a single distraction.' : 'Zero interruptions. Complete flow.',
        subtext: isExtended ? `For ${Math.round(input.sessionSummary.duration / 60000)} minutes, the world faded away.` : 'You and the task became one.',
        emotion: 'MASTERY',
        visualCue: 'CELEBRATION',
        durationMs: STORY_BEAT_DURATIONS.DRAMATIC,
        hapticPattern: 'CELEBRATION',
        metadata: {
          comparison: input.sessionSummary.duration >= 3600000 ? 'hour-long perfection' : 'flawless execution',
        },
      };
    },
  },

  // ==========================================================================
  // BOSS DEFEAT - Ultimate triumph
  // ==========================================================================
  {
    type: 'BOSS_BATTLE',
    priority: STORY_PRIORITIES.BOSS_DEFEAT,
    condition: (input) => input.bossContext?.defeated === true,
    generator: (input) => ({
      type: 'BOSS_BATTLE',
      headline: `You defeated ${input.bossContext?.bossName ?? 'the boss'}!`,
      subtext: input.bossContext && input.bossContext.damageDealt > 100 ? `Dealt ${input.bossContext.damageDealt} damage in a single strike.` : 'Victory belongs to the focused.',
      emotion: 'TRIUMPH',
      visualCue: 'BOSS_DAMAGE',
      durationMs: STORY_BEAT_DURATIONS.CELEBRATION,
      hapticPattern: 'CELEBRATION',
      metadata: {
        value: input.bossContext?.damageDealt,
      },
    }),
  },

  // ==========================================================================
  // BOSS DAMAGE - Combat moment (no defeat)
  // ==========================================================================
  {
    type: 'BOSS_BATTLE',
    priority: STORY_PRIORITIES.BOSS_BATTLE,
    condition: (input) => input.bossContext !== undefined && input.bossContext.damageDealt > 0 && !input.bossContext.defeated,
    generator: (input) => {
      const damage = input.bossContext?.damageDealt ?? 0;
      const healthRemaining = input.bossContext?.healthRemaining ?? 0;
      const maxHealth = input.bossContext?.maxHealth ?? 100;
      const percentHealth = (healthRemaining / maxHealth) * 100;

      let headline: string;
      let subtext: string;

      if (percentHealth <= 25) {
        headline = 'The boss is nearly defeated!';
        subtext = 'One more focused session should finish them.';
      } else if (percentHealth <= 50) {
        headline = "You broke the boss's shield.";
        subtext = 'The tide turns in your favor.';
      } else {
        headline = 'You struck true.';
        subtext = `${damage} damage dealt to ${input.bossContext?.bossName ?? 'the boss'}.`;
      }

      return {
        type: 'BOSS_BATTLE',
        headline,
        subtext,
        emotion: percentHealth <= 25 ? 'ANTICIPATION' : 'DETERMINATION',
        visualCue: 'BOSS_DAMAGE',
        durationMs: STORY_BEAT_DURATIONS.STANDARD,
        hapticPattern: 'HEAVY',
        metadata: {
          value: damage,
          context: `${Math.round(percentHealth)}% health remains`,
        },
      };
    },
  },

  // ==========================================================================
  // MILESTONE REACHED - Major streak achievement
  // ==========================================================================
  {
    type: 'MILESTONE_REACHED',
    priority: STORY_PRIORITIES.MILESTONE_REACHED,
    condition: (input) => input.streakContext.isMilestone === true,
    generator: (input) => {
      const day = input.streakContext.milestoneDay ?? input.streakContext.newStreak;
      const milestoneNames: Record<number, string> = {
        3: 'First Flame',
        7: 'Week Warrior',
        14: 'Fortnight Focus',
        30: 'Monthly Master',
        60: 'Dedication Defined',
        100: 'Century Champion',
        180: 'Half-Year Hero',
        365: 'Year of Power',
      };

      return {
        type: 'MILESTONE_REACHED',
        headline: `Day ${day}: ${milestoneNames[day] ?? 'Milestone Achieved'}`,
        subtext: day >= 30 ? `Only ${Math.floor((365 - day) / 30)} months to a full year.` : day >= 7 ? "You're building something remarkable." : 'The foundation is set. Keep building.',
        emotion: day >= 30 ? 'WONDER' : 'TRIUMPH',
        visualCue: 'BADGE_SHINE',
        durationMs: STORY_BEAT_DURATIONS.CELEBRATION,
        hapticPattern: 'CELEBRATION',
        metadata: {
          value: day,
          comparison: day >= 100 ? 'legendary' : day >= 30 ? 'exceptional' : 'strong',
        },
      };
    },
  },

  // ==========================================================================
  // COMEBACK TRIUMPH - Return after absence
  // ==========================================================================
  {
    type: 'COMEBACK_TRIUMPH',
    priority: STORY_PRIORITIES.COMEBACK_TRIUMPH,
    condition: (input) => input.streakContext.isComeback === true,
    generator: (input) => {
      const daysAbsent = input.streakContext.daysAbsent;

      return {
        type: 'COMEBACK_TRIUMPH',
        headline: daysAbsent >= 7 ? 'You returned. Stronger than before.' : "Welcome back. Let's continue.",
        subtext: daysAbsent >= 7 ? `After ${daysAbsent} days away, you chose to begin again.` : 'The break is over. Your streak is reborn.',
        emotion: 'RESILIENCE',
        visualCue: 'SHIELD_PROTECTION',
        durationMs: STORY_BEAT_DURATIONS.DRAMATIC,
        hapticPattern: 'MEDIUM',
        metadata: {
          value: daysAbsent,
          comparison: 'comeback story',
        },
      };
    },
  },

  // ==========================================================================
  // STREAK MOMENT - Protected or continued
  // ==========================================================================
  {
    type: 'STREAK_MOMENT',
    priority: STORY_PRIORITIES.STREAK_MOMENT,
    condition: (input) => input.streakContext.newStreak > 0 && !input.streakContext.isMilestone && !input.streakContext.isComeback,
    generator: (input) => {
      const newStreak = input.streakContext.newStreak;
      const wasProtected = input.streakContext.wasProtected;

      if (wasProtected) {
        return {
          type: 'STREAK_MOMENT',
          headline: 'Your streak shield held.',
          subtext: `Day ${newStreak} protected. Some streaks are worth fighting for.`,
          emotion: 'RELIEF',
          visualCue: 'SHIELD_PROTECTION',
          durationMs: STORY_BEAT_DURATIONS.STANDARD,
          hapticPattern: 'SUCCESS',
          metadata: {
            value: newStreak,
            context: 'shield protected',
          },
        };
      }

      // Streak continued normally
      const nextMilestone = [3, 7, 14, 30, 60, 100, 180, 365].find((d) => d > newStreak);
      const daysToMilestone = nextMilestone ? nextMilestone - newStreak : null;

      return {
        type: 'STREAK_MOMENT',
        headline: `Streak protected. Day ${newStreak}.`,
        subtext: daysToMilestone && daysToMilestone <= 3 ? `${daysToMilestone} day${daysToMilestone === 1 ? '' : 's'} from your next milestone.` : 'Each day builds the next.',
        emotion: newStreak >= 7 ? 'MASTERY' : 'DETERMINATION',
        visualCue: 'STREAK_FLAME',
        durationMs: STORY_BEAT_DURATIONS.STANDARD,
        hapticPattern: 'LIGHT',
        metadata: {
          value: newStreak,
          context: daysToMilestone ? `${daysToMilestone} to next` : 'maintained',
        },
      };
    },
  },

  // ==========================================================================
  // FOCUS JOURNEY - The core session description
  // ==========================================================================
  {
    type: 'FOCUS_JOURNEY',
    priority: STORY_PRIORITIES.FOCUS_JOURNEY,
    condition: (input) => input.sessionSummary.duration >= 15 * 60000, // 15+ min
    generator: (input) => {
      const duration = Math.round(input.sessionSummary.effectiveDuration / 60000);
      const quality = input.sessionSummary.focusQuality;

      let headline: string;
      let emotion: EmotionalArc;

      if (quality >= 90) {
        headline = `You stayed focused for ${duration} minutes.`;
        emotion = 'MASTERY';
      } else if (quality >= 75) {
        headline = `Deep focus for ${duration} minutes.`;
        emotion = 'TRIUMPH';
      } else if (quality >= 60) {
        headline = `You stayed with it for ${duration} minutes.`;
        emotion = 'DETERMINATION';
      } else {
        headline = `You kept going for ${duration} minutes.`;
        emotion = 'RESILIENCE';
      }

      return {
        type: 'FOCUS_JOURNEY',
        headline,
        subtext: quality >= 80 ? `Quality score: ${Math.round(quality)}%` : 'Some sessions are about showing up.',
        emotion,
        visualCue: 'PROGRESS_BAR',
        durationMs: STORY_BEAT_DURATIONS.STANDARD,
        hapticPattern: 'NONE',
        metadata: {
          value: duration,
          comparison: quality >= 90 ? 'exceptional focus' : quality >= 75 ? 'strong focus' : 'completed',
        },
      };
    },
  },

  // ==========================================================================
  // PROGRESSION CLIFFHANGER - Close to next tier/level
  // ==========================================================================
  {
    type: 'PROGRESSION_CLIFFHANGER',
    priority: STORY_PRIORITIES.PROGRESSION_CLIFFHANGER,
    condition: (input) => input.progressionContext.sessionsToNextTier <= 3 && input.progressionContext.sessionsToNextTier > 0,
    generator: (input) => ({
      type: 'PROGRESSION_CLIFFHANGER',
      headline: input.progressionContext.sessionsToNextTier === 1 ? 'You are 1 session away from the next tier.' : `Only ${input.progressionContext.sessionsToNextTier} sessions until the next tier.`,
      subtext: 'The next level is within reach.',
      emotion: 'ANTICIPATION',
      visualCue: 'XP_BURST',
      durationMs: STORY_BEAT_DURATIONS.STANDARD,
      hapticPattern: 'LIGHT',
      metadata: {
        value: input.progressionContext.sessionsToNextTier,
        context: 'tier approaching',
      },
    }),
  },

  // ==========================================================================
  // CLOSING REFLECTION - Always last
  // ==========================================================================
  {
    type: 'CLOSING_REFLECTION',
    priority: STORY_PRIORITIES.CLOSING_REFLECTION,
    condition: () => true, // Always included
    generator: (input) => {
      const totalFocusTime = input.sessionSummary.effectiveDuration / 60000;
      const isFirstSession = input.streakContext.newStreak === 1 && !input.streakContext.isComeback;

      const reflections: Record<string, string> = {
        FIRST: 'Every journey begins with a single session.',
        SHORT: 'Small steps lead to great distances.',
        MEDIUM: 'Momentum builds with each session.',
        LONG: 'Your focus is becoming legendary.',
        PERFECT: 'Mastery is built one perfect session at a time.',
      };

      let key: string;
      if (isFirstSession) {
        key = 'FIRST';
      } else if (totalFocusTime >= 60) {
        key = 'LONG';
      } else if (totalFocusTime >= 25) {
        key = 'MEDIUM';
      } else if (input.sessionSummary.interruptions === 0) {
        key = 'PERFECT';
      } else {
        key = 'SHORT';
      }

      return {
        type: 'CLOSING_REFLECTION',
        headline: reflections[key],
        subtext: undefined,
        emotion: input.sessionSummary.focusQuality >= 80 ? 'GRATITUDE' : 'DETERMINATION',
        visualCue: 'NONE',
        durationMs: STORY_BEAT_DURATIONS.QUICK,
        hapticPattern: 'LIGHT',
      };
    },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getEntryMood(focusQuality: number): string {
  if (focusQuality >= 85) {
    return 'FOCUSED';
  }
  if (focusQuality >= 70) {
    return 'DETERMINED';
  }
  if (focusQuality >= 50) {
    return 'SCATTERED';
  }
  return 'RELUCTANT';
}

function determineOverallEmotion(beats: StoryBeat[]): EmotionalArc {
  // Count emotions
  const emotionCounts = beats.reduce(
    (acc, beat) => {
      acc[beat.emotion] = (acc[beat.emotion] ?? 0) + 1;
      return acc;
    },
    {} as Record<EmotionalArc, number>,
  );

  // Priority order for tie-breaking
  const priority: EmotionalArc[] = ['TRIUMPH', 'WONDER', 'MASTERY', 'RESILIENCE', 'DETERMINATION', 'ANTICIPATION', 'GRATITUDE', 'RELIEF'];

  // Find dominant emotion
  let dominantEmotion: EmotionalArc = 'DETERMINATION';
  let maxCount = 0;

  for (const emotion of priority) {
    const count = emotionCounts[emotion] ?? 0;
    if (count > maxCount) {
      maxCount = count;
      dominantEmotion = emotion;
    }
  }

  return dominantEmotion;
}

function generateTitle(emotion: EmotionalArc, hasBoss: boolean, isComeback: boolean): string {
  const titles: Record<string, string[]> = {
    TRIUMPH: ['The Focus Victor', 'Champion of Clarity', 'The Unbroken Chain'],
    MASTERY: ['Master of Focus', 'The Perfect Session', 'Flow State Achieved'],
    RESILIENCE: ['The Comeback', 'Rising Stronger', 'Unbroken Spirit'],
    DETERMINATION: ['The Daily Warrior', 'Focus Guardian', 'Streak Protector'],
    ANTICIPATION: ['On the Threshold', 'The Next Chapter', 'Almost There'],
    WONDER: ['Milestone Reached', 'The Journey Continues', 'Legendary Focus'],
    GRATITUDE: ['Present and Focused', 'Mindful Moment', 'The Gift of Focus'],
    RELIEF: ['Streak Saved', 'Protected', 'Crisis Averted'],
  };

  const emotionTitles = titles[emotion] ?? titles.DETERMINATION;

  if (hasBoss) {
    return emotion === 'TRIUMPH' ? 'The Boss Slayer' : 'The Boss Challenger';
  }

  if (isComeback) {
    return 'The Return';
  }

  // Deterministic "random" selection based on emotion + date
  const dayOfMonth = new Date().getDate();
  return emotionTitles[dayOfMonth % emotionTitles.length];
}

function generateNextSessionHooks(input: GenerateStoryInput, beats: StoryBeat[]): CalculatedStory['nextSessionHooks'] {
  const hooks: CalculatedStory['nextSessionHooks'] = [];

  // Streak at risk check
  const streakBeat = beats.find((b) => b.type === 'STREAK_MOMENT');
  if (streakBeat && input.streakContext.newStreak >= 3) {
    hooks.push({
      type: 'STREAK_AT_RISK',
      description: `Protect your ${input.streakContext.newStreak}-day streak tomorrow`,
      urgency: input.streakContext.newStreak >= 7 ? 'HIGH' : 'MEDIUM',
    });
  }

  // Boss almost defeated
  if (input.bossContext && !input.bossContext.defeated) {
    const healthRemaining = input.bossContext.healthRemaining ?? 100;
    const maxHealth = input.bossContext.maxHealth ?? 100;
    const percentRemaining = (healthRemaining / maxHealth) * 100;

    if (percentRemaining <= 25) {
      hooks.push({
        type: 'BOSS_ALMOST_DEFEATED',
        description: `${input.bossContext.bossName ?? 'The boss'} is nearly defeated!`,
        urgency: 'HIGH',
      });
    }
  }

  // Milestone approaching
  const nextMilestone = [3, 7, 14, 30, 60, 100, 180, 365].find((d) => d > input.streakContext.newStreak);
  if (nextMilestone) {
    const daysToMilestone = nextMilestone - input.streakContext.newStreak;
    if (daysToMilestone <= 2) {
      hooks.push({
        type: 'MILESTONE_APPROACHING',
        description: `Day ${nextMilestone} milestone in ${daysToMilestone} session${daysToMilestone === 1 ? '' : 's'}`,
        urgency: daysToMilestone === 1 ? 'HIGH' : 'MEDIUM',
      });
    }
  }

  // Tier approaching
  if (input.progressionContext.sessionsToNextTier <= 2 && input.progressionContext.sessionsToNextTier > 0) {
    hooks.push({
      type: 'TIER_UNLOCK_SOON',
      description: `Next tier unlocks in ${input.progressionContext.sessionsToNextTier} session${input.progressionContext.sessionsToNextTier === 1 ? '' : 's'}`,
      urgency: input.progressionContext.sessionsToNextTier === 1 ? 'HIGH' : 'MEDIUM',
    });
  }

  // Perfect run continuing
  if (input.sessionSummary.interruptions === 0 && input.sessionSummary.pauses === 0) {
    hooks.push({
      type: 'PERFECT_RUN_CONTINUING',
      description: 'Your perfect session streak continues',
      urgency: 'LOW',
    });
  }

  // Comeback momentum
  if (input.streakContext.isComeback && input.streakContext.newStreak === 1) {
    hooks.push({
      type: 'COMEBACK_MOMENTUM',
      description: 'Build momentum with another session tomorrow',
      urgency: 'MEDIUM',
    });
  }

  return hooks;
}

// ============================================================================
// Main Calculator
// ============================================================================

export function calculateStory(input: GenerateStoryInput): CalculatedStory {
  debug.info('Calculating story for session %s', input.sessionId);

  // Find all matching beat candidates
  const matchingBeats = BEAT_TEMPLATES.filter((template) => template.condition(input)).map((template) => ({
    priority: template.priority,
    generator: template.generator,
    type: template.type,
  }));

  // Sort by priority (higher first)
  matchingBeats.sort((a, b) => b.priority - a.priority);

  // Generate beats with IDs and sequence order
  const beats: StoryBeat[] = matchingBeats.map((beat, index) => ({
    id: crypto.randomUUID(),
    sequenceOrder: index,
    ...beat.generator(input),
  }));

  // Determine overall emotion
  const overallEmotion = determineOverallEmotion(beats);

  // Generate title based on dominant themes
  const hasBossBeat = beats.some((b) => b.type === 'BOSS_BATTLE');
  const isComeback = input.streakContext.isComeback;
  const title = generateTitle(overallEmotion, hasBossBeat, isComeback);

  // Generate subtitle
  const duration = Math.round(input.sessionSummary.effectiveDuration / 60000);
  const subtitle = `A ${duration}-minute journey`;

  // Generate hooks for next session
  const nextSessionHooks = generateNextSessionHooks(input, beats);

  const story: CalculatedStory = {
    title,
    subtitle,
    overallEmotion,
    beats,
    nextSessionHooks,
  };

  debug.info('Story calculated: %s (%d beats)', title, beats.length);

  return story;
}

// ============================================================================
// Export
// ============================================================================

export { BEAT_TEMPLATES };
export type { BeatCandidate, CalculatedStory };
export * from "./StoryBeatCalculator.types";
