import type { InterventionType } from "./intervention-types";

interface BannerColors {
  bg: string;
  border: string;
  accent: string;
}

const SEVERITY_COLOR_MAP: Record<InterventionType, (theme: Record<string, Record<string, string>>) => string> = {
  BURNOUT: (t) => t.colors!.warning![500]!,
  PLATEAU: (t) => t.colors!.info![500]!,
  STREAK_RISK: (t) => t.colors!.error![500]!,
  BOSS_FINISH: (t) => t.colors!.success![500]!,
  BOSS_OPPORTUNITY: (t) => t.colors!.success![500]!,
  STUDY_BEHIND: (t) => t.colors!.warning![500]!,
  MOMENTUM_BUILDING: (t) => t.colors!.primary![500]!,
  COMEBACK_READY: (t) => t.colors!.primary![500]!,
  STUDY_PLAN_COMPLETE: (t) => t.colors!.success![500]!,
};

export function getBannerColors(
  type: InterventionType,
  theme: Record<string, Record<string, string>>,
): BannerColors {
  const resolveColor = SEVERITY_COLOR_MAP[type] ?? SEVERITY_COLOR_MAP.MOMENTUM_BUILDING;
  const color = resolveColor(theme);
  return { bg: color + "15", border: color, accent: color };
}

const ICON_MAP: Record<InterventionType, string> = {
  BURNOUT: "🔥",
  PLATEAU: "📊",
  STREAK_RISK: "⏰",
  BOSS_FINISH: "⚔️",
  BOSS_OPPORTUNITY: "🎯",
  STUDY_BEHIND: "📚",
  MOMENTUM_BUILDING: "📈",
  COMEBACK_READY: "🔄",
  STUDY_PLAN_COMPLETE: "🏆",
};

export function getIcon(type: InterventionType): string {
  return ICON_MAP[type] ?? "💡";
}

export function isNonDismissable(type: InterventionType, hours?: number): boolean {
  return type === "STREAK_RISK" && hours !== undefined && hours < 4;
}
