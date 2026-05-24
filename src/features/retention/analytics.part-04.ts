import { capture } from '../../shared/analytics/analytics-service';

export function trackRetentionInterventionCompleted(
  userId: string,
  interventionId: string,
  completionDate: Date,
  duration: number,
  results: {
    userResponded: boolean;
    responseTime: number;
    actionsCompleted: string[];
    incentivesClaimed: string[];
  },
  impact: {
    engagementChange: number;
    retentionProbability: number;
    nextActivityPrediction: Date;
    satisfaction: number;
  },
  effectiveness: {
    success: boolean;
    score: number;
    roi: number;
    cost: number;
  },
): void {
  capture('retention_intervention_completed', {
    user_id: userId,
    intervention_id: interventionId,
    completion_date: completionDate.toISOString(),
    duration,
    results,
    impact: {
      ...impact,
      next_activity_prediction: impact.nextActivityPrediction.toISOString(),
    },
    effectiveness,
  });
}

// ============================================================================
// LIFECYCLE ANALYTICS
// ============================================================================

export function trackUserLifecycleStageChanged(
  userId: string,
  previousStage: string,
  currentStage: string,
  stageDuration: number,
  changeReason: string,
  changeTrigger: string,
  stageCharacteristics: {
    engagement: number;
    retention: number;
    value: number;
    potential: number;
  },
  nextMilestones: {
    milestone: string;
    probability: number;
    timeframe: number;
  }[],
  recommendations: {
    immediate: string[];
    ongoing: string[];
  },
): void {
  capture('retention_user_lifecycle_stage_changed', {
    user_id: userId,
    previous_stage: previousStage,
    current_stage: currentStage,
    stage_duration: stageDuration,
    change_reason: changeReason,
    change_trigger: changeTrigger,
    stage_characteristics: stageCharacteristics,
    next_milestones: nextMilestones,
    recommendations,
  });
}

export function trackUserMilestoneReached(
  userId: string,
  milestoneId: string,
  milestoneType: 'engagement' | 'retention' | 'value' | 'loyalty' | 'achievement',
  milestoneName: string,
  reachedAt: Date,
  progress: {
    current: number;
    target: number;
    percentage: number;
  },
  rewards: {
    type: string;
    value: number;
    name: string;
  }[],
  nextMilestone: {
    name: string;
    target: number;
    estimatedTime: number;
  },
): void {
  capture('retention_user_milestone_reached', {
    user_id: userId,
    milestone_id: milestoneId,
    milestone_type: milestoneType,
    milestone_name: milestoneName,
    reached_at: reachedAt.toISOString(),
    progress,
    rewards,
    nextMilestone,
  });
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export function trackRetentionDashboardViewed(
  userId: string,
  dashboardType: 'overview' | 'user_detail' | 'cohort' | 'experiments' | 'strategies',
  filters: {
    timeframe: string;
    segments: string[];
    metrics: string[];
  },
  interactions: {
    viewDuration: number;
    interactions: string[];
    exports: string[];
    shares: string[];
  },
  context: {
    device: string;
    location?: string;
    role: string;
  },
): void {
  capture('retention_dashboard_viewed', {
    user_id: userId,
    dashboard_type: dashboardType,
    filters,
    interactions,
    context,
  });
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

