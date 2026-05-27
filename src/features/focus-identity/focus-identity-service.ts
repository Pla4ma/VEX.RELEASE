import { MMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";
import { eventBus } from "../../events";
import { FOCUS_SCORE_CONFIG, IDENTITY_STATEMENTS } from "./focus-score-config";
import type { FocusIdentityProfile } from "./FocusIdentityEngine";
import {
  FocusIdentityProfileSchema,
  FocusIdentityEngine,
} from "./FocusIdentityEngine";

const identityStorage = new MMKVStorageAdapter("focus-identity");

export class FocusIdentityService {
  private engine: FocusIdentityEngine;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.engine = new FocusIdentityEngine(userId);
  }

  public async getProfile(): Promise<FocusIdentityProfile | null> {
    const raw = identityStorage.getItemSync("focus-identity:" + this.userId);
    if (!raw) return null;
    return FocusIdentityProfileSchema.parse(JSON.parse(raw));
  }

  public async initializeProfile(): Promise<FocusIdentityProfile> {
    const existing = await this.getProfile();
    if (existing) return existing;
    const now = new Date();
    const profile: FocusIdentityProfile = {
      userId: this.userId,
      currentScore: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
      previousScore: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
      scoreHistory: [
        {
          date: now.toISOString().split("T")[0]!,
          score: FOCUS_SCORE_CONFIG.INITIAL_SCORE,
          reason: "Initial score",
        },
      ],
      percentileRank: 50,
      band: this.engine.getScoreBand(FOCUS_SCORE_CONFIG.INITIAL_SCORE),
      factors: {
        consistency: {
          score: 55,
          sessionsLast30Days: 0,
          targetSessionsPerWeek: 4,
          actualConsistency: 0,
          missedDaysLast30Days: 0,
        },
        streakStability: {
          score: 50,
          currentStreak: 0,
          longestStreak: 0,
          averageStreakLength: 0,
          totalStreaksStarted: 0,
          streakBreakFrequency: 0,
        },
        sessionQuality: {
          score: 50,
          averageFocusPurity: 0,
          averageGrade: "D",
          perfectSessionsCount: 0,
          averageSessionDuration: 0,
        },
        diversity: {
          score: 0,
          uniqueSessionModes: 0,
          uniqueTimeSlots: 0,
          uniqueDaysOfWeek: 0,
          weekendSessions: 0,
          contextVariety: 0,
        },
        recency: {
          score: 50,
          daysSinceLastSession: 999,
          last7DayActivity: 0,
          last30DayActivity: 0,
          trendDirection: "STABLE",
          velocity: 0,
        },
      },
      identityStatement: IDENTITY_STATEMENTS.Building[0]!,
      streakInCurrentBand: 0,
      totalScoreCalculations: 1,
      firstScoreDate: now.toISOString().split("T")[0]!,
      isInRecovery: false,
      recoveryStartDate: null,
      recoveryProgress: 0,
      preLapseScore: null,
      topStrength: "consistency",
      topWeakness: "recency",
      recommendedActions: [
        "Complete your first session to activate your Focus Score",
        "Set a weekly goal of 3-4 sessions to build consistency",
        "Try different session modes to improve diversity",
      ],
      monthlyReport: null,
      updatedAt: Date.now(),
    };
    identityStorage.setItemSync(
      "focus-identity:" + this.userId,
      JSON.stringify(profile),
    );
    eventBus.publish("FOCUS_IDENTITY_CREATED", {
      userId: this.userId,
      initialScore: profile.currentScore,
      band: profile.band.label,
    });
    return profile;
  }

  public async saveProfile(profile: FocusIdentityProfile): Promise<void> {
    const validated = FocusIdentityProfileSchema.parse(profile);
    identityStorage.setItemSync(
      "focus-identity:" + this.userId,
      JSON.stringify(validated),
    );
  }

  public async updateScore(
    eventType: keyof typeof FOCUS_SCORE_CONFIG.SCORE_CHANGES,
    sessionData?: { grade?: string; streakLength?: number },
  ): Promise<{ newScore: number; change: number; bandChanged: boolean }> {
    const profile = await this.getProfile();
    if (!profile) {
      await this.initializeProfile();
      return this.updateScore(eventType, sessionData);
    }
    const oldBand = profile.band;
    const previousScore = profile.currentScore;
    const change = this.engine.calculateScoreChange(eventType, {
      streakLength: sessionData?.streakLength,
      sessionGrade: sessionData?.grade,
      isInRecovery: profile.isInRecovery,
    });
    let newScore = previousScore + change;
    newScore = Math.max(
      FOCUS_SCORE_CONFIG.MIN_SCORE,
      Math.min(FOCUS_SCORE_CONFIG.MAX_SCORE, newScore),
    );
    profile.previousScore = previousScore;
    profile.currentScore = newScore;
    profile.scoreHistory.push({
      date: new Date().toISOString().split("T")[0]!,
      score: newScore,
      reason: eventType + ": " + (change > 0 ? "+" : "") + change,
    });
    if (profile.scoreHistory.length > 90)
      profile.scoreHistory = profile.scoreHistory.slice(-90);
    const newBand = this.engine.getScoreBand(newScore);
    const bandChanged = newBand.label !== oldBand.label;
    if (bandChanged) {
      profile.streakInCurrentBand = 0;
      profile.band = newBand;
      profile.identityStatement = this.engine.getIdentityStatement(
        newBand.label,
        0,
      );
      eventBus.publish("FOCUS_SCORE_BAND_CHANGE", {
        userId: this.userId,
        oldBand: oldBand.label,
        newBand: newBand.label,
        newScore,
      });
    } else {
      profile.streakInCurrentBand++;
      profile.identityStatement = this.engine.getIdentityStatement(
        newBand.label,
        profile.streakInCurrentBand,
      );
    }
    if (eventType === "MISSED_DAY" || eventType === "STREAK_BREAK") {
      if (!profile.isInRecovery) {
        profile.isInRecovery = true;
        profile.recoveryStartDate = new Date().toISOString().split("T")[0]!;
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
    profile.recommendedActions = this.engine.generateRecommendations(
      profile.factors,
    );
    profile.updatedAt = Date.now();
    await this.saveProfile(profile);
    eventBus.publish("FOCUS_SCORE_UPDATED", {
      userId: this.userId,
      previousScore,
      newScore,
      change,
      band: profile.band.label,
      isInRecovery: profile.isInRecovery,
    });
    return { newScore, change, bandChanged };
  }

  public async getMonthlyReport(): Promise<
    FocusIdentityProfile["monthlyReport"]
  > {
    const profile = await this.getProfile();
    if (!profile) return null;
    const now = new Date();
    const monthKey =
      now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthHistory = profile.scoreHistory.filter(
      (h) => new Date(h.date) >= monthStart,
    );
    if (monthHistory.length < 2) return null;
    const startingScore = monthHistory[0]!.score;
    const endingScore = monthHistory[monthHistory.length - 1]!.score;
    const change = endingScore - startingScore;
    const sessionsCompleted = profile.scoreHistory.filter(
      (h) =>
        h.reason.includes("SESSION_COMPLETE") && new Date(h.date) >= monthStart,
    ).length;
    let grade: "A+" | "A" | "B+" | "B" | "C" | "D" = "D";
    if (change >= 50) grade = "A+";
    else if (change >= 30) grade = "A";
    else if (change >= 15) grade = "B+";
    else if (change >= 5) grade = "B";
    else if (change >= -5) grade = "C";
    const highlights = [
      change > 30 ? "Incredible +" + change + " point improvement!" : null,
      sessionsCompleted >= 20
        ? sessionsCompleted + " sessions completed this month"
        : null,
      profile.band.label === "Legendary"
        ? "Maintaining Legendary status"
        : null,
      profile.isInRecovery ? "Strong recovery from setback" : null,
    ].filter(Boolean);
    return {
      month: monthKey,
      startingScore,
      endingScore,
      change,
      sessionsCompleted,
      grade,
      highlight:
        highlights[0] || "Score change: " + (change > 0 ? "+" : "") + change,
    };
  }
}
