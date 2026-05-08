import type { UrgencyLevel } from "../services/HomeRecommendationEngine";

export function getHeroIcon(type: string): string {
  if (type === "focus_session") { return "target"; }
  if (type === "study_plan") { return "book-open"; }
  if (type === "comeback") { return "rotate-ccw"; }
  if (type === "protect_streak") { return "shield"; }
  if (type === "boss_battle") { return "zap"; }
  if (type === "start_streak") { return "flame"; }
  return "play";
}

export function getHeroUrgencyColor(urgency: UrgencyLevel, theme: { colors: { primary: Record<number, string> } }): string {
  if (urgency === "critical") { return "#EF4444"; }
  if (urgency === "high") { return "#F59E0B"; }
  if (urgency === "medium") { return theme.colors.primary[400] ?? "#6366F1"; }
  return "transparent";
}

export function getHeroGradientColors(
  urgency: UrgencyLevel,
  type: string,
  theme: { colors: { primary: Record<number, string> } }
): [string, string] {
  if (urgency === "critical") { return ["#DC2626", "#991B1B"]; }
  if (urgency === "high") { return ["#F59E0B", "#D97706"]; }
  if (urgency === "medium") { return [theme.colors.primary[500] ?? "#6366F1", theme.colors.primary[700] ?? "#4338CA"]; }
  if (type === "study_plan") { return ["#6366F1", "#4F46E5"]; }
  if (type === "boss_battle") { return ["#7C3AED", "#6D28D9"]; }
  if (type === "comeback") { return ["#10B981", "#059669"]; }
  return [theme.colors.primary[500] ?? "#6366F1", theme.colors.primary[700] ?? "#4338CA"];
}
