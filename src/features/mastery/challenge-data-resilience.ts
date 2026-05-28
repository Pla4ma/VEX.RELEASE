import type { ChallengeTemplate } from "./types";

export const RESILIENCE_CHALLENGES: Record<
  "consistencyMastery" | "comebackMastery" | "bossMastery",
  ChallengeTemplate[]
> = {
  consistencyMastery: [
    {
      title: "Daily Grind",
      description:
        "Complete a qualifying session (15+ min, 50+ quality) every day for 5 days",
      target: 5,
      unit: "days",
      difficulty: "EASY",
      points: 3,
    },
    {
      title: "Two Weeks Strong",
      description: "Maintain a 14-day streak with no breaks",
      target: 14,
      unit: "days",
      difficulty: "MEDIUM",
      points: 5,
    },
    {
      title: "Monthly Master",
      description: "Hit a 30-day streak with at least 20 qualifying sessions",
      target: 30,
      unit: "days",
      difficulty: "HARD",
      points: 10,
    },
    {
      title: "Quality Streak",
      description:
        "Maintain a 7-day streak where every session is A grade or higher",
      target: 7,
      unit: "days",
      difficulty: "HARD",
      points: 8,
    },
    {
      title: "Centurion",
      description:
        "Achieve a 100-day streak (one missed day allowed with shield)",
      target: 100,
      unit: "days",
      difficulty: "ELITE",
      points: 25,
    },
  ],
  comebackMastery: [
    {
      title: "Resilience",
      description:
        "Recover from a broken streak and complete a session within 24 hours",
      target: 1,
      unit: "comeback",
      difficulty: "EASY",
      points: 3,
    },
    {
      title: "Phoenix Rising",
      description: "Achieve a 7-day streak after breaking a 14+ day streak",
      target: 7,
      unit: "days",
      difficulty: "MEDIUM",
      points: 5,
    },
    {
      title: "Unbreakable",
      description:
        "Reach a 30-day streak after losing a 30+ day streak before",
      target: 30,
      unit: "days",
      difficulty: "HARD",
      points: 10,
    },
    {
      title: "Stronger Than Before",
      description: "Beat your previous longest streak after a break",
      target: 1,
      unit: "record",
      difficulty: "HARD",
      points: 8,
    },
    {
      title: "True Grit",
      description:
        "Complete 3 sessions in the first 3 days after a streak break",
      target: 3,
      unit: "sessions",
      difficulty: "MEDIUM",
      points: 6,
    },
  ],
  bossMastery: [
    {
      title: "Boss Slayer",
      description: "Defeat a boss in under 50% of the expected session time",
      target: 50,
      unit: "% time",
      difficulty: "MEDIUM",
      points: 5,
    },
    {
      title: "Speed Kill",
      description:
        "Defeat a boss in under 25% of expected time with 90%+ purity",
      target: 25,
      unit: "% time",
      difficulty: "HARD",
      points: 10,
    },
    {
      title: "Combo Master",
      description: "Achieve a 5x damage combo during a boss fight",
      target: 5,
      unit: "combo",
      difficulty: "ELITE",
      points: 15,
    },
    {
      title: "Critical Striker",
      description: "Land 3 critical hits in a single boss encounter",
      target: 3,
      unit: "crits",
      difficulty: "HARD",
      points: 8,
    },
    {
      title: "Boss Berserker",
      description: "Defeat 3 bosses in a single week",
      target: 3,
      unit: "bosses",
      difficulty: "ELITE",
      points: 12,
    },
  ],
};
