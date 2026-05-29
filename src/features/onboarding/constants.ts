import type { FocusGoal } from "./schemas";

export const ONBOARDING_GOALS: Array<{
  id: FocusGoal;
  label: string;
  description: string;
}> = [
  {
    id: "WORK",
    label: "Find My Rhythm",
    description: "Let VEX learn what kind of sessions you finish best",
  },
  {
    id: "STUDY",
    label: "Study",
    description: "Learn and absorb new information with adaptive review",
  },
  {
    id: "CREATIVE",
    label: "Deep Work",
    description: "Protect creative focus — VEX remembers where you left off",
  },
  {
    id: "PERSONAL",
    label: "Start Clean",
    description: "One focused session without noise or tracking pressure",
  },
];
