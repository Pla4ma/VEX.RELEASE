import {
  DEFAULT_COMPANION_ELEMENT,
  STARTER_PRESETS,
  STEP_TITLES,
} from "./components";
import { DEFAULT_PERSONA_ID } from "./components/onboarding-flow-data";
import type {
  OnboardingGoal,
  MotivationProfileType,
} from "../../features/onboarding";
import type { OnboardingDraft } from "../../features/onboarding/store-helpers";

export const LAST_STEP_INDEX = STEP_TITLES.length - 1;

export function clampStep(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(Math.max(0, value), LAST_STEP_INDEX);
}

export interface StepValidation {
  isContinueDisabled: boolean;
}

export function getStepValidation(
  step: number,
  goal: OnboardingGoal | undefined,
  motivationStyle: string | undefined,
  isFinishing: boolean,
): StepValidation {
  const isContinueDisabled =
    (step === 0 && !goal) ||
    (step === 1 && !motivationStyle) ||
    step === 2 ||
    isFinishing;
  return { isContinueDisabled };
}

export function buildDraftPayload(params: {
  goal: OnboardingGoal | undefined;
  motivationStyle: MotivationProfileType | undefined;
  starterPresetId: string | undefined;
  chosenLane: string | undefined;
}): OnboardingDraft {
  return {
    element: DEFAULT_COMPANION_ELEMENT,
    explicitMotivationStyle: params.motivationStyle,
    goal: params.goal,
    personaId: DEFAULT_PERSONA_ID,
    squadId: null,
    starterPresetId: params.starterPresetId,
    chosenLane: params.chosenLane ?? undefined,
  };
}
