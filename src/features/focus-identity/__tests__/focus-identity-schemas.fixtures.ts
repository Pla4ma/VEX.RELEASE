/**
 * Shared test fixtures for focus-identity-schemas tests.
 * Extracted to keep test files under the 200-line limit.
 */

export const validFactors = {
  consistency: {
    weightPercent: 35,
    score: 78,
    delta: 4,
    explanation: 'Strong weekly consistency.',
  },
  streakStability: {
    weightPercent: 25,
    score: 62,
    delta: -2,
    explanation: 'Recent streak drop.',
  },
  sessionQuality: {
    weightPercent: 20,
    score: 84,
    delta: 5,
    explanation: 'Higher quality sessions.',
  },
  intentionalDifficulty: {
    weightPercent: 10,
    score: 55,
    delta: 1,
    explanation: 'Balanced challenge level.',
  },
  recency: {
    weightPercent: 10,
    score: 71,
    delta: 3,
    explanation: 'Sessions are recent enough.',
  },
} as const;

export const validRecord = {
  id: '5fe6bc9e-9f8f-4ab9-a2bd-2f4f1c8014ba',
  userId: '4f093cc4-fce4-4425-ad64-4db4f3f76e95',
  currentScore: 600,
  previousScore: 590,
  band: 'Strong',
  factors: validFactors,
  updatedAt: '2026-05-06T10:00:00.000Z',
  createdAt: '2026-05-01T10:00:00.000Z',
  lastChangeReason: 'Session completion',
} as const;

export const validSignals = {
  consistency: 78,
  streakStability: 62,
  sessionQuality: 84,
  intentionalDifficulty: 55,
  recency: 71,
} as const;
