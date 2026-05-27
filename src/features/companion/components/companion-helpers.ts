import { CompanionMood, CompanionPhase } from "../types";

export function getPhaseMultiplier(phase: CompanionPhase): number {
  const multipliers: Record<CompanionPhase, number> = {
    EGG: 0.5,
    HATCHING: 0.7,
    YOUNG: 0.85,
    MATURE: 1,
    AWAKENED: 1.2,
    TRANSCENDENT: 1.5,
  };
  return multipliers[phase];
}

export function getMoodEmoji(mood: CompanionMood): string {
  const emojis: Record<CompanionMood, string> = {
    SLEEPY: "😴",
    CONTENT: "😊",
    FOCUSED: "🎯",
    DETERMINED: "🔥",
    ECSTATIC: "✨",
    STRUGGLING: "😰",
    DANGER: "⚠️",
  };
  return emojis[mood];
}
