import type { Achievement } from "../types";
import { SESSION_MILESTONE_ACHIEVEMENTS } from "./session-achievements-milestone";
import { SESSION_CONTEXTUAL_ACHIEVEMENTS } from "./session-achievements-contextual";

export const SESSION_ACHIEVEMENTS: Achievement[] = [
  ...SESSION_MILESTONE_ACHIEVEMENTS,
  ...SESSION_CONTEXTUAL_ACHIEVEMENTS,
];
