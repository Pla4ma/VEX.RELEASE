/**
 * Streak Risk Calculator
 *
 * Predicts streak breakage risk based on user behavior patterns.
 * Provides early warning system for at-risk streaks.
 *
 * @phase 5 - Deepening: Streak risk calculation
 */

import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';

const debug = createDebugger('streaks:risk');

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Risk Calculation Weights
// ============================================================================

const WEIGHTS = {
  TIME_DRIFT: 0.25, // Deviation from typical session time
  HOURS_ELAPSED: 0.3, // Raw hours since last session
  PATTERN_DECLINE: 0.2, // Historical declining pattern
  QUALITY_DROP: 0.15, // Recent poor session quality
  WEEKEND_FACTOR: 0.1, // Weekend/vacation risk
} as const;

const DAY_HOURS = 24;
const CRITICAL_THRESHOLD = 20; // Hours before streak break
const HIGH_THRESHOLD = 12;
const MEDIUM_THRESHOLD = 6;

// ============================================================================
// Core Calculation
// ============================================================================
// ============================================================================
// Helper Functions
// ============================================================================

function calculateRecentQuality(sessionHistory: { timestamp: number; quality: number }[]): number {
  if (sessionHistory.length === 0) {
    return 100;
  }

  // Take last 5 sessions
  const recent = sessionHistory.slice(-5);
  const avg = recent.reduce((sum, s) => sum + s.quality, 0) / recent.length;

  return Math.round(avg);
}

function getUrgency(level: RiskLevel, hoursSinceLastSession: number, daysUntilBreak: number): 'NONE' | 'SOON' | 'URGENT' | 'CRITICAL' {
  if (level === 'CRITICAL') {
    return 'CRITICAL';
  }
  if (level === 'HIGH') {
    return 'URGENT';
  }
  if (level === 'MEDIUM' && hoursSinceLastSession > 18) {
    return 'URGENT';
  }
  if (level === 'MEDIUM') {
    return 'SOON';
  }
  if (level === 'LOW' && daysUntilBreak <= 1) {
    return 'SOON';
  }
  return 'NONE';
}

function getSuggestedAction(level: RiskLevel, urgency: string): 'NONE' | 'REMINDER' | 'PUSH' | 'INTERVENTION' {
  if (level === 'CRITICAL') {
    return 'INTERVENTION';
  }
  if (level === 'HIGH') {
    return 'PUSH';
  }
  if (level === 'MEDIUM' && urgency === 'URGENT') {
    return 'PUSH';
  }
  if (level === 'MEDIUM') {
    return 'REMINDER';
  }
  if (level === 'LOW') {
    return 'REMINDER';
  }
  return 'NONE';
}

function generateRecommendation(level: RiskLevel, factors: RiskFactors): string {
  const { hoursSinceLastSession, typicalSessionHour, weekendRisk } = factors;

  switch (level) {
    case 'CRITICAL':
      return 'Your streak is about to break! Start a session NOW to save it.';

    case 'HIGH':
      const hoursLeft = Math.max(0, CRITICAL_THRESHOLD - hoursSinceLastSession);
      return `High risk! You have about ${Math.floor(hoursLeft)} hours left. Your typical time is ${typicalSessionHour}:00.`;

    case 'MEDIUM':
      if (weekendRisk) {
        return 'Weekend streak risk detected. Consider an earlier session today.';
      }
      return `Getting close to your usual session time (${typicalSessionHour}:00).`;

    case 'LOW':
      return 'Stay on track! Your streak is safe for now.';

    case 'NONE':
      return 'Great job maintaining your streak!';

    default:
      return '';
  }
}

// ============================================================================
// Export
// ============================================================================

export { getRiskLevel, analyzePattern };
export default StreakRiskCalculator;

export * from "./risk-calculator.types";
export * from "./risk-calculator.part1";
export * from "./risk-calculator.part2";
