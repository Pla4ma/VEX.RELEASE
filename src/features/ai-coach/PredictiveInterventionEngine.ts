import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';
import type {
  BehavioralPattern, RiskPrediction, InterventionResult, SessionRecord,
} from './PredictiveInterventionEngine-types';
import {
  getDefaultPattern, createRiskPrediction, computeBehavioralPattern,
  assessStreakBreakRisk, assessBurnoutRisk, calculateOptimalTime,
  generateStreakInterventionMessage, generateBurnoutMessage,
} from './PredictiveInterventionEngine-helpers';

const debug = createDebugger('predictive-intervention');
const MAX_MAP_ENTRIES = 1000;

export class PredictiveInterventionEngine {
  private predictions: Map<string, RiskPrediction[]> = new Map();
  private patterns: Map<string, BehavioralPattern> = new Map();
  private interventions: Map<string, InterventionResult[]> = new Map();
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  static isEnabled(): boolean {
    return featureFlags.isEnabled('predictive_interventions');
  }
  /** Disabled — analyzeAllUsers is a no-op stub. Re-enable when implemented. */
  start(): void {
    if (!PredictiveInterventionEngine.isEnabled()) {
      debug.info('Disabled via feature flag');
      return;
    }
    debug.info('Disabled — no-op stub pending');
  }
  stop(): void {
    if (this.checkInterval) { clearInterval(this.checkInterval); this.checkInterval = null; }
  }
  destroy(): void {
    this.stop();
    this.predictions.clear();
    this.patterns.clear();
    this.interventions.clear();
    debug.info('Destroyed — all Maps cleared');
  }
  analyzeUserPatterns(
    userId: string, sessionHistory: SessionRecord[],
    _currentStreak: number, _longestStreak: number,
  ): BehavioralPattern {
    if (!PredictiveInterventionEngine.isEnabled()) { return getDefaultPattern(userId); }
    const pattern = computeBehavioralPattern(userId, sessionHistory);
    this.evictOldest(this.patterns);
    this.patterns.set(userId, pattern);
    return pattern;
  }
  generatePredictions(
    userId: string, pattern: BehavioralPattern,
    _lastSessionDate: string | null, hoursSinceLastSession: number,
  ): RiskPrediction[] {
    if (!PredictiveInterventionEngine.isEnabled()) { return []; }
    const predictions: RiskPrediction[] = [];
    const now = Date.now();
    const streakRisk = assessStreakBreakRisk(pattern, hoursSinceLastSession);
    if (streakRisk.confidence > 0.3) {
      predictions.push(createRiskPrediction(userId, 'STREAK_AT_RISK', now, streakRisk, now + 86400000));
    }
    const burnoutRisk = assessBurnoutRisk(pattern);
    if (burnoutRisk.confidence > 0.4) {
      predictions.push(createRiskPrediction(userId, 'BURNOUT_DETECTED', now, burnoutRisk, now + 604800000));
    }
    const optimalTime = calculateOptimalTime(pattern);
    if (optimalTime.confidence > 0.6) {
      predictions.push(createRiskPrediction(userId, 'OPTIMAL_TIME_WINDOW', now, {
        confidence: optimalTime.confidence, severity: 'low',
        evidence: optimalTime.evidence, action: optimalTime.action,
      }, optimalTime.nextWindow));
    }
    this.evictOldest(this.predictions);
    this.predictions.set(userId, predictions);
    return predictions;
  }
  async sendIntervention(
    prediction: RiskPrediction, channel: 'push' | 'in_app' | 'coach_message',
  ): Promise<boolean> {
    if (!PredictiveInterventionEngine.isEnabled()) { return false; }
    const content = this.getInterventionContent(prediction);
    if (!content) { return false; }
    eventBus.publish('coach:intervention_triggered', {
      userId: prediction.userId, interventionId: prediction.id, type: prediction.type,
    });
    const result: InterventionResult = {
      predictionId: prediction.id, sentAt: Date.now(), channel,
      message: content.message, userResponded: false, outcome: 'unknown',
    };
    const userInterventions = this.interventions.get(prediction.userId) || [];
    userInterventions.push(result);
    if (!this.interventions.has(prediction.userId)) { this.evictOldest(this.interventions); }
    this.interventions.set(prediction.userId, userInterventions);
    prediction.interventionSent = true;
    prediction.interventionType = channel;
    return true;
  }
  verifyOutcomes(
    userId: string, actualEvents: { type: string; timestamp: number; prevented: boolean }[],
  ): void {
    for (const prediction of this.predictions.get(userId) || []) {
      const match = actualEvents.find((e) =>
        prediction.type === 'STREAK_AT_RISK' && e.type === 'streak_broken'
          ? Math.abs(e.timestamp - prediction.predictedToOccurAt) < 86400000 : false,
      );
      if (match) {
        prediction.actualOutcome = match.prevented ? 'prevented' : 'occurred';
        prediction.outcomeVerifiedAt = Date.now();
        const intervention = this.interventions.get(userId)
          ?.find((i) => i.predictionId === prediction.id);
        if (intervention) { intervention.outcome = match.prevented ? 'prevented' : 'ignored'; }
      }
    }
  }
  getCurrentRiskLevel(userId: string): {
    hasActivePredictions: boolean;
    highestSeverity: RiskPrediction['severity'] | null;
    activePredictions: RiskPrediction[];
    recommendedAction: string;
  } {
    const predictions = this.predictions.get(userId) || [];
    const active = predictions.filter((p) => !p.actualOutcome);
    if (active.length === 0) {
      return {
        hasActivePredictions: false, highestSeverity: null,
        activePredictions: [], recommendedAction: 'Continue your current routine',
      };
    }
    const severities: RiskPrediction['severity'][] = ['low', 'medium', 'high', 'critical'];
    const highestSeverity = active.reduce(
      (max, p) => (severities.indexOf(p.severity) > severities.indexOf(max) ? p.severity : max),
      active[0]!.severity,
    );
    return {
      hasActivePredictions: true, highestSeverity, activePredictions: active,
      recommendedAction:
        active.find((p) => p.type === 'STREAK_AT_RISK')?.recommendedAction || 'Complete a session soon',
    };
  }
  private getInterventionContent(prediction: RiskPrediction): { title: string; message: string } | null {
    switch (prediction.type) {
      case 'STREAK_AT_RISK':
        return { title: 'Streak at Risk! ⚠️', message: generateStreakInterventionMessage(prediction) };
      case 'BURNOUT_DETECTED':
        return { title: 'Taking a Break?', message: generateBurnoutMessage() };
      case 'OPTIMAL_TIME_WINDOW':
        return { title: 'Perfect Time to Focus', message: prediction.recommendedAction };
      default: return null;
    }
  }
  private evictOldest<K, V>(map: Map<K, V>): void {
    if (map.size >= MAX_MAP_ENTRIES) {
      const oldestKey = map.keys().next().value;
      if (oldestKey !== undefined) map.delete(oldestKey);
    }
  }
}

let engine: PredictiveInterventionEngine | null = null;
export function getPredictiveInterventionEngine(): PredictiveInterventionEngine {
  if (!engine) { engine = new PredictiveInterventionEngine(); }
  return engine;
}
export function destroyPredictiveInterventionEngine(): void {
  if (engine) { engine.destroy(); engine = null; }
}
