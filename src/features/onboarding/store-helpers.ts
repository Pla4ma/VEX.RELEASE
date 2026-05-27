import { useAuthStore } from "../../store";
import { captureSilentFailure } from "../../utils/silent-failure";

import {
  OnboardingStateSchema,
  type CoachPersona,
  type OnboardingElement,
  type FocusDuration,
  type FocusGoal,
  type MotivationProfile,
  type MotivationProfileType,
  type OnboardingState,
} from "./schemas";

export type OnboardingDraft = {
  goal?: FocusGoal;
  focusDuration?: FocusDuration;
  displayName?: string;
  starterPresetId?: string;
  element?: OnboardingElement;
  explicitMotivationStyle?: MotivationProfileType;
  personaId?: CoachPersona;
  squadId?: string | null;
  chosenLane?: string | null;
};

function getCurrentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

export function mergeOnboardingCompletion(
  isOnboarded: boolean,
  completedAt: number | null,
): Pick<OnboardingState, "isOnboarded" | "completedAt" | "completedForUserId"> {
  const currentUserId = getCurrentUserId();
  return {
    isOnboarded,
    completedAt,
    completedForUserId: isOnboarded ? currentUserId : null,
  };
}

export function isCompletionValidForUser(
  state: Pick<
    OnboardingState,
    "isOnboarded" | "completedAt" | "completedForUserId"
  >,
  userId: string | null | undefined,
): boolean {
  if (!userId) {
    return false;
  }

  if (!state.isOnboarded || !state.completedAt) {
    return false;
  }

  return state.completedForUserId === userId;
}

/**
 * Derives a MotivationProfile from onboarding choices.
 *
 * This profile controls which features unlock earlier or later.
 * It is the single decision point for the user's unlock path.
 *
 * Goal → primary motivation axis:
 *   STUDY → student
 *   WORK → worker
 *   CREATIVE → creator
 *   PERSONAL → calm (default)
 *
 * Persona → intensity modifier:
 *   mentor → calm, wise
 *   cheerleader → friendly
 *   drill-sergeant → intense
 *
 * Element → secondary flavor:
 *   FLAME → game_like, intense
 *   WAVE → calm
 *   TERRA → worker, calm
 *   ZEPHYR → friendly
 *   VOID → intense, competitive
 *   LUMINA → student, creator
 */
export function deriveMotivationProfile(
  goal: FocusGoal | null | undefined,
  persona: CoachPersona | null | undefined,
  element: OnboardingElement | null | undefined,
  explicitStyle: MotivationProfileType | null | undefined,
): MotivationProfile {
  if (explicitStyle) {
    return { primary: explicitStyle, secondary: [] };
  }

  const primaryMap: Record<string, MotivationProfileType> = {
    STUDY: "study_focused",
    WORK: "worker",
    CREATIVE: "creator",
    PERSONAL: "calm",
  };
  const primary = goal ? (primaryMap[goal] ?? "calm") : "calm";

  const secondary: MotivationProfileType[] = [];

  const effectivePersona = persona ?? "mentor";
  switch (effectivePersona) {
    case "drill-sergeant":
      secondary.push("intense");
      break;
    case "cheerleader":
      secondary.push("friendly");
      break;
    case "mentor":
    default:
      secondary.push("coach_led");
      break;
  }

  const effectiveElement = element ?? "LUMINA";
  switch (effectiveElement) {
    case "FLAME":
      if (!secondary.includes("game_like")) secondary.push("game_like");
      if (!secondary.includes("intense")) secondary.push("intense");
      break;
    case "WAVE":
      if (!secondary.includes("calm")) secondary.push("calm");
      break;
    case "TERRA":
      if (!secondary.includes("worker")) secondary.push("worker");
      break;
    case "ZEPHYR":
      if (!secondary.includes("friendly")) secondary.push("friendly");
      break;
    case "VOID":
      if (!secondary.includes("intense")) secondary.push("intense");
      if (!secondary.includes("competitive")) secondary.push("competitive");
      break;
    case "LUMINA":
      if (!secondary.includes("study_focused")) secondary.push("study_focused");
      break;
  }

  return { primary, secondary };
}

export function createRehydrationHandler(
  setState: (partial: Partial<OnboardingState>) => void,
): (state: OnboardingState | undefined) => void {
  return (state) => {
    if (!state) return;
    try {
      OnboardingStateSchema.parse(state);
      if (
        state.goal ||
        state.persona ||
        state.element ||
        state.explicitMotivationStyle
      ) {
        const profile = deriveMotivationProfile(
          state.goal,
          state.persona,
          state.element,
          state.explicitMotivationStyle,
        );
        if (!state.motivationProfile) {
          setState({ motivationProfile: profile });
        }
      }
    } catch (error) {
      captureSilentFailure(error, {
        feature: "onboarding",
        operation: "safe-fallback",
        type: "data",
      });
    }
  };
}
