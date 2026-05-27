import { launchColors } from "@theme/tokens/launch-colors";

export type MoodType = "GREAT" | "GOOD" | "NEUTRAL" | "BAD" | "TERRIBLE" | null;

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const getMoodEmoji = (m: MoodType): string => {
  switch (m) {
    case "GREAT":
      return "🤩";
    case "GOOD":
      return "😊";
    case "NEUTRAL":
      return "😐";
    case "BAD":
      return "😕";
    case "TERRIBLE":
      return "😫";
    default:
      return "🤔";
  }
};

export const getGrade = (score: number): { letter: string; color: string } => {
  if (score >= 900) {
    return { letter: "S", color: launchColors.hex_ffd700 };
  }
  if (score >= 800) {
    return { letter: "A", color: launchColors.hex_4caf50 };
  }
  if (score >= 700) {
    return { letter: "B", color: launchColors.hex_8bc34a };
  }
  if (score >= 600) {
    return { letter: "C", color: launchColors.hex_ffc107 };
  }
  if (score >= 500) {
    return { letter: "D", color: launchColors.hex_ff9800 };
  }
  return { letter: "F", color: launchColors.hex_f44336 };
};
