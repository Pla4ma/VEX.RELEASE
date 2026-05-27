import {
  BehaviorStatsSchema,
  FeatureAvailabilitySnapshotSchema,
  VexExperienceSchema,
  VexPersonalizationProfileSchema,
  type BehaviorStats,
  type FeatureAvailabilitySnapshot,
  type VexExperience,
  type VexPersonalizationProfile,
} from "./schemas";
import {
  resolveBehavior,
  resolveBoss,
  resolveBossIntensity,
  resolveCoachMode,
  resolveCompanionIntensity,
  resolveCompletion,
  resolveHome,
  resolveHomeLayoutVariant,
  resolvePremium,
  resolvePremiumMoment,
} from "./experience-service-helpers";

function resolveUserStage(stats: BehaviorStats): VexExperience["userStage"] {
  if (stats.totalCompletedSessions === 0) return "new_user";
  if (stats.totalCompletedSessions < 3) return "activating";
  if (stats.totalCompletedSessions < 10) return "engaged";
  return "power_user";
}

function resolveHiddenSystems(
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

export function resolveVexExperience(
  userProfile: VexPersonalizationProfile,
  behaviorStats: BehaviorStats,
  featureAvailability: FeatureAvailabilitySnapshot,
): VexExperience {
  const profile = VexPersonalizationProfileSchema.parse(userProfile);
  const stats = BehaviorStatsSchema.parse(behaviorStats);
  const availability =
    FeatureAvailabilitySnapshotSchema.parse(featureAvailability);
  const boss = resolveBoss({ availability, profile, stats });
  const behavior = resolveBehavior(profile, stats);
  const home = resolveHome({ boss, profile, stats });
  const completion = resolveCompletion({ availability, boss, stats });
  const companionIntensity = resolveCompanionIntensity(profile);
  const isStudyRelevant = home.sections.includes("study_layer");
  const systems = resolveHiddenSystems(profile, stats);
  const bossMode = !boss.isVisible
    ? "hidden"
    : boss.intensity === "subtle"
      ? "momentum"
      : "personal_boss";

  return VexExperienceSchema.parse({
    version: 3,
    userStage: resolveUserStage(stats),
    primaryHomeCTA: {
      intent: isStudyRelevant ? "CONTINUE_STUDY_PATH" : "START_SESSION",
      label: isStudyRelevant
        ? `Continue ${profile.studyLayerName}`
        : "Start session",
    },
    secondaryHomeCTA:
      stats.totalCompletedSessions > 0
        ? { intent: "OPEN_PROGRESS", label: "Review progress" }
        : null,
    homeSections: home.sections,
    homeSpotlight:
      stats.totalCompletedSessions === 0
        ? "none"
        : isStudyRelevant
          ? "study_layer"
          : boss.isVisible
            ? "boss_momentum"
            : "progress_proof",
    coachMessageStyle: resolveCoachMode(profile),
    companionMode:
      companionIntensity === "active"
        ? "active_partner"
        : companionIntensity === "subtle"
          ? "quiet_presence"
          : "visual_coach",
    companionVisualIntensity: companionIntensity,
    bossMode,
    bossCopyStyle:
      boss.intensity === "intense"
        ? "controlled_intensity"
        : boss.intensity === "game-like"
          ? "boss_health"
          : "subtle_momentum",
    homeLayoutVariant: resolveHomeLayoutVariant(profile, stats),
    coachTone: profile.preferredTone,
    companionIntensity,
    bossIntensity: resolveBossIntensity(profile, stats),
    studyLayerLabel: profile.studyLayerName,
    studyLayerProminence: isStudyRelevant
      ? "spotlight"
      : availability.study
        ? "supporting"
        : "hidden",
    sessionSuggestion: behavior.sessionSuggestion,
    completionSequence: completion.sequence,
    progressEmphasis:
      stats.totalCompletedSessions >= 7
        ? "intelligence"
        : stats.totalCompletedSessions >= 2
          ? "rhythm"
          : "basic",
    premiumMoment: resolvePremiumMoment(stats),
    ...systems,
    allowedRoutes: [
      "SessionStack.SessionSetup",
      "Main.Progress",
      ...(availability.study ? ["ContentStudy"] : []),
      ...(availability.boss && boss.isVisible && boss.intensity !== "subtle"
        ? ["Boss"]
        : []),
    ],
    allowedNotificationTypes: [
      "gentle_return",
      "progress_milestone",
      ...(availability.study ? ["study_continuation"] : []),
      ...(availability.boss && boss.isVisible && boss.intensity !== "subtle"
        ? ["boss_momentum"]
        : []),
    ],
    nextBestAction: {
      intent: isStudyRelevant ? "CONTINUE_STUDY_PATH" : "START_SESSION",
      label: behavior.sessionSuggestion,
    },
    behaviorAdaptations: behavior.adaptations,
    boss,
    completion,
    home,
    premium: resolvePremium(availability, stats),
    release: {
      hidden: systems.hiddenSystems,
      included: [
        "motivation_onboarding",
        "adaptive_home",
        "start_session",
        "completion_sequence",
        "study_layer",
      ],
      productionProof: [
        "real_device_first_session_qa",
        "restart_persistence_qa",
        "offline_slow_network_qa",
      ],
      teasedOnly: systems.teasedSystems.concat([
        "deep_coach_memory",
        "weekly_intelligence",
        "visual_identity_depth",
      ]),
    },
    routeGates: {
      boss: {
        canNavigate:
          availability.boss && boss.isVisible && boss.intensity !== "subtle",
        canQuery: availability.boss && stats.totalCompletedSessions > 0,
      },
      premium: {
        canNavigate: availability.premium,
        canQuery: availability.premium,
      },
    },
    sessionDefaults: {
      copy: behavior.copy,
      duration: behavior.duration,
      mode: stats.preferredSessionMode ?? profile.defaultSessionMode,
    },
  });
}
