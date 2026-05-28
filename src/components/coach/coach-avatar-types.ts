import type { ViewStyle } from "react-native";

export type CoachMood = "calm" | "active" | "celebrate";

export interface AnimatedCoachAvatarProps {
  size?: number;
  mood?: CoachMood;
  style?: ViewStyle;
}

export function getMoodScale(mood: CoachMood): number {
  if (mood === "celebrate") {
    return 1.08;
  }
  if (mood === "active") {
    return 1.04;
  }
  return 1.02;
}
