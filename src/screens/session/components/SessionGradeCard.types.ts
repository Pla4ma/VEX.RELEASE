import { StyleSheet } from "react-native";
import { Circle } from "react-native-svg";
import Animated from "react-native-reanimated";
import { triggerHaptic } from "../../../utils/haptics";
import { createSheet } from "@/shared/ui/create-sheet";

export const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type SessionGradeCardProps = {
  durationLabel: string;
  gradeColor: string;
  gradeLabel: string;
  gradeLetter: string;
  purityColor: string;
  purityLabel: string;
  purityScore: number;
  width: number;
  xpEarned: number;
};

export async function pulseCompleteHaptic(): Promise<void> {
  await triggerHaptic("impactMedium");
}

export const styles = createSheet({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
