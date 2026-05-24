import { capture } from '../../shared/analytics/analytics-service';

export function trackRetentionExperimentCompleted(
  userId: string,
  experimentId: string,
  completionDate: Date,
  duration: number,
  results: {
    winner?: string;
    significance: number;
    confidence: number;
    improvement: number;
    variants: {
      id: string;
      participants: number;
      conversions: number;
      conversionRate: number;
      retentionRate: number;
      statisticalSignificance: number;
    }[];
  },
  insights: {
    learnings: string[];
    surprises: string[];
    recommendations: string[];
    nextSteps: string[];
  },
  businessImpact: {
    expectedImprovement: number;
    implementationCost: number;
    roi: number;
  },
): void {
  capture('retention_experiment_completed', {
    user_id: userId,
    experiment_id: experimentId,
    completion_date: completionDate.toISOString(),
    duration,
    results,
    insights,
    business_impact: businessImpact,
  });
}

// ============================================================================
// PREDICTION ANALYTICS
// ============================================================================

export function trackChurnPredictionUpdated(
  userId: string,
  predictionId: string,
  churnProbability: number,
  churnTimeframe: number,
  riskFactors: {
    factor: string;
    impact: number;
    description: string;
    category: string;
    detected: Date;
  }[],
  confidence: number,
  model: string,
  version: string,
  recommendations: {
    type: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    action: string;
    expectedImpact: number;
    timeframe: string;
  }[],
): void {
  capture('retention_churn_prediction_updated', {
    user_id: userId,
    prediction_id: predictionId,
    prediction_date: new Date().toISOString(),
    churn_probability: churnProbability,
    churn_timeframe: churnTimeframe,
    riskFactors,
    confidence,
    model,
    version,
    recommendations,
  });
}

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

// ============================================================================
// INTERVENTION ANALYTICS
// ============================================================================

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

