/**
 * Retention Feature Types
 *
 * Types for user retention, engagement, and churn prevention features.
 */

export interface RetentionMetrics {
  userId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  metrics: {
    retentionRate: number; // 0-100
    engagementScore: number; // 0-100
    churnRisk: number; // 0-100
    lifetimeValue: number;
    sessionFrequency: number;
    averageSessionDuration: number;
    lastActiveDate: Date;
    daysSinceLastActivity: number;
  };
  trends: {
    retention: TrendData[];
    engagement: TrendData[];
    churnRisk: TrendData[];
  };
  predictions: {
    churnProbability: number; // 0-100
    nextActiveDate: Date;
    retentionProbability: number; // 0-100
    confidence: number; // 0-100
  };
}

export interface TrendData {
  date: Date;
  value: number;
  change: number;
  significance: 'low' | 'medium' | 'high';
}

export interface RetentionStrategy {
  id: string;
  name: string;
  description: string;
  type: StrategyType;
  targetAudience: TargetAudience;
  triggers: StrategyTrigger[];
  actions: StrategyAction[];
  schedule: StrategySchedule;
  budget: StrategyBudget;
  metrics: StrategyMetrics;
  status: StrategyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type StrategyType = 'reactivation' | 'engagement' | 'onboarding' | 'milestone' | 'gamification' | 'personalization' | 'social' | 'reward';

export interface TargetAudience {
  segments: UserSegment[];
  filters: AudienceFilter[];
  excludeSegments?: UserSegment[];
  sampleSize?: number;
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria;
  size: number;
  characteristics: string[];
}

export interface SegmentCriteria {
  registrationDate?: DateRange;
  lastActiveDate?: DateRange;
  engagementScore?: NumberRange;
  churnRisk?: NumberRange;
  subscriptionTier?: string[];
  features?: string[];
  behavior?: BehaviorPattern[];
  demographics?: DemographicFilter[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface NumberRange {
  min: number;
  max: number;
}

export interface BehaviorPattern {
  type: 'feature_usage' | 'session_pattern' | 'social_interaction' | 'purchase_behavior';
  pattern: string;
  frequency?: NumberRange;
  recency?: NumberRange;
}

export interface DemographicFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: unknown;
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: unknown;
  weight?: number; // 0-1
}

export interface StrategyTrigger {
  type: TriggerType;
  conditions: TriggerCondition[];
  frequency: TriggerFrequency;
  cooldown: number; // in hours
}

export type TriggerType = 'user_inactivity' | 'declining_engagement' | 'churn_risk_increase' | 'milestone_missed' | 'feature_abandonment' | 'subscription_expiry' | 'payment_failure' | 'support_ticket' | 'custom_event';

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: unknown;
  threshold?: number;
  timeWindow?: number; // in hours
}

export interface TriggerFrequency {
  type: 'once' | 'daily' | 'weekly' | 'monthly' | 'event_based';
  interval?: number;
  maxOccurrences?: number;
}

export interface StrategyAction {
  type: ActionType;
  parameters: ActionParameters;
  priority: number;
  delay?: number; // in minutes
  conditions?: ActionCondition[];
}

export type ActionType = 'notification' | 'email' | 'push' | 'in_app_message' | 'reward' | 'feature_unlock' | 'discount' | 'content_recommendation' | 'social_prompt' | 'survey' | 'webhook';

export interface ActionParameters {
  template?: string;
  content?: string;
  reward?: RewardDetails;
  discount?: DiscountDetails;
  feature?: string;
  recommendations?: ContentRecommendation[];
  survey?: SurveyDetails;
  webhook?: WebhookDetails;
}

export interface RewardDetails {
  type: 'points' | 'badge' | 'unlock' | 'currency';
  amount: number;
  reason: string;
  expires?: Date;
}

export interface DiscountDetails {
  type: 'percentage' | 'fixed' | 'free_trial';
  value: number;
  duration?: number; // in days
  products?: string[];
}

export interface ContentRecommendation {
  type: 'feature' | 'content' | 'challenge' | 'social';
  id: string;
  title: string;
  description: string;
  relevanceScore: number;
}

export interface SurveyDetails {
  id: string;
  type: 'nps' | 'csat' | 'custom';
  questions: SurveyQuestion[];
  incentive?: RewardDetails;
}

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'multiple_choice' | 'text' | 'boolean';
  question: string;
  options?: string[];
  required: boolean;
}

export interface WebhookDetails {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  payload: Record<string, unknown>;
}

export interface ActionCondition {
  field: string;
  operator: string;
  value: unknown;
}

export interface StrategySchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: Date;
  endDate?: Date;
  timezone: string;
  frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  sendTimes?: string[];
}

export interface StrategyBudget {
  maxCost: number;
  costPerUser: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface StrategyMetrics {
  targetUsers: number;
  reachedUsers: number;
  engagementRate: number;
  conversionRate: number;
  retentionLift: number;
  costPerAcquisition: number;
  roi: number;
}

export type StrategyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';

export interface ChurnPrediction {
  userId: string;
  predictionDate: Date;
  churnProbability: number; // 0-100
  churnTimeframe: number; // days until churn
  riskFactors: RiskFactor[];
  confidence: number; // 0-100
  recommendations: RetentionRecommendation[];
  model: string;
  version: string;
}

export interface RiskFactor {
  factor: string;
  impact: number; // 0-100
  description: string;
  category: 'behavior' | 'engagement' | 'technical' | 'financial' | 'social';
  detected: Date;
}

export interface RetentionRecommendation {
  type: RecommendationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  expectedImpact: number; // 0-100
  cost?: number;
  timeframe: number; // in days
  evidence: string[];
}

export type RecommendationType = 'intervention' | 'incentive' | 'feature_recommendation' | 'social_engagement' | 'content_personalization' | 'support_outreach' | 'pricing_adjustment' | 'onboarding_improvement';

export interface CohortAnalysis {
  id: string;
  name: string;
  description: string;
  cohortType: CohortType;
  cohortPeriod: CohortPeriod;
  startDate: Date;
  endDate: Date;
  metrics: CohortMetrics;
  segments: CohortSegment[];
  insights: CohortInsight[];
}

export type CohortType = 'registration' | 'first_purchase' | 'feature_adoption' | 'subscription_tier' | 'geographic' | 'acquisition_channel';

export type CohortPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface CohortMetrics {
  size: number;
  retentionRates: Record<number, number>; // period -> rate
  averageLifetime: number;
  lifetimeValue: number;
  churnRates: Record<number, number>;
  reactivationRates: Record<number, number>;
}

export interface CohortSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria;
  metrics: CohortMetrics;
  comparison: CohortComparison;
}

export interface CohortComparison {
  retentionDifference: number;
  lifetimeDifference: number;
  significance: 'low' | 'medium' | 'high';
  pValue: number;
}

export interface CohortInsight {
  type: 'pattern' | 'anomaly' | 'trend' | 'correlation';
  description: string;
  significance: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
}

export interface RetentionDashboard {
  userId?: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  overview: RetentionOverview;
  metrics: RetentionMetrics;
  segments: SegmentPerformance[];
  strategies: StrategyPerformance[];
  predictions: ChurnPrediction[];
  alerts: RetentionAlert[];
}

export interface RetentionOverview {
  totalUsers: number;
  activeUsers: number;
  atRiskUsers: number;
  churnedUsers: number;
  retentionRate: number;
  churnRate: number;
  engagementScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SegmentComparison {
  baseline: number;
  current: number;
  change: number;
  percentile: number;
}

export interface SegmentPerformance {
  segment: UserSegment;
  metrics: RetentionMetrics;
  performance: SegmentComparison;
  trends: TrendData[];
}

export interface StrategyPerformance {
  strategy: RetentionStrategy;
  performance: StrategyMetrics;
  roi: number;
  effectiveness: number; // 0-100
  efficiency: number; // 0-100
}

export interface RetentionAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedUsers: number;
  recommendations: string[];
  createdAt: Date;
  resolvedAt?: Date;
}

export type AlertType = 'churn_spike' | 'engagement_drop' | 'segment_decline' | 'strategy_failure' | 'model_drift' | 'budget_exceeded' | 'technical_issue';

export interface RetentionExperiment {
  id: string;
  name: string;
  hypothesis: string;
  type: ExperimentType;
  variants: ExperimentVariant[];
  traffic: TrafficAllocation;
  duration: ExperimentDuration;
  metrics: ExperimentMetrics;
  status: ExperimentStatus;
  results?: ExperimentResults;
  createdAt: Date;
  completedAt?: Date;
}

export type ExperimentType = 'notification_timing' | 'content_personalization' | 'reward_mechanics' | 'onboarding_flow' | 'feature_highlighting' | 'pricing_strategy';

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  traffic: number; // percentage
  configuration: Record<string, unknown>;
  metrics: VariantMetrics;
}

export interface TrafficAllocation {
  type: 'equal' | 'weighted' | 'adaptive';
  allocations: Record<string, number>;
}

export interface ExperimentDuration {
  startDate: Date;
  endDate: Date;
  minimumDuration: number; // in days
  maximumDuration: number; // in days
}

export interface ExperimentMetrics {
  primary: string;
  secondary: string[];
  guardrails: string[];
}

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface VariantMetrics {
  participants: number;
  conversions: number;
  conversionRate: number;
  retentionRate: number;
  engagementScore: number;
  statisticalSignificance: number;
  confidence: number;
}

export interface ExperimentResults {
  winner?: string;
  significance: number;
  confidence: number;
  improvement: number;
  insights: string[];
  recommendations: string[];
}

// Event Types
export interface RetentionEvent {
  type: 'user_active' | 'user_inactive' | 'churn_risk_changed' | 'strategy_triggered' | 'experiment_started' | 'experiment_completed';
  userId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
