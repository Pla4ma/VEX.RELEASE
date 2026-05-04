/**
 * Neuroplasticity Trainer Analytics
 *
 * Comprehensive analytics tracking for brain training system.
 */

import { capture } from '../../shared/analytics/analytics-service';
import type { CognitiveDomain, DomainProgress, CognitiveProfile } from './NeuroplasticityTrainer';

// ============================================================================
// PROFILE & INITIALIZATION
// ============================================================================

export function trackNptProfileCreated(
  userId: string,
  adhdSubtype: string,
  priorityDomains: CognitiveDomain[],
  baselineLevel: number
): void {
  capture('npt_profile_created', {
    user_id: userId,
    adhd_subtype: adhdSubtype,
    priority_domains: priorityDomains,
    baseline_level: baselineLevel,
    domain_count: 8,
  });
}

// ============================================================================
// TRAINING SESSIONS
// ============================================================================

export function trackTrainingSessionStarted(
  userId: string,
  domain: CognitiveDomain,
  level: number,
  difficulty: string
): void {
  capture('npt_session_started', {
    user_id: userId,
    domain,
    current_level: level,
    difficulty_tier: difficulty,
  });
}

export function trackTrainingSessionCompleted(
  userId: string,
  domain: CognitiveDomain,
  accuracy: number,
  xpEarned: number,
  levelUp: boolean,
  overallLevel: number,
  sessionDurationSeconds: number
): void {
  capture('npt_session_completed', {
    user_id: userId,
    domain,
    accuracy_percent: Math.round(accuracy * 100),
    xp_earned: xpEarned,
    leveled_up: levelUp,
    overall_level: overallLevel,
    session_duration_seconds: sessionDurationSeconds,
  });

  // Track milestone achievements
  if (levelUp) {
    capture('npt_level_up', {
      user_id: userId,
      domain,
      new_level: overallLevel,
    });
  }

  // Track high accuracy sessions
  if (accuracy >= 0.9) {
    capture('npt_high_accuracy_session', {
      user_id: userId,
      domain,
      accuracy: Math.round(accuracy * 100),
    });
  }
}

// ============================================================================
// INTERVENTIONS
// ============================================================================

export function trackInterventionTriggered(
  userId: string,
  interventionId: string,
  domain: CognitiveDomain,
  trigger: string,
  mentalState?: string
): void {
  capture('npt_intervention_triggered', {
    user_id: userId,
    intervention_id: interventionId,
    domain,
    trigger_type: trigger,
    mental_state: mentalState,
  });
}

export function trackInterventionCompleted(
  userId: string,
  interventionId: string,
  domain: CognitiveDomain,
  completed: boolean,
  effectiveness: number,
  durationSeconds: number
): void {
  capture('npt_intervention_completed', {
    user_id: userId,
    intervention_id: interventionId,
    domain,
    was_completed: completed,
    self_reported_effectiveness: effectiveness,
    duration_seconds: durationSeconds,
  });

  if (completed && effectiveness >= 4) {
    capture('npt_intervention_high_effectiveness', {
      user_id: userId,
      intervention_id: interventionId,
      effectiveness,
    });
  }
}

export function trackInterventionDismissed(
  userId: string,
  interventionId: string,
  reason?: string
): void {
  capture('npt_intervention_dismissed', {
    user_id: userId,
    intervention_id: interventionId,
    dismissal_reason: reason || 'unknown',
  });
}

// ============================================================================
// COGNITIVE ASSESSMENTS
// ============================================================================

export function trackCognitiveAssessmentStarted(
  userId: string,
  assessmentNumber: number
): void {
  capture('npt_assessment_started', {
    user_id: userId,
    assessment_number: assessmentNumber,
  });
}

export function trackCognitiveAssessmentCompleted(
  userId: string,
  overallImprovement: number,
  domainScores: Record<CognitiveDomain, number>,
  assessmentNumber: number
): void {
  capture('npt_assessment_completed', {
    user_id: userId,
    overall_improvement_percent: Math.round(overallImprovement),
    domain_scores: domainScores,
    assessment_number: assessmentNumber,
  });

  // Track significant improvements
  if (overallImprovement >= 20) {
    capture('npt_significant_improvement', {
      user_id: userId,
      improvement_percent: Math.round(overallImprovement),
      assessment_number: assessmentNumber,
    });
  }
}

// ============================================================================
// PROGRESS & STREAKS
// ============================================================================

export function trackDomainProgress(
  userId: string,
  domain: CognitiveDomain,
  progress: DomainProgress
): void {
  capture('npt_domain_progress', {
    user_id: userId,
    domain,
    current_level: progress.level,
    total_xp: progress.xp,
    accuracy_percent: Math.round(progress.accuracy * 100),
    improvement_percent: Math.round(progress.improvementPercent),
    streak_days: progress.streakDays,
  });
}

export function trackStreakMilestone(
  userId: string,
  streakDays: number,
  isOverallStreak: boolean
): void {
  capture('npt_streak_milestone', {
    user_id: userId,
    streak_days: streakDays,
    streak_type: isOverallStreak ? 'overall' : 'domain',
  });
}

export function trackTitleAchieved(
  userId: string,
  title: string,
  level: number
): void {
  capture('npt_title_achieved', {
    user_id: userId,
    new_title: title,
    level_at_achievement: level,
  });
}

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================

export function trackNptEngagement(
  userId: string,
  engagementType: 'daily_training' | 'weekly_assessment' | 'intervention_completed' | 'profile_viewed'
): void {
  capture('npt_engagement', {
    user_id: userId,
    engagement_type: engagementType,
  });
}

export function trackTrainingConsistency(
  userId: string,
  sessionsThisWeek: number,
  targetSessions: number
): void {
  capture('npt_training_consistency', {
    user_id: userId,
    sessions_this_week: sessionsThisWeek,
    target_sessions: targetSessions,
    consistency_percent: Math.round((sessionsThisWeek / targetSessions) * 100),
  });
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

export function trackNptUserProperties(
  userId: string,
  profile: CognitiveProfile,
  allProgress: Record<CognitiveDomain, DomainProgress>
): void {
  const strongestDomain = Object.entries(allProgress)
    .sort((a, b) => b[1].level - a[1].level)[0];

  const weakestDomain = Object.entries(allProgress)
    .sort((a, b) => a[1].level - b[1].level)[0];

  capture('npt_user_properties', {
    user_id: userId,
    npt_overall_level: profile.overallLevel,
    npt_title: profile.title,
    npt_adhd_subtype: profile.adhdSubtype,
    npt_current_streak: profile.currentStreakDays,
    npt_longest_streak: profile.longestStreakDays,
    npt_total_training_minutes: profile.totalTrainingMinutes,
    npt_assessments_completed: profile.assessments.length,
    npt_strongest_domain: strongestDomain[0],
    npt_weakest_domain: weakestDomain[0],
    npt_total_interventions: profile.totalInterventionsDelivered,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export function trackNptError(
  userId: string,
  errorType: string,
  errorMessage: string,
  context: Record<string, unknown>
): void {
  capture('npt_error', {
    user_id: userId,
    error_type: errorType,
    error_message: errorMessage,
    error_context: context,
  });
}

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export function trackNptFunnel(
  userId: string,
  step: 'profile_created' | 'first_session' | 'first_level_up' | 'first_assessment' | 'title_achieved'
): void {
  capture('npt_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
