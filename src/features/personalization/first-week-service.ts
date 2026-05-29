import {
  FirstWeekExperienceSchema,
  FirstWeekInputSchema,
  type FirstWeekExperience,
  type FirstWeekResolverInput,
  type FirstWeekStage,
} from "./first-week-schemas";
import {
  resolveFirstWeekExperiment,
  resolveLaneCopy,
  resolveReturnTomorrowHook,
} from "./first-week-lane-copy";
import {
  deriveCompanionObservation,
  deriveWeeklyRecommendation,
  deriveLanePath,
  type WeeklyRecommendation,
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
import { deriveDayStory } from "./first-week-day-story";

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

  let weeklyRec: WeeklyRecommendation | null = null;

  if (engineOn && currentDayStage === "DAY_3_COMPANION_CONNECTION") {
    const obs = deriveCompanionObservation(lane, sp);
    unlockExplanation = obs.observation;
  }
  if (engineOn && currentDayStage === "DAY_7_DEEPER_MODE") {
    weeklyRec = deriveWeeklyRecommendation(
      lane,
      sp,
      input.behaviorStats.bossEngagement,
      input.behaviorStats.studyUsageRatio,
    );
    primaryMessage = weeklyRec.headline;
    unlockExplanation = weeklyRec.recommendation;
  }
  if (engineOn && currentDayStage === "DAY_5_PATH_FORMING")
    unlockExplanation = deriveLanePath(
      lane,
      sp,
      input.behaviorStats.studyUsageRatio,
    ).pathDescription;
  if (engineOn && currentDayStage === "DAY_4_RECOVERY") {
    const obs = deriveCompanionObservation(lane, sp);
    unlockExplanation = obs.observation;
  }
  if (engineOn && currentDayStage === "DAY_6_WEEKLY_PREP") {
    const path = deriveLanePath(lane, sp, input.behaviorStats.studyUsageRatio);
    unlockExplanation = path.pathDescription;
  }

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

  const stageToEmphasis: Record<FirstWeekStage, string> = {
    DAY_0_NOT_STARTED: "confirmation_coach_next_action",
    DAY_0_FIRST_SESSION_STARTED: "confirmation_coach_next_action",
    DAY_1_RETURN: "confirmation_progress_next_action",
    DAY_2_PROGRESS_PROOF: "confirmation_proof_next_action",
    DAY_3_COMPANION_CONNECTION: "confirmation_companion_next_action",
    DAY_4_RECOVERY: "confirmation_recovery_next_action",
    DAY_5_PATH_FORMING: "confirmation_coach_progress_next_action",
    DAY_6_WEEKLY_PREP: "confirmation_anticipation_next_action",
    DAY_7_DEEPER_MODE: "confirmation_weekly_intelligence_next_action",
    POST_DAY_7: "confirmation_coach_progress_next_action",
  };

  const primaryCtaLabel =
    currentDayStage === "DAY_0_NOT_STARTED"
      ? input.primaryGoal === "study" || input.primaryGoal === "learning"
        ? "Start first study block"
        : input.primaryGoal === "creative"
          ? "Protect one project block"
          : input.primaryGoal === "work" && input.motivationStyle === "game_like"
            ? "Start first clean run"
            : "Start first session"
      : currentDayStage === "DAY_3_COMPANION_CONNECTION"
        ? "See what VEX learned"
        : currentDayStage === "DAY_7_DEEPER_MODE"
          ? "See weekly intelligence"
          : currentDayStage === "DAY_4_RECOVERY"
            ? "Start recovery session"
            : currentDayStage === "DAY_6_WEEKLY_PREP"
              ? "Start one more session"
              : "Start next session";

  return FirstWeekExperienceSchema.parse({
    allowedHomeSurfaces,
    bossIntensity,
    coachMessageType:
      comebackState !== "none" ? "comeback" : currentDayStage.toLowerCase(),
    comebackState,
    completionEmphasis: stageToEmphasis[currentDayStage] ?? "confirmation_coach_progress_next_action",
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
      label: primaryCtaLabel,
    },
    primaryMessage,
    secondaryCTA:
      input.completedSessions >= 2
        ? currentDayStage === "DAY_3_COMPANION_CONNECTION"
          ? { intent: "OPEN_PROGRESS", label: "Review progress" }
          : currentDayStage === "DAY_7_DEEPER_MODE" && weeklyRec !== null
            ? { intent: "START_SESSION", label: weeklyRec.nextAction }
            : { intent: "OPEN_PROGRESS", label: "Review progress" }
        : null,
    spotlightSurface: allowedHomeSurfaces.includes("tiny_boss_teaser")
      ? "tiny_boss_teaser"
      : currentDayStage === "DAY_7_DEEPER_MODE" || currentDayStage === "DAY_6_WEEKLY_PREP"
        ? "weekly_insight"
        : currentDayStage === "DAY_3_COMPANION_CONNECTION"
          ? "companion_continuity"
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
    returnTomorrowHook: resolveReturnTomorrowHook(currentDayStage, lane),
    dayStory: deriveDayStory(currentDayStage, lane, weeklyRec),
  });
}
