import { z } from "zod";


export const StoryBeatTypeSchema = z.enum([
  'OPENING', // "You entered..."
  'FOCUS_JOURNEY', // "You stayed focused..."
  'STREAK_MOMENT', // "You protected your streak..."
  'BOSS_BATTLE', // "You broke the boss's shield..."
  'MILESTONE_REACHED', // "Day 7 achieved..."
  'PERFECTION_MOMENT', // "Zero interruptions..."
  'COMEBACK_TRIUMPH', // "You returned stronger..."
  'PROGRESSION_CLIFFHANGER', // "1 session from next tier..."
  'ACHIEVEMENT_UNLOCK', // Badge earned
  'CLOSING_REFLECTION', // Final thought
]);

export const EmotionalArcSchema = z.enum([
  'TRIUMPH', // Victory, achievement
  'RELIEF', // Streak saved, stress released
  'DETERMINATION', // Coming back, fighting on
  'WONDER', // Milestone reached, new possibilities
  'GRATITUDE', // Perfect session, thankful
  'ANTICIPATION', // Close to next goal
  'RESILIENCE', // Comeback story
  'MASTERY', // Skill demonstration
]);

export const StoryBeatSchema = z.object({
  id: z.string().uuid(),
  type: StoryBeatTypeSchema,
  sequenceOrder: z.number().int().min(0),
  headline: z.string().min(1), // "You stayed focused for 25 minutes"
  subtext: z.string().optional(), // Additional context
  emotion: EmotionalArcSchema,
  visualCue: z.enum(['NONE', 'STREAK_FLAME', 'BOSS_DAMAGE', 'XP_BURST', 'BADGE_SHINE', 'SHIELD_PROTECTION', 'PROGRESS_BAR', 'CELEBRATION']),
  durationMs: z.number().int().min(500).default(2500), // How long to show
  hapticPattern: z.enum(['NONE', 'LIGHT', 'MEDIUM', 'HEAVY', 'SUCCESS', 'CELEBRATION']).default('NONE'),
  metadata: z
    .object({
      value: z.number().optional(), // Numeric value (minutes, streak count)
      comparison: z.string().optional(), // "above average", "personal best"
      context: z.string().optional(), // "1 away from tier 3"
    })
    .optional(),
});

export const SessionStorySchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.number(),

  // Story arc
  title: z.string().min(1), // "The Focus Protector"
  subtitle: z.string().optional(), // "A 25-minute journey"
  overallEmotion: EmotionalArcSchema,

  // Narrative beats
  beats: z.array(StoryBeatSchema).min(1),
  totalBeats: z.number().int().min(1),

  // Session context that generated this story
  sessionContext: z.object({
    durationMinutes: z.number().positive(),
    focusScore: z.number().min(0).max(100),
    streakDays: z.number().int().min(0),
    interruptions: z.number().int().min(0),
    pauses: z.number().int().min(0),
    sessionMode: z.string(),
    bossDamageDealt: z.number().int().min(0).default(0),
    bossDefeated: z.boolean().default(false),
    milestoneReached: z.number().int().optional(), // Day milestone
    xpEarned: z.number().int().min(0),
    isPerfectSession: z.boolean().default(false),
    isComeback: z.boolean().default(false),
    daysAbsent: z.number().int().min(0).default(0),
  }),

  // Engagement hooks for next session
  nextSessionHooks: z
    .array(
      z.object({
        type: z.enum(['STREAK_AT_RISK', 'BOSS_ALMOST_DEFEATED', 'MILESTONE_APPROACHING', 'TIER_UNLOCK_SOON', 'PERFECT_RUN_CONTINUING', 'COMEBACK_MOMENTUM']),
        description: z.string(),
        urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
      }),
    )
    .default([]),

  // Analytics
  viewedAt: z.number().nullable().default(null),
  sharedAt: z.number().nullable().default(null),
  completionRate: z.number().min(0).max(100).default(0), // % of beats viewed
});

export const GenerateStoryInputSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  sessionSummary: z.object({
    duration: z.number().positive(),
    effectiveDuration: z.number().positive(),
    focusQuality: z.number().min(0).max(100),
    focusPurityScore: z.number().min(0).max(100).optional(),
    interruptions: z.number().int().min(0),
    pauses: z.number().int().min(0),
    streakDays: z.number().int().min(0),
    streakMaintained: z.boolean(),
    sessionMode: z.string(),
    completionPercentage: z.number().min(0).max(100),
    finalScore: z.number().min(0),
  }),
  bossContext: z
    .object({
      encounterId: z.string().uuid().optional(),
      bossName: z.string().optional(),
      damageDealt: z.number().int().min(0).default(0),
      healthRemaining: z.number().int().min(0).optional(),
      maxHealth: z.number().int().positive().optional(),
      defeated: z.boolean().default(false),
    })
    .optional(),
  streakContext: z.object({
    previousStreak: z.number().int().min(0),
    newStreak: z.number().int().min(0),
    isMilestone: z.boolean().default(false),
    milestoneDay: z.number().int().optional(),
    wasProtected: z.boolean().default(false),
    isComeback: z.boolean().default(false),
    daysAbsent: z.number().int().min(0).default(0),
  }),
  progressionContext: z.object({
    xpEarned: z.number().int().min(0),
    currentLevel: z.number().int().min(1),
    xpToNextLevel: z.number().int().min(0),
    tierProgress: z.number().min(0).max(100),
    sessionsToNextTier: z.number().int().min(0),
  }),
  userPreferences: z
    .object({
      preferredTone: z.enum(['ENCOURAGING', 'NEUTRAL', 'CHALLENGING']).default('ENCOURAGING'),
      enableHaptics: z.boolean().default(true),
      enableAnimations: z.boolean().default(true),
    })
    .optional(),
});

export const StoryTemplateSchema = z.object({
  id: z.string().uuid(),
  beatType: StoryBeatTypeSchema,
  condition: z.object({
    minDuration: z.number().optional(),
    maxInterruptions: z.number().optional(),
    minStreak: z.number().optional(),
    maxStreak: z.number().optional(),
    requiresBossDamage: z.boolean().optional(),
    requiresPerfection: z.boolean().optional(),
    requiresComeback: z.boolean().optional(),
    requiresMilestone: z.boolean().optional(),
  }),
  priority: z.number().int().min(0).default(0),
  variations: z
    .array(
      z.object({
        headline: z.string(),
        subtext: z.string().optional(),
        emotion: EmotionalArcSchema,
        visualCue: StoryBeatSchema.shape.visualCue,
      }),
    )
    .min(1),
});