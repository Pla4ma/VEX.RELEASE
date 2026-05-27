import type { Lane } from "../lane-engine/types";

export type RetentionMoment = "day_1" | "day_3" | "day_7";

export interface RetentionInput {
  daysSinceFirstSession: number;
  streakDays: number;
  totalSessions: number;
  lane: Lane;
  hasEnoughEvidence: boolean;
  averageFocusScore: number | undefined;
  bestSessionDurationMinutes: number | undefined;
  isPremium: boolean;
}

export interface RetentionMessage {
  moment: RetentionMoment;
  message: string;
  nextAction: string;
  showWhatVEXLearned: boolean;
  showWeeklyIntelligence: boolean;
  shouldShow: boolean;
}

const DAY_1_MESSAGES: Record<Lane, { message: string; nextAction: string }> = {
  student: {
    message: "Welcome back. Start one clean study block.",
    nextAction: "Start a study block",
  },
  game_like: {
    message: "Welcome back. Bank one clean block for the run.",
    nextAction: "Start a run",
  },
  deep_creative: {
    message: "Welcome back. Start one clean project block.",
    nextAction: "Start a project block",
  },
  minimal_normal: {
    message: "Welcome back. Start one clean block.",
    nextAction: "Start focus",
  },
};

const DAY_7_WEEKLY_MESSAGES: Record<
  Lane,
  { helped: string; gotInWay: string; bestMove: string }
> = {
  student: {
    helped: "Regular review blocks.",
    gotInWay: "Jumping into new material without review.",
    bestMove: "Queue one review block before adding new material.",
  },
  game_like: {
    helped: "Clean starts without setup friction.",
    gotInWay: "Too many targets at once.",
    bestMove: "Pick one clear target per session.",
  },
  deep_creative: {
    helped: "Naming the next concrete step before starting.",
    gotInWay: "Starting without a defined entry point.",
    bestMove: "Identify the next move, then start the timer.",
  },
  minimal_normal: {
    helped: "Simple, clean blocks with no extra ceremony.",
    gotInWay: "Overcomplicating the setup.",
    bestMove: "Keep the next session small and clear.",
  },
};

function buildDay1(
  lane: Lane,
): RetentionMessage {
  const dm = DAY_1_MESSAGES[lane];
  return {
    moment: "day_1",
    message: dm.message,
    nextAction: dm.nextAction,
    showWhatVEXLearned: false,
    showWeeklyIntelligence: false,
    shouldShow: true,
  };
}

function buildDay3(input: RetentionInput): RetentionMessage {
  const showLearned = input.hasEnoughEvidence && input.totalSessions >= 3;
  if (showLearned) {
    return {
      moment: "day_3",
      message: "Three days in. VEX has some observations.",
      nextAction: "See what VEX noticed",
      showWhatVEXLearned: true,
      showWeeklyIntelligence: false,
      shouldShow: true,
    };
  }
  return {
    moment: "day_3",
    message: "Three days of showing up. Keep the rhythm.",
    nextAction: "Start the next block",
    showWhatVEXLearned: false,
    showWeeklyIntelligence: false,
    shouldShow: true,
  };
}

function buildDay7(input: RetentionInput): RetentionMessage {
  const weekly = DAY_7_WEEKLY_MESSAGES[input.lane];
  const premiumLine =
    input.isPremium && input.totalSessions >= 5
      ? " VEX Pro can go deeper with weekly analysis."
      : "";

  const message = [
    `Seven days of practice. What helped: ${weekly.helped}.`,
    `What got in the way: ${weekly.gotInWay}.`,
    `Best next move: ${weekly.bestMove}.`,
    premiumLine,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    moment: "day_7",
    message,
    nextAction: weekly.bestMove,
    showWhatVEXLearned: input.hasEnoughEvidence,
    showWeeklyIntelligence: input.hasEnoughEvidence,
    shouldShow: true,
  };
}

export function getRetentionMoment(input: RetentionInput): RetentionMessage {
  const { daysSinceFirstSession } = input;
  if (daysSinceFirstSession <= 0) {
    return {
      moment: "day_1",
      message: "",
      nextAction: "",
      showWhatVEXLearned: false,
      showWeeklyIntelligence: false,
      shouldShow: false,
    };
  }
  if (daysSinceFirstSession === 1) return buildDay1(input.lane);
  if (daysSinceFirstSession === 3) return buildDay3(input);
  if (daysSinceFirstSession === 7) return buildDay7(input);
  return {
    moment: "day_7",
    message: "",
    nextAction: "",
    showWhatVEXLearned: false,
    showWeeklyIntelligence: false,
    shouldShow: false,
  };
}

export function shouldShowRetentionMoment(input: {
  daysSinceFirstSession: number;
  lastRetentionShownDay: number | null;
}): RetentionMoment | null {
  const day = input.daysSinceFirstSession;
  if (day <= 0) return null;
  if (input.lastRetentionShownDay === day) return null;
  if (day === 1 || day === 3 || day === 7) {
    return `day_${day}` as RetentionMoment;
  }
  return null;
}
