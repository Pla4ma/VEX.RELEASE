import type {
  BehaviorStats,
  VexExperience,
  VexPersonalizationProfile,
} from "./schemas";

export function resolveUserStage(
  stats: BehaviorStats,
): VexExperience["userStage"] {
  if (stats.totalCompletedSessions === 0) return "new_user";
  if (stats.totalCompletedSessions < 3) return "activating";
  if (stats.totalCompletedSessions < 10) return "engaged";
  return "power_user";
}

export function resolveHiddenSystems(
  profile: VexPersonalizationProfile,
  stats: BehaviorStats,
): Pick<VexExperience, "bannedSurfaces" | "hiddenSystems" | "teasedSystems"> {
  const hiddenSystems: VexExperience["hiddenSystems"] = [
    "shop",
    "inventory",
    "battle_pass",
    "wagers",
    "rivals",
    "squads",
    "leaderboards",
  ];
  const teasedSystems: string[] = [];
  const bannedSurfaces: string[] = [];

  if (
    profile.motivationStyle === "calm" ||
    profile.motivationStyle === "study_focused"
  ) {
    hiddenSystems.push("advanced_economy", "premium_currency");
    bannedSurfaces.push("boss_full_cta", "game_hub");
  }
  if (profile.gamificationIntensity === "minimal") {
    hiddenSystems.push("premium_currency");
    bannedSurfaces.push("boss_combat_effects", "critical_hit_animations");
  }
  if (
    stats.bossChallengeEngagement === "none" &&
    stats.totalCompletedSessions > 5
  ) {
    teasedSystems.push("boss_tab");
  }
  return { bannedSurfaces, hiddenSystems, teasedSystems };
}
