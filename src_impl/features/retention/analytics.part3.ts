import { capture } from "../../shared/analytics/analytics-service";


export function trackRetentionPredictionAccuracy(
  userId: string,
  model: string,
  version: string,
  evaluationPeriod: {
    start: Date;
    end: Date;
  },
  accuracy: {
    overall: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
  },
  calibration: {
    predicted: number[];
    actual: number[];
    reliability: number;
  },
  segments: {
    segment: string;
    accuracy: number;
    sampleSize: number;
  }[],
  improvements: {
    accuracy: number;
    contributingFactors: string[];
  },
): void {
  capture('retention_prediction_accuracy', {
    user_id: userId,
    model,
    version,
    evaluation_period: {
      start: evaluationPeriod.start.toISOString(),
      end: evaluationPeriod.end.toISOString(),
    },
    accuracy,
    calibration,
    segments,
    improvements,
  });
}

export function trackRetentionInterventionTriggered(
  userId: string,
  interventionId: string,
  interventionType: 'reactivation' | 'engagement' | 'incentive' | 'support' | 'education',
  triggerReason: string,
  triggerCondition: {
    metric: string;
    threshold: number;
    currentValue: number;
  },
  intervention: {
    title: string;
    description: string;
    actions: {
      type: string;
      parameters: Record<string, unknown>;
      timing: string;
    }[];
    incentives: {
      type: string;
      value: number;
      conditions: string[];
    }[];
  },
): void {
  capture('retention_intervention_triggered', {
    user_id: userId,
    intervention_id: interventionId,
    intervention_type: interventionType,
    trigger_reason: triggerReason,
    trigger_condition: triggerCondition,
    intervention,
  });
}

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