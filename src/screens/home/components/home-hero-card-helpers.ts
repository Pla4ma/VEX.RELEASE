import type { UrgencyLevel } from "../services/HomeRecommendationEngine";
import { launchColors } from "@theme/tokens/launch-colors";

export function getHeroIcon(type: string): string {
  if (type === "focus_session") {
    return "target";
  }
  if (type === "study_plan") {
    return "book-open";
  }
  if (type === "comeback") {
    return "rotate-ccw";
  }
  if (type === "protect_streak") {
    return "shield";
  }
  if (type === "boss_battle") {
    return "zap";
  }
  if (type === "start_streak") {
    return "flame";
  }
  return "play";
}

export function getHeroUrgencyColor(
  urgency: UrgencyLevel,
  theme: {
    colors: {
      error: Record<number, string>;
      primary: Record<number, string>;
      warning: Record<number, string>;
    };
  },
): string {
  if (urgency === "critical") {
    return theme.colors.error[500] ?? launchColors.hex_ef4444;
  }
  if (urgency === "high") {
    return theme.colors.warning[500] ?? launchColors.hex_f59e0b;
  }
  if (urgency === "medium") {
    return theme.colors.primary[400] ?? launchColors.hex_6366f1;
  }
  return "transparent";
}

export function getHeroGradientColors(
  urgency: UrgencyLevel,
  type: string,
  theme: {
    colors: {
      error: Record<number, string>;
      primary: Record<number, string>;
      success: Record<number, string>;
      warning: Record<number, string>;
    };
  },
): [string, string] {
  if (urgency === "critical") {
    return [
      theme.colors.error[500] ?? launchColors.hex_dc2626,
      theme.colors.error[700] ?? launchColors.hex_991b1b,
    ];
  }
  if (urgency === "high") {
    return [
      theme.colors.warning[500] ?? launchColors.hex_f59e0b,
      theme.colors.warning[700] ?? launchColors.hex_d97706,
    ];
  }
  if (urgency === "medium") {
    return [
      theme.colors.primary[500] ?? launchColors.hex_6366f1,
      theme.colors.primary[700] ?? launchColors.hex_4338ca,
    ];
  }
  if (type === "study_plan") {
    return [
      theme.colors.primary[500] ?? launchColors.hex_6366f1,
      theme.colors.primary[600] ?? launchColors.hex_4f46e5,
    ];
  }
  if (type === "boss_battle") {
    return [
      theme.colors.primary[600] ?? launchColors.hex_7c3aed,
      theme.colors.primary[700] ?? launchColors.hex_6d28d9,
    ];
  }
  if (type === "comeback") {
    return [
      theme.colors.success[500] ?? launchColors.hex_10b981,
      theme.colors.success[700] ?? launchColors.hex_059669,
    ];
  }
  return [
    theme.colors.primary[500] ?? launchColors.hex_6366f1,
    theme.colors.primary[700] ?? launchColors.hex_4338ca,
  ];
}
