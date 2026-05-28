import {
  FirstWeekExperienceSchema,
  FirstWeekInputSchema,
  type FirstWeekExperience,
  type FirstWeekResolverInput,
} from "./first-week-schemas";
import {
  resolveFirstWeekExperiment,
  resolveLaneCopy,
} from "./first-week-lane-copy";
import {
  deriveCompanionObservation,
  deriveWeeklyRecommendation,
  deriveLanePath,
} from "./first-week-engines";
import {
  FINAL_RELEASE_HIDDEN,
  resolveStage,
  resolveStudyLabel,
  resolveComeback,
  resolveComebackMessage,
  resolveSurfaces,
  resolvePremiumMoment,
  resolveLaneProfile,
  resolveBlockedReasons,
} from "./first-week-resolvers";

export function resolveFirstWeekExperience(
  rawInput: FirstWeekResolverInput,
): FirstWeekExperience {
  const input = FirstWeekInputSchema.parse(rawInput);
  const currentDayStage = resolveStage(input);
  const comebackState = resolveComeback(input.daysSinceLastSession);
  const laneProfile = resolveLaneProfile(input);
  const allowedHomeSurfaces = resolveSurfaces(
    currentDayStage,
    input,
    comebackState,
    laneProfile,
  );
  const studyLayerLabel = resolveStudyLabel(input.primaryGoal);
  const premiumMoment = resolvePremiumMoment(input, currentDayStage);
  const defaultMessage =
    comebackState !== "none"
      ? resolveComebackMessage(input.motivationStyle)
      : input.completedSessions === 0
        ? "VEX is shaped around one clean first block."
        : "Your rhythm is forming. Start the next clean block.";
  const laneCopy = resolveLaneCopy(
    currentDayStage,
    laneProfile,
    defaultMessage,
    comebackState !== "none",
  );
  const sp = input.sessionProfile;
  const engineOn = sp !== undefined && comebackState === "none";
  let primaryMessage = laneCopy.primaryMessage;
  let unlockExplanation = laneCopy.unlockExplanation;
  const lane = laneProfile.primaryLane;

  if (engineOn && currentDayStage === "DAY_3_COMPANION_CONNECTION")
    unlockExplanation = deriveCompanionObservation(lane, sp).observation;
  if (engineOn && currentDayStage === "DAY_7_DEEPER_MODE") {
    const rec = deriveWeeklyRecommendation(
      lane,
      sp,
      input.behaviorStats.bossEngagement,
      input.behaviorStats.studyUsageRatio,
    );
    primaryMessage = rec.headline;
    unlockExplanation = rec.recommendation;
  }
  if (engineOn && currentDayStage === "DAY_5_PATH_FORMING")
    unlockExplanation = deriveLanePath(
      lane,
      sp,
      input.behaviorStats.studyUsageRatio,
    ).pathDescription;
  const bossIntensity = allowedHomeSurfaces.includes("tiny_boss_teaser")
    ? "tiny_tease"
    : input.completedSessions > 0 &&
        input.featureAvailability.boss &&
        laneProfile.primaryLane === "game_like"
      ? "visible"
      : input.completedSessions > 0 &&
          input.featureAvailability.boss &&
          laneProfile.primaryLane !== "minimal_normal"
        ? "subtle"
        : "hidden";

  return FirstWeekExperienceSchema.parse({
    allowedHomeSurfaces,
    bossIntensity,
    coachMessageType:
      comebackState !== "none" ? "comeback" : currentDayStage.toLowerCase(),
    comebackState,
    completionEmphasis: "confirmation_coach_progress_next_action",
    currentDayStage,
    hiddenSurfaces: FINAL_RELEASE_HIDDEN,
    lane: laneProfile.primaryLane,
    laneConfidence: laneProfile.confidence,
    laneStageTheme: laneCopy.laneStageTheme,
    notificationAllowedTypes: [
      "gentle_return",
      "coach_check_in",
      "progress_milestone",
    ],
    premiumMoment,
    primaryCTA: {
      intent:
        input.primaryGoal === "study" || input.primaryGoal === "learning"
          ? "CONTINUE_STUDY_PATH"
          : "START_SESSION",
      label:
        input.completedSessions === 0
          ? "Start first session"
          : "Start next session",
    },
    primaryMessage,
    secondaryCTA:
      input.completedSessions >= 2
        ? { intent: "OPEN_PROGRESS", label: "Review progress" }
        : null,
    spotlightSurface: allowedHomeSurfaces.includes("tiny_boss_teaser")
      ? "tiny_boss_teaser"
      : currentDayStage === "DAY_7_DEEPER_MODE"
        ? "weekly_insight"
        : currentDayStage === "DAY_5_PATH_FORMING"
          ? "study_deep_work_path"
          : input.completedSessions > 0
            ? "progress_proof"
            : "none",
    blockedSurfaceReasons: resolveBlockedReasons(laneProfile),
    firstWeekExperiment: resolveFirstWeekExperiment(
      laneProfile.primaryLane,
      currentDayStage,
    ),
    studyLayerLabel,
    unlockExplanation,
    unlockTease:
      input.completedSessions === 0
        ? "VEX opens one layer at a time after real sessions."
        : null,
  });
}
