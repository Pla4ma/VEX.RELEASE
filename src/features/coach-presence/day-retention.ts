import type { JourneyState } from "../retention-loop/schemas";

export type RetentionMoment = "day_1" | "day_3" | "day_7";

export interface RetentionMessage {
  moment: RetentionMoment;
  headline: string;
  cta: string;
  showWhatVEXLearned: boolean;
  showWeeklyIntelligence: boolean;
  shouldShow: boolean;
}

export function coachMomentFromJourneyState(
  state: JourneyState,
): RetentionMessage | null {
  const { day, phase } = state;

  if (day === 0) return null;

  if (phase === "onboarding") return null;

  if (phase === "return" || day === 1) {
    return {
      moment: "day_1",
      headline: state.homeMessage.headline,
      cta: state.primaryCta,
      showWhatVEXLearned: false,
      showWeeklyIntelligence: false,
      shouldShow: true,
    };
  }

  if (phase === "insight" || day === 3) {
    return {
      moment: "day_3",
      headline: state.momentType.type === "what_vex_learned"
        ? state.homeMessage.headline
        : state.homeMessage.headline,
      cta: state.primaryCta,
      showWhatVEXLearned: state.momentType.type === "what_vex_learned",
      showWeeklyIntelligence: false,
      shouldShow: true,
    };
  }

  if (phase === "weekly_intelligence" || day === 7) {
    return {
      moment: "day_7",
      headline: state.homeMessage.headline,
      cta: state.primaryCta,
      showWhatVEXLearned: state.momentType.type === "weekly_insight",
      showWeeklyIntelligence: state.momentType.type === "weekly_insight",
      shouldShow: true,
    };
  }

  return null;
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
