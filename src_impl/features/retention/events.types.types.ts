export interface BaseRetentionEvent {
    id: string;
    userId: string;
    timestamp: Date;
    data: DynamicRecord;
    metadata: EventMetadata;
}

export interface EventMetadata {
    source: string;
    version: string;
    platform?: string;
    deviceInfo?: DeviceInfo;
    sessionId?: string;
    correlationId?: string;
}

export interface DeviceInfo {
    type: 'mobile' | 'tablet' | 'desktop' | 'web';
    os: string;
    version: string;
    appVersion?: string;
}

export interface UserActiveEvent extends BaseRetentionEvent {
    type: 'user_active';
    data: {
        activityType: 'session_start' | 'feature_use' | 'social_interaction' | 'achievement' | 'purchase';
        activityDetails: {
          feature?: string;
          duration?: number;
          engagement?: number;
          context?: DynamicRecord;
        };
        sessionContext: {
          sessionId: string;
          sessionDuration: number;
          device: string;
          location?: string;
        };
        retentionMetrics: {
          daysSinceLastActivity: number;
          currentStreak: number;
          engagementScore: number;
          churnRisk: number;
        };
        };
}

export interface UserInactiveEvent extends BaseRetentionEvent {
    type: 'user_inactive';
    data: {
        inactivityPeriod: number; // days
        lastActivityDate: Date;
        inactivityReason: 'natural' | 'forced' | 'technical' | 'user_choice';
        previousEngagement: {
          averageSessionDuration: number;
          featuresUsed: string[];
          lastStreak: number;
        };
        riskFactors: {
          decreasingEngagement: boolean;
          missedGoals: number;
          abandonedSessions: number;
          socialDisconnection: boolean;
        };
        };
}

export interface UserChurnRiskChangedEvent extends BaseRetentionEvent {
    type: 'user_churn_risk_changed';
    data: {
        previousRisk: number;
        currentRisk: number;
        riskChange: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        contributingFactors: {
          factor: string;
          impact: number;
          description: string;
        }[];
        prediction: {
          churnProbability: number;
          timeToChurn: number;
          confidence: number;
        };
        recommendedActions: {
          action: string;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          expectedImpact: number;
        }[];
        };
}

export interface RetentionStrategyTriggeredEvent extends BaseRetentionEvent {
    type: 'retention_strategy_triggered';
    data: {
        strategyId: string;
        strategyName: string;
        strategyType: string;
        triggerCondition: {
          type: string;
          value: DynamicValue;
          threshold: number;
        };
        targetAudience: {
          segments: string[];
          userCount: number;
          criteria: DynamicRecord;
        };
        actions: {
          type: string;
          parameters: DynamicRecord;
          scheduled: boolean;
          priority: number;
        }[];
        context: {
          userId: string;
          triggerData: DynamicRecord;
          environment: DynamicRecord;
        };
        };
}

export interface RetentionStrategyCompletedEvent extends BaseRetentionEvent {
    type: 'retention_strategy_completed';
    data: {
        strategyId: string;
        completionDate: Date;
        duration: number;
        results: {
          targetUsers: number;
          reachedUsers: number;
          engagedUsers: number;
          convertedUsers: number;
          retentionRate: number;
          engagementRate: number;
          conversionRate: number;
        };
        performance: {
          effectiveness: number;
          efficiency: number;
          roi: number;
          costPerUser: number;
        };
        insights: {
          successes: string[];
          failures: string[];
          improvements: string[];
        };
        };
}

export interface RetentionStrategyFailedEvent extends BaseRetentionEvent {
    type: 'retention_strategy_failed';
    data: {
        strategyId: string;
        failureDate: Date;
        failureReason: string;
        failureType: 'technical' | 'execution' | 'performance' | 'budget' | 'compliance';
        affectedUsers: number;
        impact: {
          userExperience: string;
          businessImpact: string;
          reputation: string;
        };
        recovery: {
          possible: boolean;
          actions: string[];
          timeline: string;
        };
        };
}

export interface CohortAnalysisCompletedEvent extends BaseRetentionEvent {
    type: 'cohort_analysis_completed';
    data: {
        cohortId: string;
        cohortName: string;
        cohortType: string;
        analysisPeriod: {
          start: Date;
          end: Date;
        };
        metrics: {
          size: number;
          retentionRates: Record<number, number>;
          averageLifetime: number;
          lifetimeValue: number;
          churnRates: Record<number, number>;
        };
        insights: {
          patterns: string[];
          anomalies: string[];
          trends: string[];
          recommendations: string[];
        };
        segments: {
          segmentId: string;
          performance: number;
          comparison: string;
        }[];
        };
}

export interface CohortPerformanceAlertEvent extends BaseRetentionEvent {
    type: 'cohort_performance_alert';
    data: {
        cohortId: string;
        alertType: 'retention_drop' | 'churn_spike' | 'engagement_decline' | 'anomaly';
        severity: 'low' | 'medium' | 'high' | 'critical';
        metrics: {
          current: number;
          baseline: number;
          change: number;
          significance: number;
        };
        context: {
          timeframe: string;
          comparison: string;
          externalFactors: string[];
        };
        recommendations: {
          immediate: string[];
          shortTerm: string[];
          longTerm: string[];
        };
        };
}

export interface RetentionExperimentStartedEvent extends BaseRetentionEvent {
    type: 'retention_experiment_started';
    data: {
        experimentId: string;
        experimentName: string;
        hypothesis: string;
        experimentType: string;
        variants: {
          id: string;
          name: string;
          description: string;
          traffic: number;
          configuration: DynamicRecord;
        }[];
        traffic: {
          total: number;
          allocation: Record<string, number>;
          duration: number;
        };
        metrics: {
          primary: string;
          secondary: string[];
          guardrails: string[];
        };
        startDate: Date;
        endDate: Date;
        };
}

export interface RetentionExperimentCompletedEvent extends BaseRetentionEvent {
    type: 'retention_experiment_completed';
    data: {
        experimentId: string;
        completionDate: Date;
        duration: number;
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
        };
        insights: {
          learnings: string[];
          surprises: string[];
          recommendations: string[];
          nextSteps: string[];
        };
        businessImpact: {
          expectedImprovement: number;
          implementationCost: number;
          roi: number;
        };
        };
}

export interface ChurnPredictionUpdatedEvent extends BaseRetentionEvent {
    type: 'churn_prediction_updated';
    data: {
        predictionId: string;
        userId: string;
        predictionDate: Date;
        churnProbability: number;
        churnTimeframe: number;
        riskFactors: {
          factor: string;
          impact: number;
          description: string;
          category: string;
          detected: Date;
        }[];
        confidence: number;
        model: string;
        version: string;
        recommendations: {
          type: string;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          action: string;
          expectedImpact: number;
          timeframe: string;
        }[];
        previousPrediction?: {
          probability: number;
          timeframe: number;
          date: Date;
        };
        };
}

export interface RetentionPredictionAccuracyEvent extends BaseRetentionEvent {
    type: 'retention_prediction_accuracy';
    data: {
        model: string;
        version: string;
        evaluationPeriod: {
          start: Date;
          end: Date;
        };
        accuracy: {
          overall: number;
          precision: number;
          recall: number;
          f1Score: number;
          auc: number;
        };
        calibration: {
          predicted: number[];
          actual: number[];
          reliability: number;
        };
        segments: {
          segment: string;
          accuracy: number;
          sampleSize: number;
        }[];
        improvements: {
          accuracy: number;
          contributingFactors: string[];
        };
        };
}

export interface RetentionInterventionTriggeredEvent extends BaseRetentionEvent {
    type: 'retention_intervention_triggered';
    data: {
        interventionId: string;
        interventionType: 'reactivation' | 'engagement' | 'incentive' | 'support' | 'education';
        triggerReason: string;
        triggerCondition: {
          metric: string;
          threshold: number;
          currentValue: number;
        };
        intervention: {
          title: string;
          description: string;
          actions: {
            type: string;
            parameters: DynamicRecord;
            timing: string;
          }[];
          incentives: {
            type: string;
            value: number;
            conditions: string[];
          }[];
        };
        targetUser: {
          userId: string;
          riskLevel: string;
          personalized: boolean;
          context: DynamicRecord;
        };
        };
}

export interface RetentionInterventionCompletedEvent extends BaseRetentionEvent {
    type: 'retention_intervention_completed';
    data: {
        interventionId: string;
        userId: string;
        completionDate: Date;
        duration: number;
        results: {
          userResponded: boolean;
          responseTime: number;
          actionsCompleted: string[];
          incentivesClaimed: string[];
        };
        impact: {
          engagementChange: number;
          retentionProbability: number;
          nextActivityPrediction: Date;
          satisfaction: number;
        };
        effectiveness: {
          success: boolean;
          score: number;
          roi: number;
          cost: number;
        };
        feedback: {
          userRating?: number;
          userComment?: string;
          systemNotes: string[];
        };
        };
}

export interface UserLifecycleStageChangedEvent extends BaseRetentionEvent {
    type: 'user_lifecycle_stage_changed';
    data: {
        previousStage: string;
        currentStage: string;
        stageDuration: number;
        changeReason: string;
        changeTrigger: string;
        stageCharacteristics: {
          engagement: number;
          retention: number;
          value: number;
          potential: number;
        };
        nextMilestones: {
          milestone: string;
          probability: number;
          timeframe: number;
        }[];
        recommendations: {
          immediate: string[];
          ongoing: string[];
        };
        };
}

export interface UserMilestoneReachedEvent extends BaseRetentionEvent {
    type: 'user_milestone_reached';
    data: {
        milestoneId: string;
        milestoneType: 'engagement' | 'retention' | 'value' | 'loyalty' | 'achievement';
        milestoneName: string;
        reachedAt: Date;
        progress: {
          current: number;
          target: number;
          percentage: number;
        };
        rewards: {
          type: string;
          value: number;
          name: string;
        }[];
        celebration: {
          message: string;
          channels: string[];
          personalization: boolean;
        };
        nextMilestone: {
          name: string;
          target: number;
          estimatedTime: number;
        };
        };
}

export interface RetentionAnalyticsEvent extends BaseRetentionEvent {
    type: 'retention_analytics';
    data: {
        analyticsType: 'overview' | 'cohort' | 'prediction' | 'intervention' | 'experiment';
        timeframe: string;
        metrics: Record<string, number>;
        dimensions: DynamicRecord;
        insights: {
          type: string;
          description: string;
          significance: string;
          recommendations: string[];
        }[];
        trends: {
          metric: string;
          direction: 'up' | 'down' | 'stable';
          change: number;
          significance: string;
        }[];
        generatedAt: Date;
        };
}

export interface RetentionDashboardViewedEvent extends BaseRetentionEvent {
    type: 'retention_dashboard_viewed';
    data: {
        dashboardType: 'overview' | 'user_detail' | 'cohort' | 'experiments' | 'strategies';
        filters: {
          timeframe: string;
          segments: string[];
          metrics: string[];
        };
        interactions: {
          viewDuration: number;
          interactions: string[];
          exports: string[];
          shares: string[];
        };
        context: {
          device: string;
          location?: string;
          role: string;
        };
        };
}

export interface RetentionSystemMaintenanceEvent extends BaseRetentionEvent {
    type: 'retention_system_maintenance';
    data: {
        maintenanceType: 'scheduled' | 'emergency' | 'upgrade' | 'migration';
        startTime: Date;
        endTime?: Date;
        duration?: number;
        affectedServices: string[];
        impact: {
          predictions: boolean;
          interventions: boolean;
          analytics: boolean;
          experiments: boolean;
        };
        message: string;
        initiatedBy: string;
        };
}

export interface RetentionSystemErrorEvent extends BaseRetentionEvent {
    type: 'retention_system_error';
    data: {
        errorType: 'prediction_error' | 'intervention_error' | 'analytics_error' | 'system_error';
        errorCode: string;
        errorMessage: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        context: {
          service: string;
          operation: string;
          userId?: string;
          strategyId?: string;
          experimentId?: string;
        };
        stackTrace?: string;
        affectedUsers: number;
        recoveryAction: string;
        };
}

export type RetentionEventType = UserActiveEvent | UserInactiveEvent | UserChurnRiskChangedEvent | RetentionStrategyTriggeredEvent | RetentionStrategyCompletedEvent | RetentionStrategyFailedEvent | CohortAnalysisCompletedEvent | CohortPerformanceAlertEvent | RetentionExperimentStartedEvent | RetentionExperimentCompletedEvent | ChurnPredictionUpdatedEvent | RetentionPredictionAccuracyEvent | RetentionInterventionTriggeredEvent | RetentionInterventionCompletedEvent | UserLifecycleStageChangedEvent | UserMilestoneReachedEvent | RetentionAnalyticsEvent | RetentionDashboardViewedEvent | RetentionSystemMaintenanceEvent | RetentionSystemErrorEvent;
