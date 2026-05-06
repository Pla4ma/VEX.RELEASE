/**
 * Predictive Intervention Engine
 *
 * Phase 6: AI Evolution
 * Transforms AI Coach from reactive (after problems) to predictive (before problems)
 *
 * Instead of waiting for users to break streaks, this engine:
 * - Analyzes 30-day behavioral patterns
 * - Predicts "User typically skips Tuesdays"
 * - Intervenes: Monday evening motivation message
 * - Prevents problems before they happen
 *
 * Key Predictions:
 * - Streak break risk (detected 24-48h before)
 * - Session abandonment patterns
 * - Optimal session time recommendations
 * - Burnout detection
 *
 * Dependencies:
 * - features/ai-coach (existing coach infrastructure)
 * - session/SessionService (session history)
 * - streaks/StreakService (streak data)
 * - feature-flags (gradual rollout)
 */

import { z } from "zod";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import { eventBus } from "../../events";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("predictive-intervention");

// ============================================================================
// Prediction Types
// ============================================================================

export type PredictionType =
  | "STREAK_AT_RISK" // User likely to miss tomorrow
  | "SESSION_ABANDON_RISK" // User likely to abandon session
  | "BURNOUT_DETECTED" // User showing burnout patterns
  | "OPTIMAL_TIME_WINDOW" // Recommended time for session
  | "DIFFICULTY_MISMATCH" // Session difficulty too high/low
  | "SOCIAL_ISOLATION" // User hasn't interacted with squad
  | "CREATURE_NEGLECT" // User not caring for streak creature
  | "RAID_PARTICIPATION_DROP" // User missing weekend boss raids
  | "PRIME_TIME_MISSED" // User missing scheduled bonus events
  | "CREATURE_EVOLUTION_STALL"; // Creature not progressing due to patterns

export interface BehavioralPattern {
  userId: string;
  patternType: "consistent" | "inconsistent" | "declining" | "improving";
  daysOfWeek: number[]; // 0-6, most active days
  timeOfDay: number[]; // 0-23, most active hours
  averageSessionDuration: number;
  completionRate: number; // 0-1
  streakBreakFrequency: number; // breaks per month
  last30DaysTrend: "up" | "stable" | "down";
}

export interface RiskPrediction {
  id: string;
  userId: string;
  type: PredictionType;
  confidence: number; // 0-1
  predictedAt: number;
  predictedToOccurAt: number; // When we expect the problem
  severity: "low" | "medium" | "high" | "critical";

  // Context
  evidence: string[];
  recommendedAction: string;
  interventionSent: boolean;
  interventionType: string;

  // Outcome tracking
  actualOutcome: "prevented" | "occurred" | "unknown" | null;
  outcomeVerifiedAt: number | null;
}

export interface InterventionResult {
  predictionId: string;
  sentAt: number;
  channel: "push" | "in_app" | "coach_message";
  message: string;
  userResponded: boolean;
  outcome: "prevented" | "ignored" | "unknown";
}

// ============================================================================
// Prediction Engine Service
// ============================================================================

export class PredictiveInterventionEngine {
  private predictions: Map<string, RiskPrediction[]> = new Map(); // userId -> predictions
  private patterns: Map<string, BehavioralPattern> = new Map();
  private interventions: Map<string, InterventionResult[]> = new Map();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Check if predictive interventions are enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled("predictive_interventions");
  }

  /**
   * Start the prediction engine
   */
  start(): void {
    if (!PredictiveInterventionEngine.isEnabled()) {
      debug.info("Disabled via feature flag");
      return;
    }

    // Analyze patterns every hour
    this.checkInterval = setInterval(() => {
      this.analyzeAllUsers();
    }, 3600000);

    // Initial analysis
    this.analyzeAllUsers();

    debug.info("Started");
  }

  /**
   * Stop the engine
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Analyze a user's behavioral patterns
   */
  analyzeUserPatterns(
    userId: string,
    sessionHistory: Array<{
      date: string;
      completed: boolean;
      duration: number;
      hour: number;
      dayOfWeek: number;
    }>,
    currentStreak: number,
    longestStreak: number,
  ): BehavioralPattern {
    if (!PredictiveInterventionEngine.isEnabled()) {
      return this.getDefaultPattern(userId);
    }

    const last30Days = sessionHistory.slice(-30);

    // Calculate completion rate
    const completed = last30Days.filter((s) => s.completed).length;
    const completionRate = last30Days.length > 0 ? completed / last30Days.length : 0;

    // Find most active days
    const dayCounts = new Map<number, number>();
    last30Days.forEach((s) => {
      dayCounts.set(s.dayOfWeek, (dayCounts.get(s.dayOfWeek) || 0) + 1);
    });
    const daysOfWeek = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Find most active hours
    const hourCounts = new Map<number, number>();
    last30Days.forEach((s) => {
      hourCounts.set(s.hour, (hourCounts.get(s.hour) || 0) + 1);
    });
    const timeOfDay = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    // Calculate trend
    const firstHalf = last30Days.slice(0, 15).filter((s) => s.completed).length;
    const secondHalf = last30Days.slice(15).filter((s) => s.completed).length;
    let last30DaysTrend: "up" | "stable" | "down" = "stable";
    if (secondHalf > firstHalf * 1.2) {
      last30DaysTrend = "up";
    } else if (secondHalf < firstHalf * 0.8) {
      last30DaysTrend = "down";
    }

    // Determine pattern type
    let patternType: BehavioralPattern["patternType"] = "consistent";
    if (completionRate < 0.5) {
      patternType = "inconsistent";
    } else if (last30DaysTrend === "down") {
      patternType = "declining";
    } else if (last30DaysTrend === "up") {
      patternType = "improving";
    }

    // Average duration
    const avgDuration = last30Days.length > 0 ? last30Days.reduce((sum, s) => sum + s.duration, 0) / last30Days.length : 0;

    const pattern: BehavioralPattern = {
      userId,
      patternType,
      daysOfWeek,
      timeOfDay,
      averageSessionDuration: avgDuration,
      completionRate,
      streakBreakFrequency: this.calculateBreakFrequency(sessionHistory),
      last30DaysTrend,
    };

    this.patterns.set(userId, pattern);
    return pattern;
  }

  /**
   * Generate predictions for a user
   */
  generatePredictions(userId: string, pattern: BehavioralPattern, lastSessionDate: string | null, hoursSinceLastSession: number): RiskPrediction[] {
    if (!PredictiveInterventionEngine.isEnabled()) {
      return [];
    }

    const predictions: RiskPrediction[] = [];
    const now = Date.now();

    // 1. Streak break risk
    const streakRisk = this.assessStreakBreakRisk(userId, pattern, hoursSinceLastSession);
    if (streakRisk.confidence > 0.3) {
      predictions.push({
        id: `pred_${userId}_streak_${now}`,
        userId,
        type: "STREAK_AT_RISK",
        confidence: streakRisk.confidence,
        predictedAt: now,
        predictedToOccurAt: now + 24 * 60 * 60 * 1000, // 24 hours
        severity: streakRisk.severity,
        evidence: streakRisk.evidence,
        recommendedAction: streakRisk.action,
        interventionSent: false,
        interventionType: "",
        actualOutcome: null,
        outcomeVerifiedAt: null,
      });
    }

    // 2. Burnout detection
    const burnoutRisk = this.assessBurnoutRisk(userId, pattern);
    if (burnoutRisk.confidence > 0.4) {
      predictions.push({
        id: `pred_${userId}_burnout_${now}`,
        userId,
        type: "BURNOUT_DETECTED",
        confidence: burnoutRisk.confidence,
        predictedAt: now,
        predictedToOccurAt: now + 7 * 24 * 60 * 60 * 1000, // 1 week
        severity: burnoutRisk.severity,
        evidence: burnoutRisk.evidence,
        recommendedAction: burnoutRisk.action,
        interventionSent: false,
        interventionType: "",
        actualOutcome: null,
        outcomeVerifiedAt: null,
      });
    }

    // 3. Optimal time recommendation
    const optimalTime = this.calculateOptimalTime(userId, pattern);
    if (optimalTime.confidence > 0.6) {
      predictions.push({
        id: `pred_${userId}_time_${now}`,
        userId,
        type: "OPTIMAL_TIME_WINDOW",
        confidence: optimalTime.confidence,
        predictedAt: now,
        predictedToOccurAt: optimalTime.nextWindow,
        severity: "low",
        evidence: optimalTime.evidence,
        recommendedAction: optimalTime.action,
        interventionSent: false,
        interventionType: "",
        actualOutcome: null,
        outcomeVerifiedAt: null,
      });
    }

    // 4. Social isolation
    // Would need squad interaction data here

    // Store predictions
    this.predictions.set(userId, predictions);

    return predictions;
  }

  /**
   * Send intervention for a prediction
   */
  async sendIntervention(prediction: RiskPrediction, channel: "push" | "in_app" | "coach_message"): Promise<boolean> {
    if (!PredictiveInterventionEngine.isEnabled()) {
      return false;
    }

    let message = "";
    let title = "";

    switch (prediction.type) {
      case "STREAK_AT_RISK":
        title = "Streak at Risk! ⚠️";
        message = this.generateStreakInterventionMessage(prediction);
        break;
      case "BURNOUT_DETECTED":
        title = "Taking a Break?";
        message = this.generateBurnoutMessage(prediction);
        break;
      case "OPTIMAL_TIME_WINDOW":
        title = "Perfect Time to Focus";
        message = prediction.recommendedAction;
        break;
      default:
        return false;
    }

    // Send via event bus
    eventBus.publish("coach:intervention_triggered", {
      userId: prediction.userId,
      interventionId: prediction.id,
      type: prediction.type,
    });

    // Track intervention
    const result: InterventionResult = {
      predictionId: prediction.id,
      sentAt: Date.now(),
      channel,
      message,
      userResponded: false,
      outcome: "unknown",
    };

    const userInterventions = this.interventions.get(prediction.userId) || [];
    userInterventions.push(result);
    this.interventions.set(prediction.userId, userInterventions);

    // Mark prediction as intervened
    prediction.interventionSent = true;
    prediction.interventionType = channel;

    return true;
  }

  /**
   * Verify prediction outcomes
   */
  verifyOutcomes(
    userId: string,
    actualEvents: {
      type: string;
      timestamp: number;
      prevented: boolean;
    }[],
  ): void {
    const predictions = this.predictions.get(userId) || [];

    for (const prediction of predictions) {
      // Find matching actual event
      const match = actualEvents.find((e) => {
        if (prediction.type === "STREAK_AT_RISK" && e.type === "streak_broken") {
          return Math.abs(e.timestamp - prediction.predictedToOccurAt) < 86400000; // Within 24h
        }
        // Add other matching logic
        return false;
      });

      if (match) {
        prediction.actualOutcome = match.prevented ? "prevented" : "occurred";
        prediction.outcomeVerifiedAt = Date.now();

        // Update intervention outcome
        const intervention = this.interventions.get(userId)?.find((i) => i.predictionId === prediction.id);
        if (intervention) {
          intervention.outcome = match.prevented ? "prevented" : "ignored";
        }
      }
    }
  }

  /**
   * Get user's current risk level
   */
  getCurrentRiskLevel(userId: string): {
    hasActivePredictions: boolean;
    highestSeverity: RiskPrediction["severity"] | null;
    activePredictions: RiskPrediction[];
    recommendedAction: string;
  } {
    const predictions = this.predictions.get(userId) || [];
    const active = predictions.filter((p) => !p.actualOutcome);

    if (active.length === 0) {
      return {
        hasActivePredictions: false,
        highestSeverity: null,
        activePredictions: [],
        recommendedAction: "Continue your current routine",
      };
    }

    const severities: RiskPrediction["severity"][] = ["low", "medium", "high", "critical"];
    const highestSeverity = active.reduce((max, p) => {
      return severities.indexOf(p.severity) > severities.indexOf(max) ? p.severity : max;
    }, active[0].severity);

    const streakPrediction = active.find((p) => p.type === "STREAK_AT_RISK");

    return {
      hasActivePredictions: true,
      highestSeverity,
      activePredictions: active,
      recommendedAction: streakPrediction?.recommendedAction || "Complete a session soon",
    };
  }

  // ============================================================================
  // Private Analysis Methods
  // ============================================================================

  private analyzeAllUsers(): void {
    // This would be called by a background job
    // For now, just log that analysis would happen
    debug.info("Would analyze all users");
  }

  private calculateBreakFrequency(history: Array<{ date: string; completed: boolean }>): number {
    let breaks = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    for (const session of history) {
      if (session.completed) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        if (currentStreak > 3) {
          breaks++;
        }
        currentStreak = 0;
      }
    }

    return breaks;
  }

  private assessStreakBreakRisk(userId: string, pattern: BehavioralPattern, hoursSinceLastSession: number): { confidence: number; severity: RiskPrediction["severity"]; evidence: string[]; action: string } {
    const evidence: string[] = [];
    let confidence = 0;
    let severity: RiskPrediction["severity"] = "low";

    // High hours since last session
    if (hoursSinceLastSession > 20) {
      evidence.push(`${Math.floor(hoursSinceLastSession)} hours since last session`);
      confidence += 0.3;
    }

    // Inconsistent pattern
    if (pattern.patternType === "inconsistent") {
      evidence.push("Inconsistent completion pattern detected");
      confidence += 0.2;
    }

    // Low completion rate
    if (pattern.completionRate < 0.5) {
      evidence.push(`Low completion rate (${Math.floor(pattern.completionRate * 100)}%)`);
      confidence += 0.2;
    }

    // High break frequency
    if (pattern.streakBreakFrequency > 2) {
      evidence.push(`${pattern.streakBreakFrequency} streak breaks this month`);
      confidence += 0.2;
    }

    // Declining trend
    if (pattern.last30DaysTrend === "down") {
      evidence.push("Activity declining over last 30 days");
      confidence += 0.1;
    }

    // Determine severity
    if (hoursSinceLastSession > 40) {
      severity = "critical";
    } else if (hoursSinceLastSession > 30) {
      severity = "high";
    } else if (hoursSinceLastSession > 24) {
      severity = "medium";
    }

    const action = hoursSinceLastSession > 30 ? "Complete a session in the next 6 hours to save your streak!" : "Your streak is at risk. Complete a session today!";

    return { confidence: Math.min(1, confidence), severity, evidence, action };
  }

  private assessBurnoutRisk(userId: string, pattern: BehavioralPattern): { confidence: number; severity: RiskPrediction["severity"]; evidence: string[]; action: string } {
    const evidence: string[] = [];
    let confidence = 0;

    // Very high completion rate can indicate burnout risk (overdoing it)
    if (pattern.completionRate > 0.95) {
      evidence.push("Very high completion rate - possible overexertion");
      confidence += 0.3;
    }

    // Long average sessions
    if (pattern.averageSessionDuration > 90) {
      evidence.push(`Long average sessions (${Math.floor(pattern.averageSessionDuration)} min)`);
      confidence += 0.2;
    }

    // No rest days
    if (pattern.daysOfWeek.length === 7) {
      evidence.push("No rest days detected");
      confidence += 0.2;
    }

    const severity: RiskPrediction["severity"] = confidence > 0.5 ? "medium" : "low";

    return {
      confidence: Math.min(1, confidence),
      severity,
      evidence,
      action: "Consider taking a rest day. Your streak is strong enough to handle it!",
    };
  }

  private calculateOptimalTime(userId: string, pattern: BehavioralPattern): { confidence: number; nextWindow: number; evidence: string[]; action: string } {
    if (pattern.timeOfDay.length === 0) {
      return { confidence: 0, nextWindow: 0, evidence: [], action: "" };
    }

    const bestHour = pattern.timeOfDay[0];
    const now = new Date();
    const nextWindow = new Date();

    if (now.getHours() < bestHour) {
      nextWindow.setHours(bestHour, 0, 0, 0);
    } else {
      nextWindow.setDate(nextWindow.getDate() + 1);
      nextWindow.setHours(bestHour, 0, 0, 0);
    }

    return {
      confidence: 0.7,
      nextWindow: nextWindow.getTime(),
      evidence: [`You typically focus best at ${bestHour}:00`],
      action: `Your optimal focus time is ${bestHour}:00. Try scheduling your next session then!`,
    };
  }

  private generateStreakInterventionMessage(prediction: RiskPrediction): string {
    const hours = prediction.evidence.find((e) => e.includes("hours"));
    if (hours) {
      return `${hours}. Your streak is your progress - don't let it slip away! 💪`;
    }
    return "Your streak is at risk! Complete a session today to keep your momentum! 🔥";
  }

  private generateBurnoutMessage(prediction: RiskPrediction): string {
    return "You've been incredibly consistent! Consider a lighter session today - your streak can handle one easy day. Rest is part of the journey! 🌱";
  }

  // ============================================================================
  // Phase 5 System Analysis Methods
  // ============================================================================

  /**
   * Analyze creature neglect patterns
   */
  private analyzeCreatureNeglect(
    userId: string,
    creatureData: {
      lastFedAt: number | null;
      lastPlayedAt: number | null;
      happiness: number;
      health: number;
      level: number;
      evolutionProgress: number;
    },
  ): { confidence: number; severity: RiskPrediction["severity"]; evidence: string[]; action: string } {
    const now = Date.now();
    const evidence: string[] = [];
    let confidence = 0;

    // Check if creature hasn't been fed recently
    if (creatureData.lastFedAt && now - creatureData.lastFedAt > 24 * 60 * 60 * 1000) {
      evidence.push("Creature not fed for over 24 hours");
      confidence += 0.4;
    }

    // Low happiness
    if (creatureData.happiness < 30) {
      evidence.push(`Very low happiness (${creatureData.happiness}%)`);
      confidence += 0.3;
    }

    // Low health
    if (creatureData.health < 40) {
      evidence.push(`Poor health (${creatureData.health}%)`);
      confidence += 0.3;
    }

    // Stalled evolution
    if (creatureData.evolutionProgress < 20 && creatureData.level > 1) {
      evidence.push("Evolution progress stalled");
      confidence += 0.2;
    }

    const severity: RiskPrediction["severity"] = confidence > 0.6 ? "high" : confidence > 0.3 ? "medium" : "low";

    return {
      confidence: Math.min(1, confidence),
      severity,
      evidence,
      action: "Your creature needs attention! Feed and play with it to keep it happy and healthy.",
    };
  }

  /**
   * Analyze raid participation patterns
   */
  private analyzeRaidParticipation(
    userId: string,
    raidHistory: Array<{
      weekStart: string;
      participated: boolean;
      damage: number;
      squadId: string;
    }>,
  ): { confidence: number; severity: RiskPrediction["severity"]; evidence: string[]; action: string } {
    const evidence: string[] = [];
    let confidence = 0;

    const last4Weeks = raidHistory.slice(-4);
    const missedWeeks = last4Weeks.filter((week) => !week.participated).length;

    // Missing multiple recent raids
    if (missedWeeks >= 2) {
      evidence.push(`Missed ${missedWeeks} of the last 4 weekend raids`);
      confidence += 0.4;
    }

    // Low damage when participating
    const participatingWeeks = last4Weeks.filter((week) => week.participated);
    const avgDamage = participatingWeeks.reduce((sum, week) => sum + week.damage, 0) / (participatingWeeks.length || 1);

    if (avgDamage < 1000) {
      evidence.push("Low contribution when participating in raids");
      confidence += 0.2;
    }

    // Pattern of declining participation
    if (last4Weeks.length >= 3) {
      const recent = last4Weeks.slice(-2);
      const older = last4Weeks.slice(-4, -2);
      const recentParticipation = recent.filter((week) => week.participated).length;
      const olderParticipation = older.filter((week) => week.participated).length;

      if (recentParticipation < olderParticipation) {
        evidence.push("Declining raid participation trend");
        confidence += 0.3;
      }
    }

    const severity: RiskPrediction["severity"] = confidence > 0.5 ? "medium" : "low";

    return {
      confidence: Math.min(1, confidence),
      severity,
      evidence,
      action: "Weekend raids are starting! Join your squad for epic rewards and teamwork.",
    };
  }

  /**
   * Analyze prime time event participation
   */
  private analyzePrimeTimeParticipation(
    userId: string,
    eventHistory: Array<{
      eventType: string;
      participated: boolean;
      timestamp: number;
      rewards: Record<string, number>;
    }>,
  ): { confidence: number; severity: RiskPrediction["severity"]; evidence: string[]; action: string } {
    const evidence: string[] = [];
    let confidence = 0;

    const last7Days = eventHistory.filter((event) => Date.now() - event.timestamp < 7 * 24 * 60 * 60 * 1000);

    // Missing multiple events in the past week
    const missedEvents = last7Days.filter((event) => !event.participated).length;
    if (missedEvents >= 3) {
      evidence.push(`Missed ${missedEvents} bonus events in the past week`);
      confidence += 0.4;
    }

    // Check for specific event type patterns
    const morningEvents = last7Days.filter((event) => event.eventType.includes("MORNING"));
    const missedMorningEvents = morningEvents.filter((event) => !event.participated).length;

    if (morningEvents.length >= 2 && missedMorningEvents === morningEvents.length) {
      evidence.push("Consistently missing Morning Rally events");
      confidence += 0.3;
    }

    // Low reward accumulation
    const totalRewards = last7Days.reduce((sum, event) => sum + Object.values(event.rewards).reduce((rSum, reward) => rSum + reward, 0), 0);

    if (totalRewards < 100) {
      evidence.push("Low bonus reward accumulation");
      confidence += 0.2;
    }

    const severity: RiskPrediction["severity"] = confidence > 0.4 ? "medium" : "low";

    return {
      confidence: Math.min(1, confidence),
      severity,
      evidence,
      action: "You're missing bonus events! Check the schedule for upcoming Prime Time events.",
    };
  }

  /**
   * Analyze creature evolution stall
   */
  private analyzeCreatureEvolutionStall(
    userId: string,
    creature: {
      stage: string;
      evolutionProgress: number;
      currentStreak: number;
      totalSessions: number;
      averagePurity: number;
      lastEvolutionAt: number | null;
    },
  ): { confidence: number; severity: RiskPrediction["severity"]; evidence: string[]; action: string } {
    const evidence: string[] = [];
    let confidence = 0;

    // Stuck in early stage with good progress
    if (creature.stage === "BABY" && creature.evolutionProgress < 50 && creature.totalSessions > 20) {
      evidence.push("Stuck in Baby stage despite good activity");
      confidence += 0.4;
    }

    // Low evolution progress over time
    if (creature.lastEvolutionAt) {
      const weeksSinceEvolution = (Date.now() - creature.lastEvolutionAt) / (7 * 24 * 60 * 60 * 1000);
      if (weeksSinceEvolution > 2 && creature.evolutionProgress < 80) {
        evidence.push("Slow evolution progress over time");
        confidence += 0.3;
      }
    }

    // High streak but low evolution progress
    if (creature.currentStreak > 10 && creature.evolutionProgress < 60) {
      evidence.push("Strong streak but poor evolution progress");
      confidence += 0.3;
    }

    // Low purity sessions holding back evolution
    if (creature.averagePurity < 75) {
      evidence.push(`Low session purity (${creature.averagePurity}%) affecting evolution`);
      confidence += 0.2;
    }

    const severity: RiskPrediction["severity"] = confidence > 0.6 ? "medium" : "low";

    return {
      confidence: Math.min(1, confidence),
      severity,
      evidence,
      action: "Focus on higher purity sessions to help your creature evolve faster!",
    };
  }

  private getDefaultPattern(userId: string): BehavioralPattern {
    return {
      userId,
      patternType: "consistent",
      daysOfWeek: [1, 2, 3, 4, 5],
      timeOfDay: [9, 14, 20],
      averageSessionDuration: 25,
      completionRate: 0.7,
      streakBreakFrequency: 1,
      last30DaysTrend: "stable",
    };
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let engine: PredictiveInterventionEngine | null = null;

export function getPredictiveInterventionEngine(): PredictiveInterventionEngine {
  if (!engine) {
    engine = new PredictiveInterventionEngine();
  }
  return engine;
}
