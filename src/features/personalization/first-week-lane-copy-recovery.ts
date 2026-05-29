import type { Lane } from "../lane-engine/types";

type LaneCopy = {
  laneStageTheme: string;
  primaryMessage: string;
  unlockExplanation: string;
};

const DAY_4_RECOVERY: Record<Lane, LaneCopy> = {
  student: {
    laneStageTheme: "study_recovery",
    primaryMessage: "Need a shorter study block today?",
    unlockExplanation:
      "VEX helps you stay on track even when energy dips. A recovery session counts.",
  },
  game_like: {
    laneStageTheme: "run_recovery",
    primaryMessage: "A recovery run still counts as movement.",
    unlockExplanation:
      "Not every encounter needs full intensity. VEX tracks recovery as part of your rhythm.",
  },
  deep_creative: {
    laneStageTheme: "project_recovery",
    primaryMessage: "Return to your project with one small move.",
    unlockExplanation:
      "Creative flow has natural pauses. VEX preserves your thread through recovery days.",
  },
  minimal_normal: {
    laneStageTheme: "clean_recovery",
    primaryMessage: "One tiny block keeps the momentum alive.",
    unlockExplanation:
      "Clean mode means not forcing it. VEX stays present without pressure.",
  },
};

const DAY_6_WEEKLY_PREP: Record<Lane, LaneCopy> = {
  student: {
    laneStageTheme: "study_weekly_prep",
    primaryMessage: "One more study block before weekly intelligence.",
    unlockExplanation:
      "Six study sessions built real evidence. VEX prepares your first-week analysis.",
  },
  game_like: {
    laneStageTheme: "run_weekly_prep",
    primaryMessage: "One more run to complete the week's data.",
    unlockExplanation:
      "Six encounters give VEX enough signal to report back on what worked.",
  },
  deep_creative: {
    laneStageTheme: "project_weekly_prep",
    primaryMessage: "One more project session to complete the full picture.",
    unlockExplanation:
      "Six project blocks for VEX to analyze creative continuity patterns.",
  },
  minimal_normal: {
    laneStageTheme: "clean_weekly_prep",
    primaryMessage: "One more clean block before the weekly view.",
    unlockExplanation:
      "Six sessions of quiet rhythm. VEX has enough signal for a meaningful insight.",
  },
};

export function getDay4RecoveryCopy(lane: Lane): LaneCopy {
  return DAY_4_RECOVERY[lane];
}

export function getDay6WeeklyPrepCopy(lane: Lane): LaneCopy {
  return DAY_6_WEEKLY_PREP[lane];
}

export { DAY_4_RECOVERY, DAY_6_WEEKLY_PREP };
