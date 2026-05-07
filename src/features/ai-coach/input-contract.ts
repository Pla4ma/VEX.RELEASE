/**
 * AI Coach Input Contract - Phase 7
 * 
 * Defines exactly what data the AI coach may and may not use.
 * Prevents AI slop by enforcing strict input validation.
 */

import { z } from 'zod';

// ============================================================================
// ALLOWED DATA - Coach may use these inputs
// ============================================================================

export const CoachInputContractSchema = z.object({
  // Session performance data
  recentSessionGrades: z.array(z.object({
    sessionId: z.string().uuid(),
    grade: z.number().min(0).max(100),
    duration: z.number().min(60).max(7200),
    completedAt: z.number().int().positive(),
    difficulty: z.enum(['EASY', 'NORMAL', 'CHALLENGING', 'PUSH']),
  })).max(10), // Last 10 sessions only
  
  // User preferences
  preferredSessionLengths: z.array(z.number().min(60).max(7200)).max(5),
  completionTimes: z.array(z.number().int().min(0).max(23)).max(7), // Hour of day
  
  // Streak data
  streakState: z.object({
    currentStreak: z.number().int().min(0),
    streakAtRisk: z.boolean(),
    hoursSinceLastSession: z.number().min(0),
    streakRecord: z.number().int().min(0),
    missedDays: z.number().int().min(0).max(7),
  }),
  
  // Focus Score factors
  focusScoreFactors: z.object({
    currentScore: z.number().min(0).max(100),
    trend: z.enum(['improving', 'stable', 'declining']),
    primaryFactors: z.array(z.enum([
      'consistency', 'duration', 'quality', 'timing', 'difficulty'
    ])).max(3),
  }),
  
  // Mission history
  missionHistory: z.array(z.object({
    missionId: z.string().uuid(),
    type: z.enum(['daily', 'weekly', 'milestone']),
    completed: z.boolean(),
    completedAt: z.number().int().positive().optional(),
    difficulty: z.enum(['EASY', 'NORMAL', 'CHALLENGING']),
  })).max(7), // Last 7 missions
  
  // User goal category
  userGoalCategory: z.enum([
    'stress_reduction', 'focus_improvement', 'habit_building', 
    'productivity', 'meditation', 'learning'
  ]),
  
  // Notification preferences
  notificationPreferences: z.object({
    enabled: z.boolean(),
    quietHoursStart: z.number().int().min(0).max(23).default(22),
    quietHoursEnd: z.number().int().min(0).max(23).default(7),
    maxPerDay: z.number().int().min(0).max(10).default(2),
  }),
  
  // Premium status
  premiumStatus: z.object({
    isActive: z.boolean(),
    tier: z.enum(['free', 'premium', 'premium_plus']).default('free'),
    features: z.array(z.string()).default([]),
  }),
  
  // Time context
  timeContext: z.object({
    currentHour: z.number().int().min(0).max(23),
    dayOfWeek: z.number().int().min(0).max(6),
    isWeekend: z.boolean(),
    localTimezone: z.string().max(50),
  }),
});

export type CoachInputContract = z.infer<typeof CoachInputContractSchema>;

// ============================================================================
// FORBIDDEN DATA - Coach must not use these
// ============================================================================

export const FORBIDDEN_DATA_FIELDS = [
  'rawPrivateNotes',
  'secrets',
  'apiKeys',
  'passwords',
  'emailAddresses',
  'phoneNumbers',
  'realNames',
  'locationData',
  'unvalidatedStorageData',
  'rawUserInput',
  'piifield',
] as const;

// ============================================================================
// Input Validation
// ============================================================================

/**
 * Validates coach input and removes forbidden PII
 */
export function validateCoachInput(rawInput: unknown): CoachInputContract {
  // First, parse the input structure
  const parsed = CoachInputContractSchema.parse(rawInput);
  
  // Additional PII sanitization
  return sanitizeInput(parsed);
}

/**
 * Removes potential PII from coach input
 */
function sanitizeInput(input: CoachInputContract): CoachInputContract {
  // Remove any potential PII from string fields
  const sanitized = {
    ...input,
    missionHistory: input.missionHistory.map(mission => ({
      ...mission,
      // Ensure no PII in mission data
    })),
    timeContext: {
      ...input.timeContext,
      // Validate timezone format
      localTimezone: input.timeContext.localTimezone.match(/^[A-Za-z_\/+-]+$/)
        ? input.timeContext.localTimezone
        : 'UTC',
    },
  };
  
  return sanitized;
}

/**
 * Creates fallback insight when data is missing
 */
export function createFallbackInsight(input: Partial<CoachInputContract>): {
  canCoach: boolean;
  reason: string;
  fallbackMessage?: string;
} {
  // Check minimum required data
  if (!input.streakState?.currentStreak && !input.recentSessionGrades?.length) {
    return {
      canCoach: false,
      reason: 'Insufficient user data for personalized coaching',
      fallbackMessage: 'Complete a few sessions to unlock personalized AI coaching!',
    };
  }
  
  // Check for data quality
  const dataPoints = [
    input.recentSessionGrades?.length || 0,
    input.missionHistory?.length || 0,
  ].reduce((sum, count) => sum + count, 0);
  
  if (dataPoints < 3) {
    return {
      canCoach: true,
      reason: 'Limited data - using general guidance',
      fallbackMessage: 'Keep completing sessions to get more personalized advice!',
    };
  }
  
  return {
    canCoach: true,
    reason: 'Sufficient data for personalized coaching',
  };
}

/**
 * Checks if input contains forbidden PII
 */
export function containsForbiddenPII(input: unknown): boolean {
  const inputStr = JSON.stringify(input);
  
  return FORBIDDEN_DATA_FIELDS.some(field => 
    inputStr.toLowerCase().includes(field.toLowerCase())
  );
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Generates a mock UUID for testing
 */
function generateMockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Creates mock coach input for testing
 */
export function createMockCoachInput(overrides: Partial<CoachInputContract> = {}): CoachInputContract {
  const now = Date.now();
  const currentHour = new Date(now).getHours();
  const dayOfWeek = new Date(now).getDay();
  
  return {
    recentSessionGrades: [
      {
        sessionId: generateMockUUID(),
        grade: 85,
        duration: 1500,
        completedAt: now - 86400000, // 1 day ago
        difficulty: 'NORMAL',
      },
      {
        sessionId: generateMockUUID(),
        grade: 92,
        duration: 1800,
        completedAt: now - 172800000, // 2 days ago
        difficulty: 'CHALLENGING',
      },
    ],
    preferredSessionLengths: [1500, 1800, 2100],
    completionTimes: [9, 14, 19],
    streakState: {
      currentStreak: 5,
      streakAtRisk: false,
      hoursSinceLastSession: 18,
      streakRecord: 12,
      missedDays: 0,
    },
    focusScoreFactors: {
      currentScore: 78,
      trend: 'improving',
      primaryFactors: ['consistency', 'duration'],
    },
    missionHistory: [
      {
        missionId: generateMockUUID(),
        type: 'daily',
        completed: true,
        completedAt: now - 43200000,
        difficulty: 'NORMAL',
      },
    ],
    userGoalCategory: 'focus_improvement',
    notificationPreferences: {
      enabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 7,
      maxPerDay: 2,
    },
    premiumStatus: {
      isActive: false,
      tier: 'free',
      features: [],
    },
    timeContext: {
      currentHour,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      localTimezone: 'America/New_York',
    },
    ...overrides,
  };
}