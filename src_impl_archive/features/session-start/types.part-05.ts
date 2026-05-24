export interface MoodTracking {
  baseline: Record<string, unknown>;
  current: Record<string, unknown>;
  trend: 'improving' | 'stable' | 'declining';
  volatility: number; // 0-100
  patterns: MoodPattern[];
}

export interface MoodPattern {
  pattern: string;
  frequency: number;
  impact: number; // 0-100
  triggers: string[];
}

export interface ReadinessAssessment {
  overall: ReadinessScore;
  dimensions: ReadinessDimension[];
  factors: ReadinessFactor[];
  recommendations: ReadinessRecommendation[];
  clearance: ReadinessClearance;
}

export interface ReadinessScore {
  value: number; // 0-100
  level: ReadinessLevel;
  confidence: number; // 0-100
  lastUpdated: Date;
}

export type ReadinessLevel = 'not_ready' | 'minimal' | 'moderate' | 'good' | 'excellent' | 'peak';

export interface ReadinessDimension {
  dimension: ReadinessDimensionType;
  score: number; // 0-100
  weight: number; // 0-1
  status: DimensionStatus;
  factors: string[];
}

export type ReadinessDimensionType = 'physical' | 'mental' | 'emotional' | 'technical' | 'environmental' | 'social';

export type DimensionStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface ReadinessFactor {
  factor: string;
  impact: number; // -100 to 100
  category: ReadinessDimensionType;
  actionable: boolean;
  urgency: 'low' | 'medium' | 'high';
}

export interface ReadinessRecommendation {
  recommendation: string;
  priority: RecommendationPriority;
  effort: EffortLevel;
  timeframe: string;
  expectedImpact: number; // 0-100
  type: RecommendationType;
}

export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EffortLevel = 'minimal' | 'low' | 'medium' | 'high' | 'significant';

export type RecommendationType = 'preparation' | 'adjustment' | 'intervention' | 'enhancement' | 'recovery' | 'prevention';

export interface ReadinessClearance {
  cleared: boolean;
  level: ClearanceLevel;
  conditions: ClearanceCondition[];
  restrictions: ClearanceRestriction[];
  validUntil: Date;
}

export type ClearanceLevel = 'no_go' | 'conditional' | 'full' | 'enhanced';

export interface ClearanceCondition {
  condition: string;
  met: boolean;
  critical: boolean;
  description: string;
}

export interface ClearanceRestriction {
  restriction: string;
  reason: string;
  duration: number; // in minutes
  alternatives: string[];
}

export interface StartExperience {
  flow: FlowState;
  engagement: EngagementLevel;
  immersion: ImmersionLevel;
  satisfaction: SatisfactionLevel;
  feedback: ExperienceFeedback;
  improvements: Record<string, unknown>[];
}

export interface FlowState {
  achieved: boolean;
  depth: number; // 0-100
  duration: number; // in seconds
  quality: number; // 0-100
  triggers: string[];
  barriers: string[];
}

export interface EngagementLevel {
  cognitive: number; // 0-100
  emotional: number; // 0-100
  behavioral: number; // 0-100
  overall: number; // 0-100
}

export interface ImmersionLevel {
  presence: number; // 0-100
  absorption: number; // 0-100
  flow: number; // 0-100
  overall: number; // 0-100
}

export interface SatisfactionLevel {
  immediate: number; // 0-100
  anticipated: number; // 0-100
  overall: number; // 0-100
  factors: SatisfactionFactor[];
}

export interface SatisfactionFactor {
  factor: string;
  impact: number; // -100 to 100
  description: string;
  category: 'positive' | 'negative';
}

export interface ExperienceFeedback {
  rating: number; // 1-5
  comments?: string;
  suggestions: string[];
  issues: ExperienceIssue[];
  highlights: ExperienceHighlight[];
}

export interface ExperienceIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reproduction?: string;
  impact: string;
}

export interface ExperienceHighlight {
  highlight: string;
  category: 'feature' | 'moment' | 'achievement' | 'interaction';
  description: string;
  memorable: boolean;
}

