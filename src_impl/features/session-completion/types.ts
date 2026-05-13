export type CompletionType = 'success' | 'failure' | 'timeout' | 'manual' | 'emergency' | 'interruption';

export type CompletionStatus = 'processing' | 'completed' | 'failed' | 'pending_review' | 'appealed';
export type PerformanceCategory = 'accuracy' | 'speed' | 'efficiency' | 'strategy' | 'consistency' | 'adaptability' | 'creativity' | 'teamwork' | 'leadership' | 'communication';
export type ComparisonType = 'personal_best' | 'personal_average' | 'peer_average' | 'global_average' | 'goal_target' | 'milestone';

export type ComparisonTarget = 'self' | 'peers' | 'global' | 'goals' | 'milestones';
export type HighlightType = 'personal_best' | 'milestone_achieved' | 'streak_extended' | 'skill_improved' | 'perfect_performance' | 'comeback_victory' | 'speed_record' | 'accuracy_record' | 'strategy_mastery' | 'team_excellence';
export type RewardType = 'experience_points' | 'currency' | 'skill_points' | 'streak_extension' | 'unlock' | 'badge' | 'title' | 'cosmetic' | 'boost' | 'consumable';

export type RewardSource = 'completion' | 'performance' | 'milestone' | 'streak' | 'achievement' | 'bonus' | 'event' | 'challenge';
export type ProgressType = 'skill_level' | 'experience' | 'streak' | 'rank' | 'title' | 'unlock' | 'reputation' | 'currency' | 'achievement' | 'milestone';
export type EmotionType = 'joy' | 'excitement' | 'pride' | 'satisfaction' | 'relief' | 'frustration' | 'anger' | 'disappointment' | 'anxiety' | 'boredom' | 'confusion' | 'surprise';
export type ShareableType = 'achievement' | 'performance' | 'milestone' | 'streak' | 'rank_up' | 'unlock' | 'completion' | 'story';
export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'reddit' | 'discord' | 'slack' | 'whatsapp' | 'telegram';
export type TemplateLayout = 'centered' | 'left_aligned' | 'right_aligned' | 'split' | 'card' | 'banner' | 'story';
export type InsightType = 'strength' | 'weakness' | 'opportunity' | 'threat' | 'pattern' | 'anomaly' | 'correlation' | 'prediction';
export type PredictionType = 'next_session_score' | 'churn_probability' | 'achievement_timeline' | 'skill_progression' | 'engagement_level' | 'retention_probability';
export type BenchmarkType = 'personal_best' | 'peer_average' | 'global_average' | 'expert_level' | 'goal_target' | 'industry_standard';
// Event Types
export * from "./types.types";
