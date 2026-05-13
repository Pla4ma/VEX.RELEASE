/**
 * Advanced Analytics System
 *
 * Phase 12.4 — Funnels, cohorts, revenue analytics, alerting
 */

import { capture } from './index';

// ============================================================================
// Funnel Analysis
// ============================================================================
// Standard onboarding funnel
const ONBOARDING_FUNNEL_STEPS = [
  { name: 'App Open', event: 'app_opened' },
  { name: 'Started Onboarding', event: 'onboarding_started' },
  { name: 'Completed Profile', event: 'profile_completed' },
  { name: 'First Session Started', event: 'session_started' },
  { name: 'First Session Completed', event: 'session_completed' },
  { name: 'Joined Squad', event: 'squad_joined' },
];
// ============================================================================
// Cohort Retention Analysis
// ============================================================================
// ============================================================================
// Revenue Analytics
// ============================================================================
// ============================================================================
// Alerting System
// ============================================================================
const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'alert-d1-retention-drop',
    name: 'D1 Retention Drop',
    metric: 'retention.day1',
    threshold: 10, // 10% drop
    operator: '<',
    duration: 60, // 1 hour
    severity: 'CRITICAL',
    notifyChannels: ['email', 'slack'],
  },
  {
    id: 'alert-session-crash-rate',
    name: 'Session Crash Rate High',
    metric: 'crash.session_rate',
    threshold: 1, // 1% crash rate
    operator: '>',
    duration: 30,
    severity: 'WARNING',
    notifyChannels: ['email'],
  },
  {
    id: 'alert-revenue-drop',
    name: 'Daily Revenue Drop',
    metric: 'revenue.daily',
    threshold: 20, // 20% drop
    operator: '<',
    duration: 120,
    severity: 'CRITICAL',
    notifyChannels: ['email', 'slack', 'pagerduty'],
  },
];
export * from "./advanced-analytics.types";
export * from "./advanced-analytics.part1";
export * from "./advanced-analytics.part2";
