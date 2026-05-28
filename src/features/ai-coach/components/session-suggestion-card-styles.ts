/**
 * Session Suggestion Card — type config and styles
 */

import type { RecommendationType } from "../schemas";
import { createSheet } from "@/shared/ui/create-sheet";
import { launchColors } from "@theme/tokens/launch-colors";

export const TYPE_CONFIG: Record<
  RecommendationType,
  { icon: string; title: string; color: string }
> = {
  OPTIMAL_TIME: {
    icon: "🎯",
    title: "Perfect Timing",
    color: launchColors.hex_4ecdc4,
  },
  STREAK_PROTECTION: {
    icon: "🔥",
    title: "Save Your Streak",
    color: launchColors.hex_fc8181,
  },
  COMEBACK_BUILDER: {
    icon: "💪",
    title: "Comeback Time",
    color: launchColors.hex_68d391,
  },
  DIFFICULTY_ADJUST: {
    icon: "⚙️",
    title: "Smart Adjustment",
    color: launchColors.hex_a0aec0,
  },
  CHALLENGE_SYNC: {
    icon: "🎮",
    title: "Challenge Ready",
    color: launchColors.hex_f6ad55,
  },
  BOSS_PREP: {
    icon: "⚔️",
    title: "Boss Battle Prep",
    color: launchColors.hex_9f7aea,
  },
  HABIT_BUILDER: {
    icon: "📅",
    title: "Build The Habit",
    color: launchColors.hex_63b3ed,
  },
  ENERGY_BASED: {
    icon: "⚡",
    title: "Energy Match",
    color: launchColors.hex_f6e05e,
  },
};

export const styles = createSheet({
  container: {
    backgroundColor: launchColors.hex_fff,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    shadowColor: launchColors.hex_000,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  confidence: {
    fontSize: 12,
    color: launchColors.hex_666,
  },
  reasoning: {
    fontSize: 15,
    lineHeight: 22,
    color: launchColors.hex_333,
    marginBottom: 16,
  },
  details: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: launchColors.hex_f0f0f0,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: launchColors.hex_666,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: launchColors.hex_333,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  acceptButtonText: {
    color: launchColors.hex_fff,
    fontSize: 16,
    fontWeight: "600",
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  dismissButtonText: {
    color: launchColors.hex_666,
    fontSize: 16,
    fontWeight: "500",
  },
});
