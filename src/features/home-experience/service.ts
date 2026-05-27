import {
  HomeExperienceModelSchema,
  type ExplicitMotivationStyle,
  type HomeExperienceModel,
  type HomeExperienceStage,
  type HomeSection,
} from "./schemas";
import type { VexExperience } from "../personalization";
import type { FirstWeekExperience } from "../personalization/first-week-schemas";

interface HomeExperienceInput {
  explicitMotivationStyle: ExplicitMotivationStyle | null;
  totalCompletedSessions: number;
  resolvedExperience?: VexExperience;
  firstWeekExperience?: FirstWeekExperience;
}

const DAY_ZERO_HIDDEN: HomeSection[] = [
  "session_reflection",
  "progress_signal",
  "companion_thread",
  "adaptive_challenge",
];

export function getHomeStage(
  totalCompletedSessions: number,
): HomeExperienceStage {
  if (totalCompletedSessions <= 0) return "STAGE_0";
  if (totalCompletedSessions === 1) return "STAGE_1";
  if (totalCompletedSessions <= 4) return "STAGE_2";
  if (totalCompletedSessions <= 9) return "STAGE_3";
  return "STAGE_4";
}

function resolveSpotlight(
  style: ExplicitMotivationStyle | null,
  stage: HomeExperienceStage,
  totalSessions: number,
):
  | "none"
  | "study"
  | "coach"
  | "boss_progress"
  | "progress_rhythm"
  | "companion" {
  if (stage === "STAGE_0") return "none";
  if (stage === "STAGE_1") return "progress_rhythm";
  switch (style) {
    case "study_focused":
      return "study";
    case "coach_led":
      return "coach";
    case "game_like":
      return totalSessions >= 5 ? "boss_progress" : "progress_rhythm";
    case "intense":
      return totalSessions >= 3 ? "boss_progress" : "progress_rhythm";
    case "calm":
      return "progress_rhythm";
    default:
      return "companion";
  }
}

function getCoachCopy(
  resolved: VexExperience | undefined,
  fw: FirstWeekExperience | undefined,
): string {
  if (fw?.comebackState !== "none") {
    return (
      fw?.primaryMessage ?? "You are not behind. Start with one clean session."
    );
  }
  return (
    resolved?.home.coachCopy ??
    "Start with one clean block and let VEX adjust around you."
  );
}

function getPremiumCopy(
  resolved: VexExperience | undefined,
  fw: FirstWeekExperience | undefined,
): string {
  if (fw && (fw.premiumMoment === "none" || fw.premiumMoment === "hidden")) {
    return "Premium appears after VEX has shown real personal value.";
  }
  return (
    resolved?.premium.copy ??
    "Premium appears after VEX has shown real personal value."
  );
}

function getStudyLabel(
  _resolved: VexExperience | undefined,
  fw: FirstWeekExperience | undefined,
  style: ExplicitMotivationStyle | null,
): string {
  if (fw?.studyLayerLabel) return fw.studyLayerLabel;
  if (style === "study_focused") return "Study OS";
  return "Deep Work Plan";
}

function getBossPlacement(
  _resolved: VexExperience | undefined,
  fw: FirstWeekExperience | undefined,
  isDayZero: boolean,
): string {
  if (isDayZero && fw?.bossIntensity !== "hidden") {
    return "A tiny visual wrapper only; no boss route or query.";
  }
  if (fw?.bossIntensity === "hidden") {
    return "Boss surface blocked during first-week phase.";
  }
  return "Adaptive challenge hint after progress context exists.";
}

export function buildHomeExperienceModel(
  input: HomeExperienceInput,
): HomeExperienceModel {
  const stage = getHomeStage(input.totalCompletedSessions);
  const resolved = input.resolvedExperience;
  const fw = input.firstWeekExperience;

  const coachCopy = getCoachCopy(resolved, fw);
  const premiumCopy = getPremiumCopy(resolved, fw);
  const studyLabel = getStudyLabel(resolved, fw, input.explicitMotivationStyle);

  const isDayZero = stage === "STAGE_0";
  const visibleSections: HomeSection[] = isDayZero
    ? [
        "motivation_style",
        "coach_line",
        "primary_session",
        "single_evolution_teaser",
      ]
    : [
        "coach_line",
        "primary_session",
        "session_reflection",
        "progress_signal",
      ];

  const spotlight = resolveSpotlight(
    input.explicitMotivationStyle,
    stage,
    input.totalCompletedSessions,
  );

  const primaryCta =
    fw?.primaryCTA.label ??
    (isDayZero ? "Start First Session" : "Start Next Session");
  const secondaryCta =
    fw?.secondaryCTA?.label ?? (isDayZero ? "Choose style" : "Review progress");
  const unlockCopy =
    fw?.unlockTease &&
    fw.premiumMoment !== "none" &&
    fw.premiumMoment !== "hidden"
      ? fw.unlockTease
      : premiumCopy;

  return HomeExperienceModelSchema.parse({
    aiCoachMessageStyle: coachCopy,
    allowedQueries: isDayZero
      ? ["session_stats", "onboarding_state", "home_priority_minimal"]
      : [
          "session_stats",
          "onboarding_state",
          "home_priority",
          "streak_summary",
        ],
    allowedRoutes: isDayZero
      ? ["SessionStack.SessionSetup"]
      : ["SessionStack.SessionSetup", "FocusScoreDashboard"],
    companionPlacement: isDayZero
      ? "Soft visual presence inside the coach line."
      : "Small continuity thread below the primary action.",
    hiddenSections: isDayZero ? DAY_ZERO_HIDDEN : ["adaptive_challenge"],
    mustNotRun: isDayZero
      ? [
          "boss_query",
          "challenge_query",
          "study_plan_query",
          "squad_query",
          "locked_route_registration",
        ]
      : ["locked_route_registration"],
    primaryCta,
    progressPlacement: isDayZero
      ? "Hidden until the first completed session creates a real signal."
      : "One compact signal below the action.",
    rpgBossPlacement: getBossPlacement(resolved, fw, isDayZero),
    secondaryCta,
    spotlight,
    stage,
    studyOsPlacement: studyLabel,
    teasedElements: [
      {
        system: stage === "STAGE_0" ? "companion" : "progress",
        copy: unlockCopy,
      },
    ],
    unlockPathCopy: unlockCopy,
    visibleSections,
  });
}
