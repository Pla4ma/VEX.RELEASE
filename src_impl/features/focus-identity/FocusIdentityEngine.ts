/**
 * Focus Identity Protocol (FIP)
 *
 * A revolutionary 10/10 retention system that transforms users' relationship with focus.
 * Based on behavioral economics, self-determination theory, and identity-based habits.
 *
 * THE SCIENCE:
 * - Self-Determination Theory (Deci & Ryan): People need competence, autonomy, relatedness
 * - Identity-Based Habits (Clear): "I'm a focused person" > "I need to focus"
 * - Credit Score Psychology: The number becomes part of self-concept
 * - Loss Aversion (Kahneman): Score drops hurt more than gains feel good
 * - Progress Principle (Amabile): Small wins fuel intrinsic motivation
 *
 * THE MECHANIC:
 * - Single Focus Score (0-850) like FICO credit score
 * - 5 weighted factors (payment history = consistency, etc.)
 * - Score bands with labels: "Novice" → "Disciplined" → "Elite" → "Legendary"
 * - Monthly "Focus Reports" with personalized insights
 * - Social comparison (percentile ranking)
 * - Identity reinforcement: "You're in the top 5% of focused people"
 *
 * RETENTION MECHANISMS:
 * 1. Identity Lock-in: Score becomes part of who they are
 * 2. Sunk Cost: Months of score building = unwillingness to quit
 * 3. Social Proof: Percentile ranking creates competitive drive
 * 4. Progress Visualization: Beautiful score trending charts
 * 5. Recovery Mechanics: Score can be rebuilt after lapses (hope)
 *
 * @priority critical
 * @retention-target identity-based habit formation + loss aversion
 * @scientific-backing self-determination-theory identity-based-habits
 */

import { z } from "zod";
import { MMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import { eventBus } from "../../events";

// ============================================================================
// CONFIGURATION
// ============================================================================

export const FOCUS_SCORE_CONFIG = {
  MIN_SCORE: 300,
  MAX_SCORE: 850,
  INITIAL_SCORE: 550,

  // Score bands with identity labels
  BANDS: [
    { min: 800, max: 850, label: "Legendary", title: "Focus Virtuoso", color: "#FFD700", percentile: 99 },
    { min: 740, max: 799, label: "Elite", title: "Elite Performer", color: "#C0C0C0", percentile: 95 },
    { min: 670, max: 739, label: "Exceptional", title: "Exceptional Focus", color: "#CD7F32", percentile: 85 },
    { min: 580, max: 669, label: "Strong", title: "Strong Focus", color: "#4CAF50", percentile: 70 },
    { min: 500, max: 579, label: "Good", title: "Good Focus", color: "#8BC34A", percentile: 50 },
    { min: 420, max: 499, label: "Fair", title: "Developing Focus", color: "#FFC107", percentile: 30 },
    { min: 300, max: 419, label: "Building", title: "Building Habits", color: "#FF9800", percentile: 10 },
  ] as const,

  // Weight factors (like FICO)
  FACTOR_WEIGHTS: {
    CONSISTENCY: 0.35, // Payment history equivalent
    STREAK_STABILITY: 0.3, // Length of streak history
    SESSION_QUALITY: 0.15, // Focus purity, grades
    DIVERSITY: 0.1, // Different modes, times, contexts
    RECENCY: 0.1, // Recent activity weighting
  },

  // Score change parameters
  SCORE_CHANGES: {
    SESSION_COMPLETE: { base: 5, max: 15 },
    STREAK_MILESTONE: { base: 20, max: 50 },
    MISSED_DAY: { base: -15, max: -35 },
    STREAK_BREAK: { base: -30, max: -80 },
    SESSION_ABANDON: { base: -25, max: -50 },
    PERFECT_SESSION: { base: 10, max: 25 },
  },

  // Recovery mechanics (hope)
  RECOVERY_WINDOW_DAYS: 90,
  RECOVERY_BONUS_MULTIPLIER: 1.5,
} as const;

// ============================================================================
// STORAGE
// ============================================================================

const identityStorage = new MMKVStorageAdapter("focus-identity");

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  title: string;
  color: string;
  percentile: number;
}

export interface FocusScoreFactors {
  // 35% weight - Most important
  consistency: {
    score: number; // 0-100
    sessionsLast30Days: number;
    targetSessionsPerWeek: number;
    actualConsistency: number; // 0-1
    missedDaysLast30Days: number;
  };

  // 30% weight
  streakStability: {
    score: number;
    currentStreak: number;
    longestStreak: number;
    averageStreakLength: number;
    totalStreaksStarted: number;
    streakBreakFrequency: number; // breaks per month
  };

  // 15% weight
  sessionQuality: {
    score: number;
    averageFocusPurity: number; // 0-100
    averageGrade: "S" | "A" | "B" | "C" | "D";
    perfectSessionsCount: number;
    averageSessionDuration: number;
  };

  // 10% weight
  diversity: {
    score: number;
    uniqueSessionModes: number;
    uniqueTimeSlots: number; // morning/afternoon/evening
    uniqueDaysOfWeek: number;
    weekendSessions: number;
    contextVariety: number; // locations, contexts
  };

  // 10% weight
  recency: {
    score: number;
    daysSinceLastSession: number;
    last7DayActivity: number; // sessions
    last30DayActivity: number;
    trendDirection: "UP" | "STABLE" | "DOWN" | "CONCERNING";
    velocity: number; // score change rate
  };
}

export interface FocusIdentityProfile {
  userId: string;
  currentScore: number;
  previousScore: number;
  scoreHistory: Array<{ date: string; score: number; reason: string }>;
  percentileRank: number; // vs all users
  band: ScoreBand;
  factors: FocusScoreFactors;

  // Identity reinforcement
  identityStatement: string; // "You are a disciplined person"
  streakInCurrentBand: number; // Days at this level
  totalScoreCalculations: number;
  firstScoreDate: string;

  // Recovery state
  isInRecovery: boolean;
  recoveryStartDate: string | null;
  recoveryProgress: number; // 0-100
  preLapseScore: number | null;

  // Insights
  topStrength: keyof FocusScoreFactors;
  topWeakness: keyof FocusScoreFactors;
  recommendedActions: string[];

  // Monthly report
  monthlyReport: {
    month: string;
    startingScore: number;
    endingScore: number;
    change: number;
    sessionsCompleted: number;
    grade: "A+" | "A" | "B+" | "B" | "C" | "D";
    highlight: string;
  } | null;

  updatedAt: number;
}

const FocusScoreFactorsSchema = z.object({
  consistency: z.object({
    score: z.number().min(0).max(100),
    sessionsLast30Days: z.number(),
    targetSessionsPerWeek: z.number(),
    actualConsistency: z.number().min(0).max(1),
    missedDaysLast30Days: z.number(),
  }),
  streakStability: z.object({
    score: z.number().min(0).max(100),
    currentStreak: z.number(),
    longestStreak: z.number(),
    averageStreakLength: z.number(),
    totalStreaksStarted: z.number(),
    streakBreakFrequency: z.number(),
  }),
  sessionQuality: z.object({
    score: z.number().min(0).max(100),
    averageFocusPurity: z.number().min(0).max(100),
    averageGrade: z.enum(["S", "A", "B", "C", "D"]),
    perfectSessionsCount: z.number(),
    averageSessionDuration: z.number(),
  }),
  diversity: z.object({
    score: z.number().min(0).max(100),
    uniqueSessionModes: z.number(),
    uniqueTimeSlots: z.number(),
    uniqueDaysOfWeek: z.number(),
    weekendSessions: z.number(),
    contextVariety: z.number(),
  }),
  recency: z.object({
    score: z.number().min(0).max(100),
    daysSinceLastSession: z.number(),
    last7DayActivity: z.number(),
    last30DayActivity: z.number(),
    trendDirection: z.enum(["UP", "STABLE", "DOWN", "CONCERNING"]),
    velocity: z.number(),
  }),
});

const FocusIdentityProfileSchema = z.object({
  userId: z.string(),
  currentScore: z.number().min(300).max(850),
  previousScore: z.number(),
  scoreHistory: z.array(
    z.object({
      date: z.string(),
      score: z.number(),
      reason: z.string(),
    }),
  ),
  percentileRank: z.number().min(0).max(100),
  band: z.object({
    min: z.number(),
    max: z.number(),
    label: z.string(),
    title: z.string(),
    color: z.string(),
    percentile: z.number(),
  }),
  factors: FocusScoreFactorsSchema,
  identityStatement: z.string(),
  streakInCurrentBand: z.number(),
  totalScoreCalculations: z.number(),
  firstScoreDate: z.string(),
  isInRecovery: z.boolean(),
  recoveryStartDate: z.string().nullable(),
  recoveryProgress: z.number().min(0).max(100),
  preLapseScore: z.number().nullable(),
  topStrength: z.enum(["consistency", "streakStability", "sessionQuality", "diversity", "recency"]),
  topWeakness: z.enum(["consistency", "streakStability", "sessionQuality", "diversity", "recency"]),
  recommendedActions: z.array(z.string()),
  monthlyReport: z
    .object({
      month: z.string(),
      startingScore: z.number(),
      endingScore: z.number(),
      change: z.number(),
      sessionsCompleted: z.number(),
      grade: z.enum(["A+", "A", "B+", "B", "C", "D"]),
      highlight: z.string(),
    })
    .nullable(),
  updatedAt: z.number(),
});

// ============================================================================
// IDENTITY STATEMENTS
// ============================================================================

const IDENTITY_STATEMENTS: Record<ScoreBand["label"], string[]> = {
  Legendary: ["You are a Focus Virtuoso. Your discipline inspires others.", "Focus isn't just what you do—it's who you are.", "You're in the top 1%. Your commitment is legendary."],
  Elite: ["You are an Elite Performer. Excellence is your standard.", "Your focus habits are exceptional. Keep raising the bar.", "You're among the most disciplined people using this app."],
  Exceptional: ["You have Exceptional Focus. You're building something great.", "Your consistency is paying off. You're becoming unstoppable.", "You're in the top 15%. Your dedication shows."],
  Strong: ["You have Strong Focus. You're developing powerful habits.", "You're becoming the kind of person who follows through.", "Your momentum is building. Stay consistent."],
  Good: ["You have Good Focus. You're on the right path.", "You're building the habits that will change your life.", "Keep showing up. You're becoming more focused every day."],
  Fair: ["You're Developing Focus. Every session makes you stronger.", "Progress, not perfection. You're learning to be consistent.", "Your potential is there. Keep building the habit."],
  Building: ["You're Building Habits. Small steps lead to big changes.", "Everyone starts somewhere. Your journey is just beginning.", "Focus is a muscle. You're getting stronger with each session."],
};

// ============================================================================
// CORE ENGINE
// ============================================================================

export class FocusIdentityEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ========================================================================
  // SCORING ALGORITHMS
  // ========================================================================

  private calculateConsistencyFactor(sessionsLast30Days: number, targetPerWeek: number, missedDays: number): FocusScoreFactors["consistency"] {
    const targetSessions = targetPerWeek * 4;
    const actualConsistency = Math.min(sessionsLast30Days / targetSessions, 1);

    // Score based on consistency + missed days penalty
    let score = actualConsistency * 100;
    score -= missedDays * 2; // -2 points per missed day
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      sessionsLast30Days,
      targetSessionsPerWeek: targetPerWeek,
      actualConsistency,
      missedDaysLast30Days: missedDays,
    };
  }

  private calculateStreakStabilityFactor(currentStreak: number, longestStreak: number, streakHistory: { start: number; end: number | null; length: number }[]): FocusScoreFactors["streakStability"] {
    // Calculate average streak length
    const completedStreaks = streakHistory.filter((s) => s.end !== null);
    const avgLength = completedStreaks.length > 0 ? completedStreaks.reduce((sum, s) => sum + s.length, 0) / completedStreaks.length : 0;

    // Calculate break frequency (breaks per month)
    const now = Date.now();
    const breaksLast90Days = completedStreaks.filter((s) => now - s.end! < 90 * 24 * 60 * 60 * 1000).length;
    const breakFrequency = breaksLast90Days / 3; // per month

    // Score calculation
    let score = 0;
    score += Math.min(currentStreak / 30, 1) * 30; // Current streak (max 30)
    score += Math.min(longestStreak / 90, 1) * 20; // Longest streak (max 20)
    score += Math.min(avgLength / 14, 1) * 25; // Average length (max 25)
    score += Math.max(0, 25 - breakFrequency * 8); // Break frequency (max 25)

    return {
      score: Math.round(Math.min(100, score)),
      currentStreak,
      longestStreak,
      averageStreakLength: Math.round(avgLength),
      totalStreaksStarted: streakHistory.length,
      streakBreakFrequency: breakFrequency,
    };
  }

  private calculateSessionQualityFactor(
    sessions: Array<{
      focusPurity: number;
      grade: string;
      duration: number;
      wasAbandoned: boolean;
    }>,
  ): FocusScoreFactors["sessionQuality"] {
    if (sessions.length === 0) {
      return {
        score: 0,
        averageFocusPurity: 0,
        averageGrade: "D",
        perfectSessionsCount: 0,
        averageSessionDuration: 0,
      };
    }

    const completed = sessions.filter((s) => !s.wasAbandoned);
    const avgPurity = completed.reduce((sum, s) => sum + s.focusPurity, 0) / completed.length;
    const avgDuration = completed.reduce((sum, s) => sum + s.duration, 0) / completed.length;

    // Count perfect sessions (S grade, 95%+ purity, 45+ min)
    const perfectCount = completed.filter((s) => s.grade === "S" && s.focusPurity >= 95 && s.duration >= 45).length;

    // Grade distribution
    const gradeCounts = completed.reduce(
      (acc, s) => {
        acc[s.grade] = (acc[s.grade] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = completed.length;
    const avgGradeScore = ((gradeCounts.S || 0) * 100 + (gradeCounts.A || 0) * 85 + (gradeCounts.B || 0) * 70 + (gradeCounts.C || 0) * 55 + (gradeCounts.D || 0) * 40) / total;

    // Calculate score
    let score = 0;
    score += (avgPurity / 100) * 30;
    score += (avgGradeScore / 100) * 40;
    score += Math.min(perfectCount / 5, 1) * 20; // Perfect sessions bonus
    score += Math.min(avgDuration / 60, 1) * 10; // Duration bonus

    // Determine dominant grade
    const gradeOrder = ["S", "A", "B", "C", "D"];
    let dominantGrade: string = "D";
    for (const grade of gradeOrder) {
      if (gradeCounts[grade] > 0) {
        dominantGrade = grade;
        break;
      }
    }

    return {
      score: Math.round(score),
      averageFocusPurity: Math.round(avgPurity),
      averageGrade: dominantGrade as "S" | "A" | "B" | "C" | "D",
      perfectSessionsCount: perfectCount,
      averageSessionDuration: Math.round(avgDuration),
    };
  }

  private calculateDiversityFactor(
    sessions: Array<{
      mode: string;
      hour: number;
      dayOfWeek: number;
      context?: string;
    }>,
  ): FocusScoreFactors["diversity"] {
    if (sessions.length === 0) {
      return {
        score: 0,
        uniqueSessionModes: 0,
        uniqueTimeSlots: 0,
        uniqueDaysOfWeek: 0,
        weekendSessions: 0,
        contextVariety: 0,
      };
    }

    const uniqueModes = new Set(sessions.map((s) => s.mode)).size;

    // Time slots: morning (5-12), afternoon (12-17), evening (17-22), night (22-5)
    const timeSlots = new Set(
      sessions.map((s) => {
        if (s.hour >= 5 && s.hour < 12) {
          return "morning";
        }
        if (s.hour >= 12 && s.hour < 17) {
          return "afternoon";
        }
        if (s.hour >= 17 && s.hour < 22) {
          return "evening";
        }
        return "night";
      }),
    ).size;

    const uniqueDays = new Set(sessions.map((s) => s.dayOfWeek)).size;
    const weekendCount = sessions.filter((s) => s.dayOfWeek === 0 || s.dayOfWeek === 6).length;
    const uniqueContexts = new Set(sessions.map((s) => s.context || "default")).size;

    // Score
    let score = 0;
    score += Math.min(uniqueModes / 3, 1) * 25;
    score += Math.min(timeSlots / 3, 1) * 20;
    score += Math.min(uniqueDays / 5, 1) * 20;
    score += Math.min(weekendCount / 4, 1) * 15;
    score += Math.min(uniqueContexts / 2, 1) * 20;

    return {
      score: Math.round(score),
      uniqueSessionModes: uniqueModes,
      uniqueTimeSlots: timeSlots,
      uniqueDaysOfWeek: uniqueDays,
      weekendSessions: weekendCount,
      contextVariety: uniqueContexts,
    };
  }

  private calculateRecencyFactor(daysSinceLastSession: number, last7Days: number, last30Days: number, scoreHistory: { date: string; score: number }[]): FocusScoreFactors["recency"] {
    let score = 100;

    // Heavy penalty for recent inactivity
    if (daysSinceLastSession === 0) {
      score -= 0;
    } else if (daysSinceLastSession === 1) {
      score -= 10;
    } else if (daysSinceLastSession === 2) {
      score -= 25;
    } else if (daysSinceLastSession >= 3) {
      score -= 50;
    }

    // Activity volume
    score += Math.min(last7Days / 5, 1) * 20;
    score += Math.min(last30Days / 20, 1) * 15;

    // Trend analysis
    let trend: "UP" | "STABLE" | "DOWN" | "CONCERNING" = "STABLE";
    let velocity = 0;

    if (scoreHistory.length >= 7) {
      const recent = scoreHistory.slice(-7);
      const first = recent[0].score;
      const last = recent[recent.length - 1].score;
      velocity = last - first;

      if (velocity > 10) {
        trend = "UP";
      } else if (velocity < -10) {
        trend = "CONCERNING";
      } else if (velocity < -5) {
        trend = "DOWN";
      }
    }

    // Penalty for concerning trend
    if (trend === "CONCERNING") {
      score -= 20;
    }

    return {
      score: Math.round(Math.max(0, Math.min(100, score))),
      daysSinceLastSession,
      last7DayActivity: last7Days,
      last30DayActivity: last30Days,
      trendDirection: trend,
      velocity,
    };
  }

  // ========================================================================
  // COMPOSITE SCORE CALCULATION
  // ========================================================================

  public async calculateFocusScore(data: { sessionsLast30Days: number; targetSessionsPerWeek: number; missedDaysLast30Days: number; currentStreak: number; longestStreak: number; streakHistory: DynamicValue[]; sessionDetails: DynamicValue[]; daysSinceLastSession: number; last7DaySessions: number; last30DaySessions: number; scoreHistory: DynamicValue[] }): Promise<{ score: number; factors: FocusScoreFactors }> {
    const factors: FocusScoreFactors = {
      consistency: this.calculateConsistencyFactor(data.sessionsLast30Days, data.targetSessionsPerWeek, data.missedDaysLast30Days),
      streakStability: this.calculateStreakStabilityFactor(data.currentStreak, data.longestStreak, data.streakHistory),
      sessionQuality: this.calculateSessionQualityFactor(data.sessionDetails),
      diversity: this.calculateDiversityFactor(
        data.sessionDetails.map((s) => ({
          mode: s.mode,
          hour: new Date(s.startTime).getHours(),
          dayOfWeek: new Date(s.startTime).getDay(),
          context: s.context,
        })),
      ),
      recency: this.calculateRecencyFactor(data.daysSinceLastSession, data.last7DaySessions, data.last30DaySessions, data.scoreHistory),
    };

    // Weighted composite score
    const composite = factors.consistency.score * FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.CONSISTENCY + factors.streakStability.score * FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.STREAK_STABILITY + factors.sessionQuality.score * FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.SESSION_QUALITY + factors.diversity.score * FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.DIVERSITY + factors.recency.score * FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS.RECENCY;

    // Map 0-100 composite to 300-850 score range
    const score = FOCUS_SCORE_CONFIG.MIN_SCORE + (composite / 100) * (FOCUS_SCORE_CONFIG.MAX_SCORE - FOCUS_SCORE_CONFIG.MIN_SCORE);

    return {
      score: Math.round(score),
      factors,
    };
  }

  // ========================================================================
  // BAND & IDENTITY
  // ========================================================================

  public getScoreBand(score: number): ScoreBand {
    return FOCUS_SCORE_CONFIG.BANDS.find((band) => score >= band.min && score <= band.max) || FOCUS_SCORE_CONFIG.BANDS[FOCUS_SCORE_CONFIG.BANDS.length - 1];
  }

  public getIdentityStatement(bandLabel: string, streakInBand: number): string {
    const statements = IDENTITY_STATEMENTS[bandLabel as keyof typeof IDENTITY_STATEMENTS];
    // Return statement based on how long they've been in this band
    const index = Math.min(Math.floor(streakInBand / 7), statements.length - 1);
    return statements[index];
  }

  // ========================================================================
  // SCORE UPDATES
  // ========================================================================

  public calculateScoreChange(
    eventType: keyof typeof FOCUS_SCORE_CONFIG.SCORE_CHANGES,
    modifiers: {
      streakLength?: number;
      sessionGrade?: string;
      isInRecovery?: boolean;
    },
  ): number {
    const config = FOCUS_SCORE_CONFIG.SCORE_CHANGES[eventType];
    let change = config.base;

    // Streak bonus for positive events
    if (modifiers.streakLength && change > 0) {
      change += Math.min(modifiers.streakLength * 0.5, config.max - config.base);
    }

    // Grade bonus for session completes
    if (modifiers.sessionGrade && change > 0) {
      const gradeBonus = { S: 10, A: 5, B: 2, C: 0, D: -2 };
      change += gradeBonus[modifiers.sessionGrade as keyof typeof gradeBonus] || 0;
    }

    // Recovery bonus (hope mechanic)
    if (modifiers.isInRecovery && change > 0) {
      change *= FOCUS_SCORE_CONFIG.RECOVERY_BONUS_MULTIPLIER;
    }

    return Math.round(Math.min(config.max, Math.max(-Math.abs(config.max), change)));
  }

  // ========================================================================
  // INSIGHTS & RECOMMENDATIONS
  // ========================================================================

  public generateRecommendations(factors: FocusScoreFactors): string[] {
    const recommendations: string[] = [];

    // Find weakest factor
    const factorScores = [
      { name: "consistency" as const, score: factors.consistency.score, label: "Consistency" },
      { name: "streakStability" as const, score: factors.streakStability.score, label: "Streak Stability" },
      { name: "sessionQuality" as const, score: factors.sessionQuality.score, label: "Session Quality" },
      { name: "diversity" as const, score: factors.diversity.score, label: "Diversity" },
      { name: "recency" as const, score: factors.recency.score, label: "Recent Activity" },
    ];

    const sorted = [...factorScores].sort((a, b) => a.score - b.score);
    const weakest = sorted[0];
    const strongest = sorted[sorted.length - 1];

    // Recommendations based on weakest factor
    switch (weakest.name) {
      case "consistency":
        recommendations.push(`Your ${weakest.label} is your biggest opportunity. Try the "Never Miss Twice" rule.`);
        recommendations.push("Set a minimum of 3 sessions per week to build momentum.");
        break;
      case "streakStability":
        recommendations.push("Your streaks keep breaking. Try shorter, more achievable sessions (15-20 min).");
        recommendations.push("Use streak freeze items to protect your progress during busy weeks.");
        break;
      case "sessionQuality":
        recommendations.push("Focus on quality over quantity. One perfect 45-min session beats three distracted ones.");
        recommendations.push("Turn on Do Not Disturb and put your phone in another room.");
        break;
      case "diversity":
        recommendations.push("Mix up your routine! Try different session modes and times.");
        recommendations.push("Weekend warriors have higher long-term retention. Try a Saturday session.");
        break;
      case "recency":
        recommendations.push("It's been a while. Start with just 10 minutes today to rebuild momentum.");
        recommendations.push("You're in recovery mode - all gains are 1.5x until you're back on track!");
        break;
    }

    // Leverage strongest factor
    recommendations.push(`Your strength is ${strongest.label}. Use it to build other areas.`);

    return recommendations;
  }

  public async getPercentileRank(score: number): Promise<number> {
    // In production, this would query the database for all user scores
    // For now, use the band's percentile as approximation
    const band = this.getScoreBand(score);
    return band.percentile;
  }
}

// ============================================================================
// SERVICE FACADE
// ============================================================================

export class FocusIdentityService {
  private engine: FocusIdentityEngine;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.engine = new FocusIdentityEngine(userId);
  }

  public async getProfile(): Promise<FocusIdentityProfile | null> {
    const raw = identityStorage.getItemSync(`focus-identity:${this.userId}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return FocusIdentityProfileSchema.parse(parsed);
  }

  public async initializeProfile(): Promise<FocusIdentityProfile> {
    const existing = await this.getProfile();
    if (existing) {
      return existing;
    }

    const now = new Date();
    const profile: FocusIdentityProfile = {
      userId: this.userId,
      currentScore: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
      previousScore: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
      scoreHistory: [
        {
          date: now.toISOString().split("T")[0],
          score: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
          reason: "Initial score",
        },
      ],
      percentileRank: 50,
      band: this.engine.getScoreBand(FOCUS_SCORE_CONFIG.INITIAL_SCORE),
      factors: {
        consistency: { score: 55, sessionsLast30Days: 0, targetSessionsPerWeek: 4, actualConsistency: 0, missedDaysLast30Days: 0 },
        streakStability: { score: 50, currentStreak: 0, longestStreak: 0, averageStreakLength: 0, totalStreaksStarted: 0, streakBreakFrequency: 0 },
        sessionQuality: { score: 50, averageFocusPurity: 0, averageGrade: "D", perfectSessionsCount: 0, averageSessionDuration: 0 },
        diversity: { score: 0, uniqueSessionModes: 0, uniqueTimeSlots: 0, uniqueDaysOfWeek: 0, weekendSessions: 0, contextVariety: 0 },
        recency: { score: 50, daysSinceLastSession: 999, last7DayActivity: 0, last30DayActivity: 0, trendDirection: "STABLE", velocity: 0 },
      },
      identityStatement: IDENTITY_STATEMENTS.Building[0],
      streakInCurrentBand: 0,
      totalScoreCalculations: 1,
      firstScoreDate: now.toISOString().split("T")[0],
      isInRecovery: false,
      recoveryStartDate: null,
      recoveryProgress: 0,
      preLapseScore: null,
      topStrength: "consistency",
      topWeakness: "recency",
      recommendedActions: ["Complete your first session to activate your Focus Score", "Set a weekly goal of 3-4 sessions to build consistency", "Try different session modes to improve diversity"],
      monthlyReport: null,
      updatedAt: Date.now(),
    };

    identityStorage.setItemSync(`focus-identity:${this.userId}`, JSON.stringify(profile));

    eventBus.publish("FOCUS_IDENTITY_CREATED", {
      userId: this.userId,
      initialScore: profile.currentScore,
      band: profile.band.label,
    });

    return profile;
  }

  public async updateScore(
    eventType: keyof typeof FOCUS_SCORE_CONFIG.SCORE_CHANGES,
    sessionData?: {
      grade?: string;
      streakLength?: number;
    },
  ): Promise<{ newScore: number; change: number; bandChanged: boolean }> {
    const profile = await this.getProfile();
    if (!profile) {
      await this.initializeProfile();
      return this.updateScore(eventType, sessionData);
    }

    const oldBand = profile.band;
    const previousScore = profile.currentScore;

    // Calculate score change
    const change = this.engine.calculateScoreChange(eventType, {
      streakLength: sessionData?.streakLength,
      sessionGrade: sessionData?.grade,
      isInRecovery: profile.isInRecovery,
    });

    // Apply change with bounds
    let newScore = previousScore + change;
    newScore = Math.max(FOCUS_SCORE_CONFIG.MIN_SCORE, Math.min(FOCUS_SCORE_CONFIG.MAX_SCORE, newScore));

    // Update profile
    profile.previousScore = previousScore;
    profile.currentScore = newScore;
    profile.scoreHistory.push({
      date: new Date().toISOString().split("T")[0],
      score: newScore,
      reason: `${eventType}: ${change > 0 ? "+" : ""}${change}`,
    });

    // Keep only last 90 days of history
    if (profile.scoreHistory.length > 90) {
      profile.scoreHistory = profile.scoreHistory.slice(-90);
    }

    // Update band and streak
    const newBand = this.engine.getScoreBand(newScore);
    const bandChanged = newBand.label !== oldBand.label;

    if (bandChanged) {
      profile.streakInCurrentBand = 0;
      profile.band = newBand;
      profile.identityStatement = this.engine.getIdentityStatement(newBand.label, 0);

      // Milestone celebration
      eventBus.publish("FOCUS_SCORE_BAND_CHANGE", {
        userId: this.userId,
        oldBand: oldBand.label,
        newBand: newBand.label,
        newScore,
      });
    } else {
      profile.streakInCurrentBand++;
      profile.identityStatement = this.engine.getIdentityStatement(newBand.label, profile.streakInCurrentBand);
    }

    // Recovery handling
    if (eventType === "MISSED_DAY" || eventType === "STREAK_BREAK") {
      if (!profile.isInRecovery) {
        profile.isInRecovery = true;
        profile.recoveryStartDate = new Date().toISOString().split("T")[0];
        profile.preLapseScore = previousScore;
        profile.recoveryProgress = 0;
      }
    } else if (profile.isInRecovery && change > 0) {
      profile.recoveryProgress += 10;
      if (profile.recoveryProgress >= 100) {
        profile.isInRecovery = false;
        profile.recoveryStartDate = null;
        profile.preLapseScore = null;
        profile.recoveryProgress = 0;

        eventBus.publish("FOCUS_RECOVERY_COMPLETE", {
          userId: this.userId,
          finalScore: newScore,
        });
      }
    }

    // Update recommendations
    profile.recommendedActions = this.engine.generateRecommendations(profile.factors);
    profile.updatedAt = Date.now();

    // Save
    identityStorage.setItemSync(`focus-identity:${this.userId}`, JSON.stringify(profile));

    // Events
    eventBus.publish("FOCUS_SCORE_UPDATED", {
      userId: this.userId,
      previousScore,
      newScore,
      change,
      band: profile.band.label,
      isInRecovery: profile.isInRecovery,
    });

    return {
      newScore,
      change,
      bandChanged,
    };
  }

  public async getMonthlyReport(): Promise<FocusIdentityProfile["monthlyReport"]> {
    const profile = await this.getProfile();
    if (!profile) {
      return null;
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Calculate this month's stats
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthHistory = profile.scoreHistory.filter((h) => new Date(h.date) >= monthStart);

    if (monthHistory.length < 2) {
      return null;
    }

    const startingScore = monthHistory[0].score;
    const endingScore = monthHistory[monthHistory.length - 1].score;
    const change = endingScore - startingScore;

    // Count sessions (approximate from score history positive changes)
    const sessionsCompleted = profile.scoreHistory.filter((h) => h.reason.includes("SESSION_COMPLETE") && new Date(h.date) >= monthStart).length;

    // Determine grade
    let grade: "A+" | "A" | "B+" | "B" | "C" | "D" = "D";
    if (change >= 50) {
      grade = "A+";
    } else if (change >= 30) {
      grade = "A";
    } else if (change >= 15) {
      grade = "B+";
    } else if (change >= 5) {
      grade = "B";
    } else if (change >= -5) {
      grade = "C";
    }

    // Generate highlight
    const highlights = [change > 30 ? `Incredible +${change} point improvement!` : null, sessionsCompleted >= 20 ? `${sessionsCompleted} sessions completed this month` : null, profile.band.label === "Legendary" ? "Maintaining Legendary status" : null, profile.isInRecovery ? "Strong recovery from setback" : null].filter(Boolean);

    return {
      month: monthKey,
      startingScore,
      endingScore,
      change,
      sessionsCompleted,
      grade,
      highlight: highlights[0] || `Score change: ${change > 0 ? "+" : ""}${change}`,
    };
  }
}

export default FocusIdentityService;
