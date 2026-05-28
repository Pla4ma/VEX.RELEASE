import { type UserChallengeSummary } from "../schemas";

export type ChallengeFilter = "ALL" | "DAILY" | "WEEKLY" | "EVENT" | "COMPLETED";

export const FILTER_OPTIONS: ChallengeFilter[] = [
  "ALL",
  "DAILY",
  "WEEKLY",
  "EVENT",
  "COMPLETED",
];

export function getFilteredChallenges(
  challengeSummaries: UserChallengeSummary[] | undefined,
  activeFilter: ChallengeFilter,
): UserChallengeSummary[] {
  if (!challengeSummaries) {
    return [];
  }
  switch (activeFilter) {
    case "DAILY":
      return challengeSummaries.filter(
        (c: UserChallengeSummary) => c.type === "DAILY",
      );
    case "WEEKLY":
      return challengeSummaries.filter(
        (c: UserChallengeSummary) => c.type === "WEEKLY",
      );
    case "EVENT":
      return challengeSummaries.filter(
        (c: UserChallengeSummary) => c.type === "EVENT",
      );
    case "COMPLETED":
      return challengeSummaries.filter(
        (c: UserChallengeSummary) =>
          c.status === "COMPLETED" || c.status === "CLAIMED",
      );
    case "ALL":
    default:
      return challengeSummaries;
  }
}

export function getChallengeStats(challengeSummaries: UserChallengeSummary[] | undefined): {
  total: number;
  completed: number;
  claimed: number;
  available: number;
} {
  if (!challengeSummaries) {
    return { total: 0, completed: 0, claimed: 0, available: 0 };
  }
  const completed = challengeSummaries.filter(
    (c: UserChallengeSummary) => c.status === "COMPLETED",
  ).length;
  const claimed = challengeSummaries.filter(
    (c: UserChallengeSummary) => c.status === "CLAIMED",
  ).length;
  const available = challengeSummaries.filter(
    (c: UserChallengeSummary) => c.status === "ACTIVE",
  ).length;
  return { total: challengeSummaries.length, completed, claimed, available };
}
