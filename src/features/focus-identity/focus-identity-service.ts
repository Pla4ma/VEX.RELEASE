import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { eventBus } from '../../events';
import { FOCUS_SCORE_CONFIG } from './focus-score-config';
import type { FocusIdentityProfile } from './FocusIdentityEngine';
import {
  FocusIdentityProfileSchema,
  FocusIdentityEngine,
} from './FocusIdentityEngine';
import { createMonthlyFocusReport } from './focus-identity-monthly-report';
import { createInitialFocusIdentityProfile } from './focus-identity-profile-factory';

const identityStorage = new MMKVStorageAdapter('focus-identity');

export class FocusIdentityService {
  private engine: FocusIdentityEngine;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.engine = new FocusIdentityEngine();
  }

  public async getProfile(): Promise<FocusIdentityProfile | null> {
    const raw = identityStorage.getItemSync('focus-identity:' + this.userId);
    if (!raw) {return null;}
    return FocusIdentityProfileSchema.parse(JSON.parse(raw));
  }

  public async initializeProfile(): Promise<FocusIdentityProfile> {
    const existing = await this.getProfile();
    if (existing) {return existing;}
    const profile = createInitialFocusIdentityProfile(
      this.userId,
      this.engine.getScoreBand(FOCUS_SCORE_CONFIG.INITIAL_SCORE),
    );
    identityStorage.setItemSync(
      'focus-identity:' + this.userId,
      JSON.stringify(profile),
    );
    eventBus.publish('FOCUS_IDENTITY_CREATED', {
      userId: this.userId,
      initialScore: profile.currentScore,
      band: profile.band.label,
    });
    return profile;
  }

  public async saveProfile(profile: FocusIdentityProfile): Promise<void> {
    const validated = FocusIdentityProfileSchema.parse(profile);
    identityStorage.setItemSync(
      'focus-identity:' + this.userId,
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
      date: new Date().toISOString().split('T')[0]!,
      score: newScore,
      reason: eventType + ': ' + (change > 0 ? '+' : '') + change,
    });
    if (profile.scoreHistory.length > 90)
      {profile.scoreHistory = profile.scoreHistory.slice(-90);}
    const newBand = this.engine.getScoreBand(newScore);
    const bandChanged = newBand.label !== oldBand.label;
    if (bandChanged) {
      profile.streakInCurrentBand = 0;
      profile.band = newBand;
      profile.identityStatement = this.engine.getIdentityStatement(
        newBand.label,
        0,
      );
      eventBus.publish('FOCUS_SCORE_BAND_CHANGE', {
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
    if (eventType === 'MISSED_DAY' || eventType === 'STREAK_BREAK') {
      if (!profile.isInRecovery) {
        profile.isInRecovery = true;
        profile.recoveryStartDate = new Date().toISOString().split('T')[0]!;
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
        eventBus.publish('FOCUS_RECOVERY_COMPLETE', {
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
    eventBus.publish('FOCUS_SCORE_UPDATED', {
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
    FocusIdentityProfile['monthlyReport']
  > {
    const profile = await this.getProfile();
    if (!profile) {return null;}
    return createMonthlyFocusReport(profile);
  }
}
