export function getNextRecommendedStep(
  currentStep: string,
  state: Record<string, unknown>,
): { step: string; reason: string } | null {
  switch (currentStep) {
    case "WELCOME":
      return {
        step: "GOAL_SETTING",
        reason: "First, let us understand your focus goals",
      };
    case "GOAL_SETTING":
      return !state.goal
        ? null
        : {
            step: "FOCUS_TIME",
            reason: "Now let us set your preferred focus duration",
          };
    case "FOCUS_TIME":
      return !state.focusDuration
        ? null
        : state.skipName
          ? {
              step: "FIRST_SESSION_CTA",
              reason: "Ready to start your first session!",
            }
          : {
              step: "NAME_SETUP",
              reason: "Personalize your experience with a display name",
            };
    case "NAME_SETUP":
      return {
        step: "FIRST_SESSION_CTA",
        reason: "You are all set! Start your first focus session",
      };
    case "FIRST_SESSION_CTA":
      return null;
    default:
      return null;
  }
}

export function canSkipStep(
  step: string,
  _state: Record<string, unknown>,
): { canSkip: boolean; reason: string } {
  switch (step) {
    case "WELCOME":
      return {
        canSkip: true,
        reason: "You can skip the welcome, but we recommend viewing it",
      };
    case "GOAL_SETTING":
      return {
        canSkip: false,
        reason: "A focus goal is required to personalize your experience",
      };
    case "FOCUS_TIME":
      return {
        canSkip: false,
        reason: "Focus duration is required for session setup",
      };
    case "NAME_SETUP":
      return {
        canSkip: true,
        reason: "You can skip this and we will use a default name",
      };
    case "FIRST_SESSION_CTA":
      return {
        canSkip: true,
        reason: "You can skip and explore the app first",
      };
    default:
      return { canSkip: false, reason: "Unknown step" };
  }
}
