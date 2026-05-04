/**
 * Emotion Retention Engine
 *
 * Orchestrates emotional touchpoints to maximize user retention.
 * Identifies moments of emotional resonance and amplifies them.
 *
 * Features:
 * - Emotional momentum tracking
 * - Retention risk detection
 * - Personalized re-engagement hooks
 * - Sentiment-based intervention
 */

import { eventBus } from '@/events';
import { createDebugger } from '@/utils/debug';
import { haptics } from '@/shared/feedback';
import type { SessionStory } from '@/features/session-story/schemas';

const debug = createDebugger('emotion-retention:engine');

// ============================================================================
// Types
// ============================================================================

export interface UserEmotionalState {
  userId: string;
  momentumScore: number; // 0-100, recent success streak
  lastPositiveMoment: number | null; // Timestamp
  lastNegativeMoment: number | null;
  recentStories: string[]; // Story IDs
  emotionalTrajectory: 'RISING' | 'STABLE' | 'DECLINING' | 'AT_RISK';
  riskFactors: RiskFactor[];
  protectiveFactors: ProtectiveFactor[];
}

export interface RiskFactor {
  type: 'STREAK_AT_RISK' | 'SESSION_GAP' | 'BOSS_DEFEAT_MISSED' | 'LOW_QUALITY_RUN' | 'ENGAGEMENT_DROP';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAt: number;
  description: string;
}

export interface ProtectiveFactor {
  type: 'STREAK_ACTIVE' | 'BOSS_NEAR_DEFEAT' | 'MILESTONE_CLOSE' | 'PERFECT_RUN' | 'SOCIAL_CONNECTION';
  strength: number; // 0-100
  description: string;
}

export interface RetentionIntervention {
  type: 'PUSH_NOTIFICATION' | 'IN_APP_MESSAGE' | 'STREAK_REMINDER' | 'BOSS_TEASE' | 'MILESTONE_PREVIEW';
  timing: 'IMMEDIATE' | 'SCHEDULED';
  priority: number;
  content: {
    headline: string;
    body: string;
    cta: string;
    deepLink: string;
  };
  hapticOnReceive: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const MOMENTUM_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CRITICAL_SESSION_GAP_HOURS = 48;
const HIGH_SESSION_GAP_HOURS = 36;

// ============================================================================
// Emotion Retention Engine
// ============================================================================

class EmotionRetentionEngine {
  private userStates: Map<string, UserEmotionalState> = new Map();
  private initialized = false;

  initialize(): () => void {
    if (this.initialized) {
      return () => {};
    }

    this.initialized = true;
    debug.info('EmotionRetentionEngine initialized');

    // Listen for story completion - key emotional moment
    const unsubscribeStory = eventBus.subscribe('session:story:viewed', (event) => {
      const { userId, story, completionRate } = event as {
        userId: string;
        story: SessionStory;
        completionRate: number;
      };

      this.processStoryEngagement(userId, story, completionRate);
    });

    // Listen for streak changes
    const unsubscribeStreak = eventBus.subscribe('streak:updated', (event) => {
      const { userId, state } = event as { userId: string; state: { currentStreak: number } };
      this.processStreakUpdate(userId, state.currentStreak);
    });

    // Listen for boss events
    const unsubscribeBoss = eventBus.subscribe('boss:defeated', (event) => {
      const { userId } = event as { userId: string };
      this.processBossDefeat(userId);
    });

    // Listen for session completion - key emotional moment
    const unsubscribeSessionComplete = eventBus.subscribe('session:completed', (event) => {
      const { userId, summary } = event as { userId: string; summary: { xpEarned: number; focusPurityScore: number } };
      this.processSessionCompleted(userId, summary);
    });

    return () => {
      unsubscribeStory();
      unsubscribeStreak();
      unsubscribeBoss();
      unsubscribeSessionComplete();
      this.initialized = false;
    };
  }

  // ==========================================================================
  // State Management
  // ==========================================================================

  private getOrCreateState(userId: string): UserEmotionalState {
    let state = this.userStates.get(userId);

    if (!state) {
      state = {
        userId,
        momentumScore: 50,
        lastPositiveMoment: null,
        lastNegativeMoment: null,
        recentStories: [],
        emotionalTrajectory: 'STABLE',
        riskFactors: [],
        protectiveFactors: [],
      };
      this.userStates.set(userId, state);
    }

    return state;
  }

  private updateState(userId: string, updates: Partial<UserEmotionalState>): void {
    const state = this.getOrCreateState(userId);
    this.userStates.set(userId, { ...state, ...updates });
  }

  // ==========================================================================
  // Event Processors
  // ==========================================================================

  private processStoryEngagement(
    userId: string,
    story: SessionStory,
    completionRate: number
  ): void {
    const state = this.getOrCreateState(userId);

    // Track story
    const updatedStories = [story.id, ...state.recentStories].slice(0, 10);
    this.updateState(userId, { recentStories: updatedStories });

    // Calculate emotional impact
    const emotionalImpact = this.calculateEmotionalImpact(story, completionRate);

    // Update momentum
    let newMomentum = state.momentumScore;
    if (emotionalImpact > 0) {
      newMomentum = Math.min(100, state.momentumScore + emotionalImpact);
      this.updateState(userId, {
        momentumScore: newMomentum,
        lastPositiveMoment: Date.now(),
      });
    } else if (emotionalImpact < 0) {
      newMomentum = Math.max(0, state.momentumScore + emotionalImpact);
      this.updateState(userId, {
        momentumScore: newMomentum,
        lastNegativeMoment: Date.now(),
      });
    }

    // Recalculate trajectory
    this.updateTrajectory(userId);

    // Check for interventions
    this.evaluateInterventions(userId);

    debug.info('Processed story engagement for %s: impact=%d, momentum=%d',
      userId, emotionalImpact, newMomentum);
  }

  private processStreakUpdate(userId: string, currentStreak: number): void {
    const state = this.getOrCreateState(userId);

    // Milestone proximity check
    const milestones = [3, 7, 14, 30, 60, 100, 180, 365];
    const nextMilestone = milestones.find(m => m > currentStreak);
    const daysToMilestone = nextMilestone ? nextMilestone - currentStreak : null;

    if (daysToMilestone && daysToMilestone <= 2) {
      // Add protective factor
      const protective: ProtectiveFactor = {
        type: 'MILESTONE_CLOSE',
        strength: daysToMilestone === 1 ? 90 : 70,
        description: `${daysToMilestone} day${daysToMilestone === 1 ? '' : 's'} from ${nextMilestone}-day milestone`,
      };

      this.updateState(userId, {
        protectiveFactors: [...state.protectiveFactors.filter(p => p.type !== 'MILESTONE_CLOSE'), protective],
      });
    }

    // High streak = protective factor
    if (currentStreak >= 7) {
      const protective: ProtectiveFactor = {
        type: 'STREAK_ACTIVE',
        strength: Math.min(100, currentStreak * 2),
        description: `${currentStreak}-day active streak`,
      };

      this.updateState(userId, {
        protectiveFactors: [...state.protectiveFactors.filter(p => p.type !== 'STREAK_ACTIVE'), protective],
      });
    }

    this.updateTrajectory(userId);
    debug.info('Processed streak update for %s: %d days', userId, currentStreak);
  }

  private processBossDefeat(userId: string): void {
    const state = this.getOrCreateState(userId);

    // Boss defeat is a major positive moment
    this.updateState(userId, {
      momentumScore: Math.min(100, state.momentumScore + 25),
      lastPositiveMoment: Date.now(),
    });

    // Add protective factor
    const protective: ProtectiveFactor = {
      type: 'BOSS_NEAR_DEFEAT',
      strength: 85,
      description: 'Recent boss victory - momentum high',
    };

    this.updateState(userId, {
      protectiveFactors: [...state.protectiveFactors, protective],
    });

    this.updateTrajectory(userId);
    haptics.celebration();

    debug.info('Processed boss defeat for %s', userId);
  }

  private processSessionCompleted(
    userId: string,
    summary: { xpEarned: number; focusPurityScore: number }
  ): void {
    const state = this.getOrCreateState(userId);

    // Calculate emotional impact based on session quality
    let emotionalBoost = 10; // Base completion boost

    if (summary.focusPurityScore >= 90) {
      emotionalBoost += 15; // High quality session
    } else if (summary.focusPurityScore >= 70) {
      emotionalBoost += 8; // Good session
    } else if (summary.focusPurityScore >= 50) {
      emotionalBoost += 3; // Average session
    } else {
      emotionalBoost -= 5; // Poor session
    }

    // XP earned adds to positive momentum
    if (summary.xpEarned > 100) {
      emotionalBoost += 5;
    }

    this.updateState(userId, {
      momentumScore: Math.min(100, state.momentumScore + emotionalBoost),
      lastPositiveMoment: Date.now(),
    });

    // Add protective factor for good sessions
    if (summary.focusPurityScore >= 70) {
      const protective: ProtectiveFactor = {
        type: 'PERFECT_RUN',
        strength: Math.min(100, summary.focusPurityScore),
        description: `Quality session completed - ${summary.focusPurityScore}% focus`,
      };

      this.updateState(userId, {
        protectiveFactors: [...state.protectiveFactors, protective],
      });
    }

    this.updateTrajectory(userId);

    debug.info('Processed session completion for %s: +%d momentum', userId, emotionalBoost);
  }

  // ==========================================================================
  // Calculations
  // ==========================================================================

  private calculateEmotionalImpact(story: SessionStory, completionRate: number): number {
    let impact = 0;

    // Base impact from viewing completion
    if (completionRate >= 90) {
      impact += 15; // Fully engaged with story
    } else if (completionRate >= 50) {
      impact += 5; // Partially engaged
    } else {
      impact -= 10; // Skipped most of story
    }

    // Emotional beats amplify impact
    const beatEmotions = story.beats.map(b => b.emotion);

    if (beatEmotions.includes('TRIUMPH')) { impact += 10; }
    if (beatEmotions.includes('MASTERY')) { impact += 8; }
    if (beatEmotions.includes('WONDER')) { impact += 7; }
    if (beatEmotions.includes('RESILIENCE')) { impact += 5; }

    // Perfect session bonus
    if (story.sessionContext.isPerfectSession) {
      impact += 10;
    }

    // Boss defeat bonus
    if (story.sessionContext.bossDefeated) {
      impact += 15;
    }

    // Comeback bonus
    if (story.sessionContext.isComeback) {
      impact += 20; // Major emotional boost
    }

    return impact;
  }

  private updateTrajectory(userId: string): void {
    const state = this.getOrCreateState(userId);
    const now = Date.now();

    // Calculate trajectory based on momentum trend
    let trajectory: UserEmotionalState['emotionalTrajectory'];

    if (state.momentumScore >= 70) {
      trajectory = 'RISING';
    } else if (state.momentumScore <= 30) {
      trajectory = 'AT_RISK';
    } else if (state.lastNegativeMoment && (now - state.lastNegativeMoment) < 24 * 60 * 60 * 1000) {
      trajectory = 'DECLINING';
    } else {
      trajectory = 'STABLE';
    }

    // Check risk factors
    const risks = this.detectRiskFactors(userId);

    this.updateState(userId, {
      emotionalTrajectory: trajectory,
      riskFactors: risks,
    });

    // Emit trajectory change event
    eventBus.publish('emotion:trajectory_changed', {
      userId,
      trajectory,
      momentum: state.momentumScore,
      riskCount: risks.length,
    });
  }

  private detectRiskFactors(userId: string): RiskFactor[] {
    const state = this.getOrCreateState(userId);
    const risks: RiskFactor[] = [];
    const now = Date.now();

    // Check for session gap
    if (state.lastPositiveMoment) {
      const hoursSinceLastSession = (now - state.lastPositiveMoment) / (1000 * 60 * 60);

      if (hoursSinceLastSession >= CRITICAL_SESSION_GAP_HOURS) {
        risks.push({
          type: 'SESSION_GAP',
          severity: 'CRITICAL',
          detectedAt: now,
          description: `No session in ${Math.floor(hoursSinceLastSession)} hours`,
        });
      } else if (hoursSinceLastSession >= HIGH_SESSION_GAP_HOURS) {
        risks.push({
          type: 'SESSION_GAP',
          severity: 'HIGH',
          detectedAt: now,
          description: `${Math.floor(hoursSinceLastSession)} hours since last session`,
        });
      }
    }

    // Low momentum risk
    if (state.momentumScore < 20) {
      risks.push({
        type: 'ENGAGEMENT_DROP',
        severity: 'HIGH',
        detectedAt: now,
        description: 'Emotional momentum critically low',
      });
    }

    // Streak at risk (would need external data)
    // This would be checked via integration with streak service

    return risks;
  }

  // ==========================================================================
  // Interventions
  // ==========================================================================

  private evaluateInterventions(userId: string): void {
    const state = this.getOrCreateState(userId);

    // Generate interventions based on state
    const interventions = this.generateInterventions(state);

    // Emit interventions for notification service to handle
    for (const intervention of interventions) {
      eventBus.publish('retention:intervention_ready', {
        userId,
        intervention,
      });
    }
  }

  private generateInterventions(state: UserEmotionalState): RetentionIntervention[] {
    const interventions: RetentionIntervention[] = [];
    const now = Date.now();

    // Critical: Session gap
    const sessionGapRisk = state.riskFactors.find(r => r.type === 'SESSION_GAP');
    if (sessionGapRisk?.severity === 'CRITICAL') {
      interventions.push({
        type: 'STREAK_REMINDER',
        timing: 'SCHEDULED',
        priority: 100,
        content: {
          headline: 'Your streak needs you',
          body: `Don't let ${state.protectiveFactors.find(p => p.type === 'STREAK_ACTIVE')?.description ?? 'your progress'} slip away.`,
          cta: 'Protect it now',
          deepLink: 'vex://session/quick-start',
        },
        hapticOnReceive: true,
      });
    }

    // High: Boss almost defeated
    const bossProtective = state.protectiveFactors.find(p => p.type === 'BOSS_NEAR_DEFEAT');
    if (bossProtective && state.momentumScore > 50) {
      interventions.push({
        type: 'BOSS_TEASE',
        timing: 'SCHEDULED',
        priority: 80,
        content: {
          headline: 'The boss is still waiting...',
          body: 'One more session could finish them. Ready?',
          cta: 'Finish the fight',
          deepLink: 'vex://boss/active',
        },
        hapticOnReceive: false,
      });
    }

    // Milestone approaching
    const milestoneProtective = state.protectiveFactors.find(p => p.type === 'MILESTONE_CLOSE');
    if (milestoneProtective) {
      interventions.push({
        type: 'MILESTONE_PREVIEW',
        timing: 'SCHEDULED',
        priority: 70,
        content: {
          headline: milestoneProtective.description,
          body: "You're closer than you think. Tomorrow could be the day.",
          cta: 'See your progress',
          deepLink: 'vex://streak/status',
        },
        hapticOnReceive: false,
      });
    }

    // Momentum dropping
    if (state.emotionalTrajectory === 'DECLINING') {
      interventions.push({
        type: 'IN_APP_MESSAGE',
        timing: 'IMMEDIATE',
        priority: 60,
        content: {
          headline: 'Keep your momentum alive',
          body: 'Even a short session today keeps your progress going.',
          cta: 'Quick 15 min session',
          deepLink: 'vex://session/quick-start',
        },
        hapticOnReceive: true,
      });
    }

    return interventions.sort((a, b) => b.priority - a.priority);
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  getUserState(userId: string): UserEmotionalState {
    return this.getOrCreateState(userId);
  }

  shouldShowStory(userId: string): boolean {
    const state = this.getOrCreateState(userId);

    // Don't show story if user is at risk and needs intervention
    if (state.emotionalTrajectory === 'AT_RISK') {
      return false;
    }

    // Show story if momentum is rising or stable
    return state.emotionalTrajectory === 'RISING' || state.emotionalTrajectory === 'STABLE';
  }

  getRecommendedSessionDuration(userId: string): number {
    const state = this.getOrCreateState(userId);

    // Recommend shorter sessions when momentum is low
    if (state.momentumScore < 30) {
      return 15; // 15 minutes to rebuild confidence
    }

    if (state.momentumScore < 50) {
      return 25; // Standard Pomodoro
    }

    // Higher momentum = longer sessions OK
    return 45;
  }

  recordEngagement(userId: string, activity: string, value: number): void {
    const state = this.getOrCreateState(userId);

    // Update state based on activity
    switch (activity) {
      case 'story_viewed':
        this.processStoryEngagement(userId, {} as SessionStory, value);
        break;
      case 'session_completed':
        this.updateState(userId, {
          momentumScore: Math.min(100, state.momentumScore + value),
          lastPositiveMoment: Date.now(),
        });
        break;
      case 'session_abandoned':
        this.updateState(userId, {
          momentumScore: Math.max(0, state.momentumScore - value),
          lastNegativeMoment: Date.now(),
        });
        break;
    }

    this.updateTrajectory(userId);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const emotionRetentionEngine = new EmotionRetentionEngine();

export function initializeEmotionRetention(): () => void {
  return emotionRetentionEngine.initialize();
}

export function getEmotionRetentionEngine(): EmotionRetentionEngine {
  return emotionRetentionEngine;
}
