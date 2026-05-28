/** Shared mock data for FocusScoreDashboard tests. */

export const mockScore = {
  currentScore: 750,
  previousScore: 740,
  band: "Elite",
  lastChangeReason: "Great session!",
  factors: {
    consistency: {
      score: 80,
      explanation: "Consistency is a clear strength right now.",
    },
    streakStability: {
      score: 70,
      explanation: "Streak stability is helping your score stay stable.",
    },
    sessionQuality: {
      score: 90,
      explanation: "Session quality is a clear strength right now.",
    },
    intentionalDifficulty: {
      score: 60,
      explanation:
        "Intentional difficulty is helping your score stay stable.",
    },
    recency: {
      score: 85,
      explanation: "Recency is a clear strength right now.",
    },
  },
  topPositiveFactor: "sessionQuality",
  topNegativeFactor: "intentionalDifficulty",
};

export const mockHistory = [
  {
    timestamp: new Date("2026-04-01").toISOString(),
    score: 700,
    delta: 0,
    reason: "",
  },
  {
    timestamp: new Date("2026-04-02").toISOString(),
    score: 710,
    delta: 10,
    reason: "",
  },
];

export const mockHistoryThreeDays = [
  ...mockHistory,
  {
    timestamp: new Date("2026-04-03").toISOString(),
    score: 705,
    delta: -5,
    reason: "",
  },
];
