export type StrategyType = 'reactivation' | 'engagement' | 'onboarding' | 'milestone' | 'gamification' | 'personalization' | 'social' | 'reward';
export type TriggerType = 'user_inactivity' | 'declining_engagement' | 'churn_risk_increase' | 'milestone_missed' | 'feature_abandonment' | 'subscription_expiry' | 'payment_failure' | 'support_ticket' | 'custom_event';
export type ActionType = 'notification' | 'email' | 'push' | 'in_app_message' | 'reward' | 'feature_unlock' | 'discount' | 'content_recommendation' | 'social_prompt' | 'survey' | 'webhook';
export type StrategyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
export type RecommendationType = 'intervention' | 'incentive' | 'feature_recommendation' | 'social_engagement' | 'content_personalization' | 'support_outreach' | 'pricing_adjustment' | 'onboarding_improvement';
export type CohortType = 'registration' | 'first_purchase' | 'feature_adoption' | 'subscription_tier' | 'geographic' | 'acquisition_channel';

export type CohortPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type AlertType = 'churn_spike' | 'engagement_drop' | 'segment_decline' | 'strategy_failure' | 'model_drift' | 'budget_exceeded' | 'technical_issue';
export type ExperimentType = 'notification_timing' | 'content_personalization' | 'reward_mechanics' | 'onboarding_flow' | 'feature_highlighting' | 'pricing_strategy';
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
// Event Types
export * from "./types.types";
