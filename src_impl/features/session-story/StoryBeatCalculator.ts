import { createDebugger } from "@/utils/debug";
import type { StoryBeat, StoryBeatType, EmotionalArc, GenerateStoryInput } from "./schemas";
import { BEAT_TEMPLATES_PART1 } from "./beat-templates-part1";
import { BEAT_TEMPLATES_PART2 } from "./beat-templates-part2";

const debug = createDebugger("session-story:calculator");

export interface BeatCandidate {
  type: StoryBeatType;
  priority: number;
  condition: (input: GenerateStoryInput) => boolean;
  generator: (
    input: GenerateStoryInput,
  ) => Omit<StoryBeat, "id" | "sequenceOrder">;
}

export interface CalculatedStory {
  title: string;
  subtitle: string;
  overallEmotion: EmotionalArc;
  beats: StoryBeat[];
  nextSessionHooks: Array<{
    type:
      | "STREAK_AT_RISK"
      | "BOSS_ALMOST_DEFEATED"
      | "MILESTONE_APPROACHING"
      | "TIER_UNLOCK_SOON"
      | "PERFECT_RUN_CONTINUING"
      | "COMEBACK_MOMENTUM";
    description: string;
    urgency: "LOW" | "MEDIUM" | "HIGH";
  }>;
}

const BEAT_TEMPLATES: BeatCandidate[] = [
  ...BEAT_TEMPLATES_PART1,
  ...BEAT_TEMPLATES_PART2,
];

function determineOverallEmotion(beats: StoryBeat[]): EmotionalArc {
  const emotionCounts = beats.reduce(
    (acc, beat) => {
      acc[beat.emotion] = (acc[beat.emotion] ?? 0) + 1;
      return acc;
    },
    {} as Record<EmotionalArc, number>,
  );
  const priority: EmotionalArc[] = [
    "TRIUMPH",
    "WONDER",
    "MASTERY",
    "RESILIENCE",
    "DETERMINATION",
    "ANTICIPATION",
    "GRATITUDE",
    "RELIEF",
  ];
  let dominantEmotion: EmotionalArc = "DETERMINATION";
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

const TITLES: Record<EmotionalArc, string[]> = {
  TRIUMPH: ["The Focus Victor", "Champion of Clarity", "The Unbroken Chain"],
  MASTERY: ["Master of Focus", "The Perfect Session", "Flow State Achieved"],
  RESILIENCE: ["The Comeback", "Rising Stronger", "Unbroken Spirit"],
  DETERMINATION: ["The Daily Warrior", "Focus Guardian", "Streak Protector"],
  ANTICIPATION: ["On the Threshold", "The Next Chapter", "Almost There"],
  WONDER: ["Milestone Reached", "The Journey Continues", "Legendary Focus"],
  GRATITUDE: ["Present and Focused", "Mindful Moment", "The Gift of Focus"],
  RELIEF: ["Streak Saved", "Protected", "Crisis Averted"],
};

function generateTitle(
  emotion: EmotionalArc,
  hasBoss: boolean,
  isComeback: boolean,
): string {
  const emotionTitles = TITLES[emotion] as string[];
  if (hasBoss) {
    return emotion === "TRIUMPH" ? "The Boss Slayer" : "The Boss Challenger";
  }
  if (isComeback) {
    return "The Return";
  }
  const dayOfMonth = new Date().getDate();
  return emotionTitles[dayOfMonth % emotionTitles.length]!;
}

function generateNextSessionHooks(
  input: GenerateStoryInput,
  beats: StoryBeat[],
): CalculatedStory["nextSessionHooks"] {
  const hooks: CalculatedStory["nextSessionHooks"] = [];
  const streakBeat = beats.find((b) => b.type === "STREAK_MOMENT");
  if (streakBeat && input.streakContext.newStreak >= 3) {
    hooks.push({
      type: "STREAK_AT_RISK",
      description: `Protect your ${input.streakContext.newStreak}-day streak tomorrow`,
      urgency: input.streakContext.newStreak >= 7 ? "HIGH" : "MEDIUM",
    });
  }
  if (input.bossContext && !input.bossContext.defeated) {
    const healthRemaining = input.bossContext.healthRemaining ?? 100;
    const maxHealth = input.bossContext.maxHealth ?? 100;
    const percentRemaining = (healthRemaining / maxHealth) * 100;
    if (percentRemaining <= 25) {
      hooks.push({
        type: "BOSS_ALMOST_DEFEATED",
        description: `${input.bossContext.bossName ?? "The boss"} is nearly defeated!`,
        urgency: "HIGH",
      });
    }
  }
  const nextMilestone = [3, 7, 14, 30, 60, 100, 180, 365].find(
    (d) => d > input.streakContext.newStreak,
  );
  if (nextMilestone) {
    const daysToMilestone = nextMilestone - input.streakContext.newStreak;
    if (daysToMilestone <= 2) {
      hooks.push({
        type: "MILESTONE_APPROACHING",
        description: `Day ${nextMilestone} milestone in ${daysToMilestone} session${daysToMilestone === 1 ? "" : "s"}`,
        urgency: daysToMilestone === 1 ? "HIGH" : "MEDIUM",
      });
    }
  }
  if (
    input.progressionContext.sessionsToNextTier <= 2 &&
    input.progressionContext.sessionsToNextTier > 0
  ) {
    hooks.push({
      type: "TIER_UNLOCK_SOON",
      description: `Next tier unlocks in ${input.progressionContext.sessionsToNextTier} session${input.progressionContext.sessionsToNextTier === 1 ? "" : "s"}`,
      urgency:
        input.progressionContext.sessionsToNextTier === 1 ? "HIGH" : "MEDIUM",
    });
  }
  if (
    input.sessionSummary.interruptions === 0 &&
    input.sessionSummary.pauses === 0
  ) {
    hooks.push({
      type: "PERFECT_RUN_CONTINUING",
      description: "Your perfect session streak continues",
      urgency: "LOW",
    });
  }
  if (input.streakContext.isComeback && input.streakContext.newStreak === 1) {
    hooks.push({
      type: "COMEBACK_MOMENTUM",
      description: "Build momentum with another session tomorrow",
      urgency: "MEDIUM",
    });
  }
  return hooks;
}

export function calculateStory(input: GenerateStoryInput): CalculatedStory {
  debug.info("Calculating story for session %s", input.sessionId);
  const matchingBeats = BEAT_TEMPLATES.filter((template) =>
    template.condition(input),
  ).map((template) => ({
    priority: template.priority,
    generator: template.generator,
    type: template.type,
  }));
  matchingBeats.sort((a, b) => b.priority - a.priority);
  const beats: StoryBeat[] = matchingBeats.map((beat, index) => ({
    id: crypto.randomUUID(),
    sequenceOrder: index,
    ...beat.generator(input),
  }));
  const overallEmotion = determineOverallEmotion(beats);
  const hasBossBeat = beats.some((b) => b.type === "BOSS_BATTLE");
  const isComeback = input.streakContext.isComeback;
  const title = generateTitle(overallEmotion, hasBossBeat, isComeback);
  const duration = Math.round(input.sessionSummary.effectiveDuration / 60000);
  const subtitle = `A ${duration}-minute journey`;
  const nextSessionHooks = generateNextSessionHooks(input, beats);
  const story: CalculatedStory = {
    title,
    subtitle,
    overallEmotion,
    beats,
    nextSessionHooks,
  };
  debug.info("Story calculated: %s (%d beats)", title, beats.length);
  return story;
}

export { BEAT_TEMPLATES };
