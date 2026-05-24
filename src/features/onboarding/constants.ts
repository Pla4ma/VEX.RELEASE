import type { FocusGoal } from './schemas';

export const ONBOARDING_GOALS: Array<{
  id: FocusGoal;
  label: string;
  description: string;
}> = [
  { id: "WORK", label: "Work", description: "Focus on professional tasks" },
  { id: "STUDY", label: "Study", description: "Learn and absorb new information" },
  { id: "CREATIVE", label: "Creative", description: "Create, design, or build something" },
  { id: "PERSONAL", label: "Personal", description: "Personal growth and organization" },
];
