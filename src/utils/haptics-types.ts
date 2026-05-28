import { captureSilentFailure } from "./silent-failure";
import * as Haptics from "expo-haptics";

export type HapticFeedbackKind =
  | "selection"
  | "success"
  | "warning"
  | "error"
  | "impactLight"
  | "impactMedium"
  | "impactHeavy";

export type HapticPattern = HapticFeedbackKind[];

export const HapticPatterns: Record<string, HapticPattern> = {
  LEGENDARY_SEQUENCE: [
    "impactHeavy",
    "impactHeavy",
    "impactHeavy",
    "impactHeavy",
    "impactHeavy",
    "success",
  ],
  LEVEL_UP_SEQUENCE: ["impactMedium", "impactHeavy", "success"],
  BOSS_DEFEATED_SEQUENCE: ["impactHeavy", "impactHeavy", "success"],
};

export async function triggerHaptic(kind: HapticFeedbackKind): Promise<void> {
  try {
    if (kind === "selection") {
      await Haptics.selectionAsync();
      return;
    }
    if (kind === "success") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === "warning") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (kind === "error") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const impactStyle =
      kind === "impactHeavy"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : kind === "impactLight"
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium;
    await Haptics.impactAsync(impactStyle);
  } catch (error) {
    captureSilentFailure(error, {
      feature: "utils",
      operation: "ui-fallback",
      type: "ui",
    });
  }
}

export async function triggerHapticPattern(
  pattern: HapticPattern,
  delayMs: number = 150,
): Promise<void> {
  for (let i = 0; i < pattern.length; i++) {
    await triggerHaptic(pattern[i]!);
    if (i < pattern.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
