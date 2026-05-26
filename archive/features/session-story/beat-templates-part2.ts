import type { EmotionalArc, GenerateStoryInput } from "./schemas";
import { STORY_BEAT_DURATIONS, STORY_PRIORITIES } from "./schemas";
import type { BeatCandidate } from "./StoryBeatCalculator";

export const BEAT_TEMPLATES_PART2: BeatCandidate[] = [
  {
    type: "COMEBACK_TRIUMPH",
    priority: STORY_PRIORITIES.COMEBACK_TRIUMPH,
    condition: (input) => input.streakContext.isComeback === true,
    generator: (input) => {
      const daysAbsent = input.streakContext.daysAbsent;
      return {
        type: "COMEBACK_TRIUMPH",
        headline:
          daysAbsent >= 7
            ? "You returned. Stronger than before."
            : "Welcome back. Let's continue.",
        subtext:
          daysAbsent >= 7
            ? `After ${daysAbsent} days away, you chose to begin again.`
            : "The break is over. Your streak is reborn.",
        emotion: "RESILIENCE",
        visualCue: "SHIELD_PROTECTION",
        durationMs: STORY_BEAT_DURATIONS.DRAMATIC,
        hapticPattern: "MEDIUM",
        metadata: { value: daysAbsent, comparison: "comeback story" },
      };
    },
  },
  {
    type: "STREAK_MOMENT",
    priority: STORY_PRIORITIES.STREAK_MOMENT,
    condition: (input) =>
      input.streakContext.newStreak > 0 &&
      !input.streakContext.isMilestone &&
      !input.streakContext.isComeback,
    generator: (input) => {
      const newStreak = input.streakContext.newStreak;
      const wasProtected = input.streakContext.wasProtected;
      if (wasProtected) {
        return {
          type: "STREAK_MOMENT",
          headline: "Your streak shield held.",
          subtext: `Day ${newStreak} protected. Some streaks are worth fighting for.`,
          emotion: "RELIEF",
          visualCue: "SHIELD_PROTECTION",
          durationMs: STORY_BEAT_DURATIONS.STANDARD,
          hapticPattern: "SUCCESS",
          metadata: { value: newStreak, context: "shield protected" },
        };
      }
      const nextMilestone = [3, 7, 14, 30, 60, 100, 180, 365].find(
        (d) => d > newStreak,
      );
      const daysToMilestone = nextMilestone ? nextMilestone - newStreak : null;
      return {
        type: "STREAK_MOMENT",
        headline: `Streak protected. Day ${newStreak}.`,
        subtext:
          daysToMilestone && daysToMilestone <= 3
            ? `${daysToMilestone} day${daysToMilestone === 1 ? "" : "s"} from your next milestone.`
            : "Each day builds the next.",
        emotion: newStreak >= 7 ? "MASTERY" : "DETERMINATION",
        visualCue: "STREAK_FLAME",
        durationMs: STORY_BEAT_DURATIONS.STANDARD,
        hapticPattern: "LIGHT",
        metadata: {
          value: newStreak,
          context: daysToMilestone
            ? `${daysToMilestone} to next`
            : "maintained",
        },
      };
    },
  },
  {
    type: "FOCUS_JOURNEY",
    priority: STORY_PRIORITIES.FOCUS_JOURNEY,
    condition: (input) => input.sessionSummary.duration >= 15 * 60000,
    generator: (input) => {
      const duration = Math.round(
        input.sessionSummary.effectiveDuration / 60000,
      );
      const quality = input.sessionSummary.focusQuality;
      let headline: string;
      let emotion: EmotionalArc;
      if (quality >= 90) {
        headline = `You stayed focused for ${duration} minutes.`;
        emotion = "MASTERY";
      } else if (quality >= 75) {
        headline = `Deep focus for ${duration} minutes.`;
        emotion = "TRIUMPH";
      } else if (quality >= 60) {
        headline = `You stayed with it for ${duration} minutes.`;
        emotion = "DETERMINATION";
      } else {
        headline = `You kept going for ${duration} minutes.`;
        emotion = "RESILIENCE";
      }
      return {
        type: "FOCUS_JOURNEY",
        headline,
        subtext:
          quality >= 80
            ? `Quality score: ${Math.round(quality)}%`
            : "Some sessions are about showing up.",
        emotion,
        visualCue: "PROGRESS_BAR",
        durationMs: STORY_BEAT_DURATIONS.STANDARD,
        hapticPattern: "NONE",
        metadata: {
          value: duration,
          comparison:
            quality >= 90
              ? "exceptional focus"
              : quality >= 75
                ? "strong focus"
                : "completed",
        },
      };
    },
  },
  {
    type: "PROGRESSION_CLIFFHANGER",
    priority: STORY_PRIORITIES.PROGRESSION_CLIFFHANGER,
    condition: (input) =>
      input.progressionContext.sessionsToNextTier <= 3 &&
      input.progressionContext.sessionsToNextTier > 0,
    generator: (input) => ({
      type: "PROGRESSION_CLIFFHANGER",
      headline:
        input.progressionContext.sessionsToNextTier === 1
          ? "You are 1 session away from the next tier."
          : `Only ${input.progressionContext.sessionsToNextTier} sessions until the next tier.`,
      subtext: "The next level is within reach.",
      emotion: "ANTICIPATION",
      visualCue: "XP_BURST",
      durationMs: STORY_BEAT_DURATIONS.STANDARD,
      hapticPattern: "LIGHT",
      metadata: {
        value: input.progressionContext.sessionsToNextTier,
        context: "tier approaching",
      },
    }),
  },
  {
    type: "CLOSING_REFLECTION",
    priority: STORY_PRIORITIES.CLOSING_REFLECTION,
    condition: () => true,
    generator: (input) => {
      const totalFocusTime = input.sessionSummary.effectiveDuration / 60000;
      const isFirstSession =
        input.streakContext.newStreak === 1 && !input.streakContext.isComeback;
      const reflections: Record<string, string> = {
        FIRST: "Every journey begins with a single session.",
        SHORT: "Small steps lead to great distances.",
        MEDIUM: "Momentum builds with each session.",
        LONG: "Your focus is becoming legendary.",
        PERFECT: "Mastery is built one perfect session at a time.",
      };
      let key: string;
      if (isFirstSession) {
        key = "FIRST";
      } else if (totalFocusTime >= 60) {
        key = "LONG";
      } else if (totalFocusTime >= 25) {
        key = "MEDIUM";
      } else if (input.sessionSummary.interruptions === 0) {
        key = "PERFECT";
      } else {
        key = "SHORT";
      }
      return {
        type: "CLOSING_REFLECTION",
        headline: reflections[key]!,
        subtext: undefined,
        emotion:
          input.sessionSummary.focusQuality >= 80
            ? "GRATITUDE"
            : "DETERMINATION",
        visualCue: "NONE",
        durationMs: STORY_BEAT_DURATIONS.QUICK,
        hapticPattern: "LIGHT",
      };
    },
  },
];
