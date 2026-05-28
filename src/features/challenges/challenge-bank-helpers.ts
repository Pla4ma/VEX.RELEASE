/**
 * Challenge bank helper functions — querying and filtering challenge templates.
 */

import type { ChallengeDifficulty } from "./schemas";
import type { ChallengeBankTemplate } from "./challenge-bank-types";
import { EXPANDED_CHALLENGE_TEMPLATES } from "./challenge-bank-expansion";

export function getAllChallengeTemplates(): ChallengeBankTemplate[] {
  return EXPANDED_CHALLENGE_TEMPLATES;
}

export function getChallengesByType(type: string): ChallengeBankTemplate[] {
  return EXPANDED_CHALLENGE_TEMPLATES.filter((c) => c.type === type);
}

export function getChallengesByDifficulty(
  difficulty: ChallengeDifficulty,
): ChallengeBankTemplate[] {
  return EXPANDED_CHALLENGE_TEMPLATES.filter(
    (c) => c.difficulty === difficulty,
  );
}

export function getCurrentSeasonalChallenges(
  date: Date = new Date(),
): ChallengeBankTemplate[] {
  const currentMonth = date.getMonth();
  return EXPANDED_CHALLENGE_TEMPLATES.filter(
    (c) =>
      c.seasonal &&
      c.seasonWindow &&
      currentMonth >= c.seasonWindow.startMonth &&
      currentMonth <= c.seasonWindow.endMonth,
  );
}

export function getStandardChallenges(): ChallengeBankTemplate[] {
  return EXPANDED_CHALLENGE_TEMPLATES.filter((c) => !c.seasonal);
}

export function getRandomChallengeSet(
  count: number = 3,
): ChallengeBankTemplate[] {
  const shuffled = [...EXPANDED_CHALLENGE_TEMPLATES].sort(
    () => 0.5 - Math.random(),
  );
  return shuffled.slice(0, count);
}

export function getPersonalizedChallenges(
  preferredTimeOfDay: "morning" | "afternoon" | "evening" | "night",
  difficulty: string = "NORMAL",
): ChallengeBankTemplate[] {
  const timeTags: Record<string, string[]> = {
    morning: ["morning", "early-bird"],
    afternoon: ["afternoon", "mid-day"],
    evening: ["evening", "wind-down"],
    night: ["night", "night-owl"],
  };
  const preferredTags = timeTags[preferredTimeOfDay] || [];
  return EXPANDED_CHALLENGE_TEMPLATES.filter(
    (c) =>
      c.difficulty === difficulty &&
      c.tags?.some((tag) => preferredTags.includes(tag)),
  );
}
