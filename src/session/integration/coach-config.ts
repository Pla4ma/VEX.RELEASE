import { createDebugger } from '../../utils/debug';
import type {} from '../types';
import type {} from './sessionCoachContext';

export const FEATURE_KEY = 'ai_coach_basic' as const;
export const debug = createDebugger('session:coach-integration');

export interface CoachIntegrationConfig {
  enabled: boolean;
  interruptionThresholds: { warning: number; critical: number };
  enableProactiveTips: boolean;
  enableComebackDetection: boolean;
  enableStreakRiskAlerts: boolean;
  enablePersonalizedGoals: boolean;
  enableSessionInsights: boolean;
}

export const DEFAULT_CONFIG: CoachIntegrationConfig = {
  enabled: true,
  interruptionThresholds: { warning: 60, critical: 300 },
  enableProactiveTips: false,
  enableComebackDetection: true,
  enableStreakRiskAlerts: false,
  enablePersonalizedGoals: true,
  enableSessionInsights: true,
};

export type CoachMessage = {
  type: string;
  message: string;
  context: string;
  priority: 'low' | 'normal' | 'high';
  actionButton?: { label: string; action: string };
};
