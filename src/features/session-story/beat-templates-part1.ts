import type { StoryBeat, EmotionalArc, GenerateStoryInput } from "./schemas";
import { STORY_BEAT_DURATIONS, STORY_PRIORITIES } from "./schemas";
import type { BeatCandidate } from "./StoryBeatCalculator";

function getEntryMood(focusQuality: number): string {
  if (focusQuality >= 85) { return "FOCUSED"; }
  if (focusQuality >= 70) { return "DETERMINED"; }
  if (focusQuality >= 50) { return "SCATTERED"; }
  return "RELUCTANT";
}

export const BEAT_TEMPLATES_PART1: BeatCandidate[] = [
  {
    type: "OPENING",
    priority: STORY_PRIORITIES.OPENING,
    condition: () => true,
    generator: (input) => {
      const duration = input.sessionSummary.duration / 60000;
      const mood = getEntryMood(input.sessionSummary.focusQuality);
      const headlines: Record<string, string> = {
        FOCUSED: "You entered with clarity.",
        SCATTERED: "You began amidst chaos.",
        DETERMINED: "You stepped in ready.",
        RELUCTANT: "You showed up anyway.",
      };
      return {
        type: "OPENING",
        headline: headlines[mood] ?? "You began your journey.",
        subtext:
          duration >= 45
            ? `A ${Math.round(duration)}-minute commitment awaited.`
            : duration >= 25
              ? "25 minutes of pure focus ahead."
              : "A focused sprint begins.",
        emotion:
          mood === "DETERMINED"
            ? "DETERMINATION"
            : mood === "FOCUSED"
              ? "MASTERY"
              : "RESILIENCE",
        visualCue: "NONE",
        durationMs: STORY_BEAT_DURATIONS.QUICK,
        hapticPattern: "LIGHT",
      };
    },
  },
  {
    type: "PERFECTION_MOMENT",
    priority: STORY_PRIORITIES.PERFECTION_MOMENT,
    condition: (input) =>
      input.sessionSummary.interruptions === 0 &&
      input.sessionSummary.pauses === 0 &&
      input.sessionSummary.focusQuality >= 90,
    generator: (input) => {
      const isExtended = input.sessionSummary.duration >= 45 * 60000;
      return {
        type: "PERFECTION_MOMENT",
        headline: isExtended
          ? "Pure mastery. Not a single distraction."
          : "Zero interruptions. Complete flow.",
        subtext: isExtended
          ? `For ${Math.round(input.sessionSummary.duration / 60000)} minutes, the world faded away.`
          : "You and the task became one.",
        emotion: "MASTERY",
        visualCue: "CELEBRATION",
        durationMs: STORY_BEAT_DURATIONS.DRAMATIC,
        hapticPattern: "CELEBRATION",
        metadata: {
          comparison:
            input.sessionSummary.duration >= 3600000
              ? "hour-long perfection"
              : "flawless execution",
        },
      };
    },
  },
  {
    type: "BOSS_BATTLE",
    priority: STORY_PRIORITIES.BOSS_DEFEAT,
    condition: (input) => input.bossContext?.defeated === true,
    generator: (input) => ({
      type: "BOSS_BATTLE",
      headline: `You defeated ${input.bossContext?.bossName ?? "the boss"}!`,
      subtext:
        input.bossContext && input.bossContext.damageDealt > 100
          ? `Dealt ${input.bossContext.damageDealt} damage in a single strike.`
          : "Victory belongs to the focused.",
      emotion: "TRIUMPH",
      visualCue: "BOSS_DAMAGE",
      durationMs: STORY_BEAT_DURATIONS.CELEBRATION,
      hapticPattern: "CELEBRATION",
      metadata: { value: input.bossContext?.damageDealt },
    }),
  },
  {
    type: "BOSS_BATTLE",
    priority: STORY_PRIORITIES.BOSS_BATTLE,
    condition: (input) =>
      input.bossContext !== undefined &&
      input.bossContext.damageDealt > 0 &&
      !input.bossContext.defeated,
    generator: (input) => {
      const damage = input.bossContext?.damageDealt ?? 0;
      const healthRemaining = input.bossContext?.healthRemaining ?? 0;
      const maxHealth = input.bossContext?.maxHealth ?? 100;
      const percentHealth = (healthRemaining / maxHealth) * 100;
      let headline: string;
      let subtext: string;
      if (percentHealth <= 25) {
        headline = "The boss is nearly defeated!";
        subtext = "One more focused session should finish them.";
      } else if (percentHealth <= 50) {
        headline = "You broke the boss's shield.";
        subtext = "The tide turns in your favor.";
      } else {
        headline = "You struck true.";
        subtext = `${damage} damage dealt to ${input.bossContext?.bossName ?? "the boss"}.`;
      }
      return {
        type: "BOSS_BATTLE",
        headline,
        subtext,
        emotion: percentHealth <= 25 ? "ANTICIPATION" : "DETERMINATION",
        visualCue: "BOSS_DAMAGE",
        durationMs: STORY_BEAT_DURATIONS.STANDARD,
        hapticPattern: "HEAVY",
        metadata: {
          value: damage,
          context: `${Math.round(percentHealth)}% health remains`,
        },
      };
    },
  },
  {
    type: "MILESTONE_REACHED",
    priority: STORY_PRIORITIES.MILESTONE_REACHED,
    condition: (input) => input.streakContext.isMilestone === true,
    generator: (input) => {
      const day =
        input.streakContext.milestoneDay ?? input.streakContext.newStreak;
      const milestoneNames: Record<number, string> = {
        3: "First Flame",
        7: "Week Warrior",
        14: "Fortnight Focus",
        30: "Monthly Master",
        60: "Dedication Defined",
        100: "Century Champion",
        180: "Half-Year Hero",
        365: "Year of Power",
      };
      return {
        type: "MILESTONE_REACHED",
        headline: `Day ${day}: ${milestoneNames[day] ?? "Milestone Achieved"}`,
        subtext:
          day >= 30
            ? `Only ${Math.floor((365 - day) / 30)} months to a full year.`
            : day >= 7
              ? "You're building something remarkable."
              : "The foundation is set. Keep building.",
        emotion: day >= 30 ? "WONDER" : "TRIUMPH",
        visualCue: "BADGE_SHINE",
        durationMs: STORY_BEAT_DURATIONS.CELEBRATION,
        hapticPattern: "CELEBRATION",
        metadata: {
          value: day,
          comparison:
            day >= 100 ? "legendary" : day >= 30 ? "exceptional" : "strong",
        },
      };
    },
  },
];
