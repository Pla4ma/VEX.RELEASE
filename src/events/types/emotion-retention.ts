/**
 * Emotion Retention Event Definitions
 *
 * Events for emotional momentum and retention systems.
 */

import type { RetentionIntervention } from '@/features/emotion-retention/EmotionRetentionEngine';

export interface EmotionRetentionEventDefinitions {
  // Trajectory tracking
  'emotion:trajectory_changed': {
    userId: string;
    trajectory: 'RISING' | 'STABLE' | 'DECLINING' | 'AT_RISK';
    momentum: number;
    riskCount: number;
  };

  'emotion:momentum_updated': {
    userId: string;
    previousMomentum: number;
    newMomentum: number;
    delta: number;
    reason: string;
  };

  // Retention interventions
  'retention:intervention_ready': {
    userId: string;
    intervention: RetentionIntervention;
  };

  'retention:intervention_sent': {
    userId: string;
    interventionType: string;
    scheduledFor?: number;
  };

  'retention:intervention_engaged': {
    userId: string;
    interventionType: string;
    engagementTime: number;
  };

  // Risk detection
  'retention:risk_detected': {
    userId: string;
    riskType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
  };

  // Protective factors
  'retention:protective_factor_added': {
    userId: string;
    factorType: string;
    strength: number;
  };
}
