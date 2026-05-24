import { launchColors } from "@theme/tokens/launch-colors";
/**
 * Focus Techniques Configuration
 *
 * Pre-configured focus techniques for different work styles.
 * Phase 1: Session Experience Polish
 */

export type FocusTechnique =
  | "POMODORO"
  | "FLOWTIME"
  | "ULTRADIAN"
  | "DEEP_WORK"
  | "CUSTOM";

export interface FocusTechniqueConfig {
  id: FocusTechnique;
  name: string;
  description: string;
  duration: number; // seconds
  breakDuration: number; // seconds
  longBreakDuration: number; // seconds
  intervals: number;
  longBreakInterval: number;
  minDuration: number; // seconds
  maxDuration: number; // seconds
  icon: string;
  color: string;
  bestFor: string[];
}

export const FOCUS_TECHNIQUES: Record<FocusTechnique, FocusTechniqueConfig> = {
  POMODORO: {
    id: "POMODORO",
    name: "Pomodoro",
    description:
      "25 minutes of focus, 5 minute break. Classic time management.",
    duration: 25 * 60,
    breakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    intervals: 8,
    longBreakInterval: 4,
    minDuration: 15 * 60,
    maxDuration: 45 * 60,
    icon: "timer",
    color: launchColors.hex_ff6b6b,
    bestFor: ["tasks", "studying", "writing", "beginners"],
  },
  FLOWTIME: {
    id: "FLOWTIME",
    name: "Flowtime",
    description:
      "Flexible duration based on your natural flow. Break when needed.",
    duration: 45 * 60,
    breakDuration: 10 * 60,
    longBreakDuration: 30 * 60,
    intervals: 4,
    longBreakInterval: 3,
    minDuration: 20 * 60,
    maxDuration: 90 * 60,
    icon: "wave",
    color: launchColors.hex_4ecdc4,
    bestFor: ["creative work", "coding", "design", "experienced users"],
  },
  ULTRADIAN: {
    id: "ULTRADIAN",
    name: "52/17 Rule",
    description:
      "52 minutes focus, 17 minute break. Matches natural ultradian rhythms.",
    duration: 52 * 60,
    breakDuration: 17 * 60,
    longBreakDuration: 30 * 60,
    intervals: 4,
    longBreakInterval: 2,
    minDuration: 45 * 60,
    maxDuration: 60 * 60,
    icon: "pulse",
    color: launchColors.hex_95e1d3,
    bestFor: ["sustained focus", "deep work", "professionals"],
  },
  DEEP_WORK: {
    id: "DEEP_WORK",
    name: "Deep Work",
    description:
      "90 minutes of uninterrupted focus. For complex cognitive tasks.",
    duration: 90 * 60,
    breakDuration: 20 * 60,
    longBreakDuration: 45 * 60,
    intervals: 2,
    longBreakInterval: 1,
    minDuration: 60 * 60,
    maxDuration: 120 * 60,
    icon: "brain",
    color: launchColors.hex_a8e6cf,
    bestFor: ["complex problems", "learning", "research", "writing"],
  },
  CUSTOM: {
    id: "CUSTOM",
    name: "Custom",
    description: "Define your own focus and break durations.",
    duration: 30 * 60,
    breakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    intervals: 6,
    longBreakInterval: 4,
    minDuration: 5 * 60,
    maxDuration: 180 * 60,
    icon: "settings",
    color: launchColors.hex_ffd93d,
    bestFor: ["personal preference", "experimenting"],
  },
};

/**
 * Get technique configuration
 */
export function getTechniqueConfig(
  technique: FocusTechnique,
): FocusTechniqueConfig {
  return FOCUS_TECHNIQUES[technique] ?? FOCUS_TECHNIQUES.POMODORO;
}

/**
 * Get all available techniques as array
 */
export function getAllTechniques(): FocusTechniqueConfig[] {
  return Object.values(FOCUS_TECHNIQUES);
}

/**
 * Get techniques best suited for a specific activity
 */
export function getTechniquesForActivity(
  activity: string,
): FocusTechniqueConfig[] {
  return Object.values(FOCUS_TECHNIQUES).filter((tech) =>
    tech.bestFor.some((b) => b.toLowerCase().includes(activity.toLowerCase())),
  );
}

/**
 * Create session config from technique
 */
export function createConfigFromTechnique(
  technique: FocusTechnique,
  customDuration?: number,
): {
  duration: number;
  breakDuration: number;
  longBreakDuration: number;
  intervals: number;
  longBreakInterval: number;
} {
  const config = getTechniqueConfig(technique);
  return {
    duration: customDuration ?? config.duration,
    breakDuration: config.breakDuration,
    longBreakDuration: config.longBreakDuration,
    intervals: config.intervals,
    longBreakInterval: config.longBreakInterval,
  };
}

/**
 * Suggest technique based on user preferences and history
 */
export function suggestTechnique(
  userLevel: "beginner" | "intermediate" | "advanced",
  activityType: string,
  preferredDuration?: number,
): FocusTechnique {
  if (userLevel === "beginner") {
    return "POMODORO";
  }

  if (activityType === "creative" || activityType === "coding") {
    return "FLOWTIME";
  }

  if (activityType === "deep" || activityType === "research") {
    return "DEEP_WORK";
  }

  if (preferredDuration && preferredDuration >= 45 * 60) {
    return "ULTRADIAN";
  }

  return "POMODORO";
}
