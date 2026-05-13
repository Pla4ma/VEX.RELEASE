export type StartType = 'manual' | 'scheduled' | 'auto' | 'quick_start' | 'tutorial' | 'challenge' | 'social' | 'guided';

export type StartStatus = 'initializing' | 'preparing' | 'ready' | 'starting' | 'started' | 'failed' | 'cancelled';
export type WarmupType = 'mental' | 'physical' | 'technical' | 'creative' | 'social' | 'comprehensive';
export type SetupStepType = 'account_check' | 'equipment_setup' | 'environment_check' | 'profile_configuration' | 'goal_setting' | 'privacy_settings' | 'notification_preferences' | 'accessibility_options';
export type CalibrationType = 'input' | 'output' | 'biometric' | 'environmental' | 'performance' | 'comprehensive';
export type OrientationType = 'tutorial' | 'overview' | 'controls' | 'objectives' | 'interface' | 'features';
export type BriefingType = 'mission' | 'goals' | 'strategy' | 'tips' | 'motivation' | 'comprehensive';
export type EmotionType = 'excited' | 'calm' | 'focused' | 'creative' | 'energetic' | 'relaxed' | 'competitive' | 'collaborative' | 'curious' | 'confident';
export type StrategyApproach = 'conservative' | 'balanced' | 'aggressive' | 'adaptive' | 'experimental' | 'optimized';
export type TipCategory = 'performance' | 'strategy' | 'mindset' | 'technical' | 'social' | 'health' | 'environment';
export type EquipmentType = 'hardware' | 'software' | 'peripheral' | 'furniture' | 'environmental' | 'accessory';
export type ComfortLevel = 'poor' | 'fair' | 'good' | 'excellent';
export type PostureState = 'excellent' | 'good' | 'fair' | 'poor' | 'needs_improvement';
export type SessionMode = 'focus' | 'learning' | 'practice' | 'challenge' | 'creative' | 'social' | 'relaxation' | 'custom';

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'adaptive';
export type GoalType = 'performance' | 'learning' | 'completion' | 'time' | 'accuracy' | 'speed' | 'engagement' | 'social' | 'custom';

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type AssessmentMethod = 'self_report' | 'behavioral' | 'physiological' | 'performance' | 'hybrid';
export type StrategyType = 'breathing' | 'visualization' | 'music' | 'exercise' | 'meditation' | 'social' | 'environment' | 'cognitive';
export type ReadinessLevel = 'not_ready' | 'minimal' | 'moderate' | 'good' | 'excellent' | 'peak';
export type ReadinessDimensionType = 'physical' | 'mental' | 'emotional' | 'technical' | 'environmental' | 'social';

export type DimensionStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EffortLevel = 'minimal' | 'low' | 'medium' | 'high' | 'significant';

export type RecommendationType = 'preparation' | 'adjustment' | 'intervention' | 'enhancement' | 'recovery' | 'prevention';
export type ClearanceLevel = 'no_go' | 'conditional' | 'full' | 'enhanced';
// Event Types
export * from "./types.types";
