import { useMemo } from "react";
import { useOnboardingStore } from "../../../features/onboarding";
import { SessionMode } from "../../../session/modes";
import type { MotivationProfileType } from "../../../features/onboarding/schemas";

export interface FirstSessionPersonalization {
  defaultMode: SessionMode;
  suggestedDurationMinutes: number;
  durationLabel: string;
  coachLine: string;
  companionElement: string | null;
}

type ModeMap = Partial<Record<MotivationProfileType, SessionMode>>;

const PROFILE_TO_MODE: ModeMap = {
  study_focused: SessionMode.STUDY,
  student: SessionMode.STUDY,
  worker: SessionMode.LIGHT_FOCUS,
  calm: SessionMode.LIGHT_FOCUS,
  friendly: SessionMode.LIGHT_FOCUS,
  coach_led: SessionMode.LIGHT_FOCUS,
  game_like: SessionMode.LIGHT_FOCUS,
  intense: SessionMode.DEEP_WORK,
  competitive: SessionMode.DEEP_WORK,
  creator: SessionMode.CREATIVE,
};

const PROFILE_TO_DURATION: Partial<Record<MotivationProfileType, number>> = {
  calm: 15,
  game_like: 15,
  intense: 25,
  competitive: 25,
  study_focused: 25,
  student: 25,
  worker: 25,
  friendly: 20,
  coach_led: 20,
  creator: 25,
};

const PROFILE_TO_COACH_LINE: Partial<Record<MotivationProfileType, string>> = {
  calm: "Start gentle. No pressure. Just show up.",
  game_like: "One session. That is all it takes to begin.",
  intense: "One block. Full intensity. Set the tone.",
  competitive: "Every session counts. Make this one matter.",
  study_focused: "Start one study block. Lock in and absorb.",
  student: "Start your study rhythm now. Build the habit.",
  worker: "Protect one project block. Give it your full attention.",
  friendly: "No pressure at all. Just you and the timer.",
  coach_led: "Your coach believes in this first step.",
  creator: "Start one clean session. Your presence is all you need.",
};

function pickProfileType(
  primary: MotivationProfileType,
  secondary: MotivationProfileType[],
): MotivationProfileType {
  return primary;
}

export function useFirstSessionPersonalization(): FirstSessionPersonalization {
  const goal = useOnboardingStore((s) => s.goal);
  const element = useOnboardingStore((s) => s.element);
  const focusDuration = useOnboardingStore((s) => s.focusDuration);
  const motivationProfile = useOnboardingStore((s) => s.motivationProfile);

  return useMemo(() => {
    const profileType = motivationProfile
      ? pickProfileType(motivationProfile.primary, motivationProfile.secondary)
      : goalToProfileType(goal);

    const defaultMode = PROFILE_TO_MODE[profileType] ?? SessionMode.LIGHT_FOCUS;

    const baseDuration = PROFILE_TO_DURATION[profileType] ?? 25;
    const suggestedDurationMinutes = focusDuration ?? baseDuration;

    const coachLine =
      PROFILE_TO_COACH_LINE[profileType] ??
      "One session. That is all it takes to begin.";

    const durationLabel = profileType === "calm"
      ? "A gentle start to build your rhythm"
      : "Recommended to build momentum";

    return {
      companionElement: element ?? null,
      coachLine,
      defaultMode,
      durationLabel,
      suggestedDurationMinutes,
    };
  }, [element, focusDuration, goal, motivationProfile]);
}

function goalToProfileType(goal: string | null): MotivationProfileType {
  switch (goal) {
    case "STUDY":
      return "study_focused";
    case "WORK":
      return "worker";
    case "CREATIVE":
      return "creator";
    case "PERSONAL":
      return "calm";
    default:
      return "friendly";
  }
}
