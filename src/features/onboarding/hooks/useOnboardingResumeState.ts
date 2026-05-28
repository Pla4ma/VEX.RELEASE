import { useEffect, useState } from "react";
import { triggerHapticEvent, HapticEvents } from "../../../constants/haptics";
import { eventBus } from "../../../events";
import {
  OnboardingPersistence,
  getPartialData,
  getAbandonCount,
  isHighAbandonRisk,
} from "../utils/persistence";
import type { OnboardingStep } from "../types";

interface ResumeState {
  step: OnboardingStep | null;
  stepNumber: number;
  partialData: Record<string, unknown>;
  abandonCount: number;
  isHighRisk: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  "WELCOME",
  "GOAL_SETTING",
  "FOCUS_TIME",
  "NAME_SETUP",
  "FIRST_SESSION_CTA",
];

const STEP_LABELS: Record<OnboardingStep, string> = {
  WELCOME: "Welcome",
  GOAL_SETTING: "Goal Setting",
  FOCUS_TIME: "Focus Duration",
  NAME_SETUP: "Name Setup",
  FIRST_SESSION_CTA: "First Session",
};

function getStepNumber(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

export function getStepLabel(step: OnboardingStep): string {
  return STEP_LABELS[step] || step;
}

function getProgressSummary(state: ResumeState | null): string {
  if (!state) return "";
  const completed: string[] = [];
  if (state.partialData.goal) completed.push("goal");
  if (state.partialData.focusDuration) completed.push("focus duration");
  if (state.partialData.displayName) completed.push("name");
  if (completed.length === 0)
    return "You started but didn't complete any steps.";
  return `You've already set your ${completed.join(", ")}.`;
}

export function useOnboardingResumeState(
  onResume: () => void,
  onRestart: () => void,
  onDismiss: () => void,
) {
  const [state, setState] = useState<ResumeState | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    const hasIncomplete = OnboardingPersistence.hasIncomplete();
    if (!hasIncomplete) return;
    const step = OnboardingPersistence.getResumeStep();
    const partialData = getPartialData() || {};
    const abandonCount = getAbandonCount();
    const isHighRisk = isHighAbandonRisk();
    if (step) {
      const stepNumber = getStepNumber(step);
      setState({ step, stepNumber, partialData, abandonCount, isHighRisk });
      setIsVisible(true);
      triggerHapticEvent(HapticEvents.WARNING);
      eventBus.publish("analytics:track", {
        event: "onboarding_resume_prompt_shown",
        properties: { step, stepNumber, abandonCount, isHighRisk },
      });
    }
  }, []);

  const handleResume = () => {
    setSelectedAction("resume");
    eventBus.publish("analytics:track", {
      event: "onboarding_resume_selected",
      properties: { step: state?.step, abandonCount: state?.abandonCount },
    });
    onResume();
    setIsVisible(false);
  };

  const handleRestart = () => {
    setSelectedAction("restart");
    eventBus.publish("analytics:track", {
      event: "onboarding_restart_selected",
      properties: { step: state?.step, abandonCount: state?.abandonCount },
    });
    OnboardingPersistence.clear();
    onRestart();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setSelectedAction("dismiss");
    eventBus.publish("analytics:track", {
      event: "onboarding_resume_dismissed",
      properties: { step: state?.step, abandonCount: state?.abandonCount },
    });
    onDismiss();
    setIsVisible(false);
  };

  return {
    state,
    isVisible,
    selectedAction,
    getStepLabel,
    getProgressSummary: () => getProgressSummary(state),
    handleResume,
    handleRestart,
    handleDismiss,
  };
}
