/**
 * Neuro-Productivity - Domain Types
 */

export interface NeuroProductivityProfile {
  id: string;
  userId: string;
  name: string;
  brainwavePatterns: BrainwaveProfile;
  cognitiveMetrics: CognitiveMetrics;
  productivityPatterns: ProductivityPattern[];
  optimalConditions: OptimalConditions;
  limitations: CognitiveLimitations;
  preferences: NeuroPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrainwaveProfile {
  baseline: {
    delta: number;    // 0.5-4 Hz - Deep sleep
    theta: number;    // 4-8 Hz - Drowsy/meditative
    alpha: number;   // 8-12 Hz - Relaxed/alert
    beta: number;     // 12-30 Hz - Active thinking
    gamma: number;    // 30-100 Hz - Peak performance
  };
  patterns: {
    focus: BrainwavePattern;
    creativity: BrainwavePattern;
    learning: BrainwavePattern;
    relaxation: BrainwavePattern;
    problem_solving: BrainwavePattern;
  };
  anomalies: BrainwaveAnomaly[];
  lastCalibrated: Date;
}

export interface BrainwavePattern {
  frequency: number;
  amplitude: number;
  coherence: number;
  stability: number;
  duration: number; // minutes
  triggers: string[];
  effects: string[];
}

export interface BrainwaveAnomaly {
  type: 'excessive_slow_wave' | 'beta_spindles' | 'alpha_blocking' | 'hemispheric_asymmetry' | 'coherence_issues';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: Date;
  impact: string;
  recommendations: string[];
}

export interface CognitiveMetrics {
  attention: {
    sustained_attention: number;      // 0-100
    selective_attention: number;      // 0-100
    divided_attention: number;        // 0-100
    attentional_control: number;      // 0-100
  };
  memory: {
    working_memory: number;           // 0-100
    short_term_memory: number;        // 0-100
    long_term_memory: number;         // 0-100
    memory_recall_speed: number;      // 0-100
  };
  executive_function: {
    cognitive_flexibility: number;    // 0-100
    inhibitory_control: number;       // 0-100
    planning: number;                 // 0-100
    decision_making: number;          // 0-100
  };
  processing: {
    processing_speed: number;         // 0-100
    cognitive_load: number;           // 0-100
    mental_fatigue: number;           // 0-100
    cognitive_efficiency: number;     // 0-100
  };
  creativity: {
    divergent_thinking: number;       // 0-100
    convergent_thinking: number;       // 0-100
    originality: number;               // 0-100
    creative_confidence: number;      // 0-100
  };
  lastAssessed: Date;
}

export interface ProductivityPattern {
  id: string;
  name: string;
  type: 'daily_rhythm' | 'weekly_cycle' | 'seasonal_trend' | 'task_specific';
  schedule: {
    peak_times: TimeRange[];
    low_times: TimeRange[];
    break_intervals: TimeRange[];
  };
  conditions: {
    optimal_environment: EnvironmentCondition[];
    performance_patterns: ProductivityPattern[];
    distraction_sensitivities: DistractionSensitivity[];
  };
  effectiveness: {
    productivity_score: number;       // 0-100
    quality_score: number;            // 0-100
    efficiency_score: number;         // 0-100
    consistency_score: number;        // 0-100
  };
  recommendations: string[];
  lastUpdated: Date;
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;   // HH:MM format
  day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
}

export interface EnvironmentCondition {
  factor: 'lighting' | 'temperature' | 'noise' | 'air_quality' | 'ergonomics' | 'social_presence';
  optimal: {
    min: number;
    max: number;
    unit: string;
  };
  current: {
    value: number;
    unit: string;
    timestamp: Date;
  };
  impact_level: number; // 0-100
}

export interface PerformanceFactor {
  factor: 'caffeine' | 'exercise' | 'sleep' | 'nutrition' | 'stress' | 'motivation' | 'social_interaction';
  relationship: 'positive' | 'negative' | 'neutral' | 'complex';
  strength: number; // 0-100
  lag_time: number; // minutes
  duration: number; // minutes
}

export interface DistractionSensitivity {
  type: 'auditory' | 'visual' | 'social' | 'digital' | 'environmental';
  sensitivity_level: number; // 0-100
  recovery_time: number; // minutes
  mitigation_strategies: string[];
}

export interface OptimalConditions {
  work_environment: {
    lighting: {
      type: 'natural' | 'warm' | 'cool' | 'neutral';
      intensity: number; // lux
      color_temperature: number; // Kelvin
    };
    temperature: {
      range: { min: number; max: number }; // Celsius
      humidity: { min: number; max: number }; // %
    };
    noise: {
      max_level: number; // decibels
      type: 'silence' | 'white_noise' | 'ambient' | 'music';
      music_preferences?: string[];
    };
    air_quality: {
      co2_level: number; // ppm
      ventilation_rate: number; // m³/h
    };
  };
  work_schedule: {
    peak_productivity_hours: TimeRange[];
    preferred_session_length: number; // minutes
    optimal_break_frequency: number; // minutes
    deep_work_blocks: TimeRange[];
  };
  cognitive_state: {
    target_brainwave_states: Record<string, number>;
    optimal_cognitive_load: number; // 0-100
    preferred_arousal_level: number; // 0-100
  };
  physical_factors: {
    posture_reminders: boolean;
    exercise_intervals: TimeRange[];
    hydration_reminders: boolean;
    nutrition_timing: string[];
  };
}

export interface CognitiveLimitations {
  attention_span: {
    maximum_focus_duration: number; // minutes
    decline_rate: number; // % per hour
    recovery_time: number; // minutes
  };
  memory_capacity: {
    working_memory_items: number;
    information_retention_rate: number; // % per hour
  };
  cognitive_load: {
    maximum_concurrent_tasks: number;
    complexity_threshold: number; // 0-100
    overload_indicators: string[];
  };
  energy_cycles: {
    ultradian_rhythm_length: number; // minutes
    energy_drain_rate: number; // % per hour
    recovery_rate: number; // % per hour
  };
  triggers: string[];
  mitigation_strategies: string[];
}

export interface NeuroPreferences {
  feedback_style: 'detailed' | 'concise' | 'visual' | 'auditory' | 'kinesthetic';
  intervention_timing: 'proactive' | 'reactive' | 'scheduled' | 'on_demand';
  data_sharing: {
    research_consent: boolean;
    anonymized_data: boolean;
    sharing_partners: string[];
  };
  notifications: {
    real_time_alerts: boolean;
    summary_reports: boolean;
    recommendation_frequency: 'immediate' | 'daily' | 'weekly';
  };
  privacy: {
    brainwave_data_retention: number; // days
    performance_data_retention: number; // days
    data_encryption: boolean;
  };
}

export interface NeuroProductivitySession {
  id: string;
  userId: string;
  profileId: string;
  type: 'focus' | 'creative' | 'learning' | 'problem_solving' | 'relaxation' | 'recovery';
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // minutes
  target: {
    goal: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    expected_duration: number;
    success_criteria: string[];
  };
  environment: {
    lighting: number;
    temperature: number;
    noise_level: number;
    distractions: string[];
  };
  brainwave_data: BrainwaveDataPoint[];
  cognitive_metrics: SessionCognitiveMetrics[];
  interventions: NeuroIntervention[];
  outcomes: SessionOutcome;
  analytics: SessionAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrainwaveDataPoint {
  timestamp: Date;
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
  quality: number; // 0-100 signal quality
  artifacts: string[];
}

export interface SessionCognitiveMetrics {
  timestamp: Date;
  attention_level: number;
  cognitive_load: number;
  mental_fatigue: number;
  productivity_score: number;
  stress_level: number;
  engagement_level: number;
}

export interface NeuroIntervention {
  id: string;
  type: 'environmental' | 'behavioral' | 'auditory' | 'visual' | 'haptic' | 'chemical';
  trigger: 'automatic' | 'manual' | 'scheduled';
  stimulus: {
    name: string;
    parameters: Record<string, any>;
    intensity: number; // 0-100
  };
  timing: {
    start_time: Date;
    duration: number; // minutes
    frequency?: number; // Hz for periodic interventions
  };
  expected_effect: {
    target_metric: string;
    expected_change: number;
    latency: number; // minutes
    duration: number; // minutes
  };
  actual_effect?: {
    measured_change: number;
    latency: number;
    duration: number;
    effectiveness: number; // 0-100
  };
  user_feedback?: {
    helpfulness: number; // 1-5
    distraction_level: number; // 1-5
    comfort_level: number; // 1-5
    comments?: string;
  };
  createdAt: Date;
}

export interface SessionOutcome {
  goal_achieved: boolean;
  completion_percentage: number;
  quality_score: number; // 0-100
  efficiency_score: number; // 0-100
  challenges: string[];
  insights: string[];
  recommendations: string[];
  user_satisfaction: number; // 1-5
}

export interface SessionAnalytics {
  performance_metrics: {
    average_productivity: number;
    peak_productivity: number;
    productivity_variance: number;
    time_on_task: number; // percentage
    distraction_events: number;
    recovery_time: number; // minutes
  };
  cognitive_patterns: {
    dominant_brainwave: string;
    coherence_score: number;
    cognitive_efficiency: number;
    mental_fatigue_progression: number[];
    attention_stability: number;
  };
  intervention_effectiveness: {
    successful_interventions: number;
    average_effectiveness: number;
    most_effective_type: string;
    user_preference_alignment: number;
  };
  comparative_analysis: {
    vs_historical_average: {
      productivity: number;
      quality: number;
      efficiency: number;
    };
    vs_optimal_conditions: {
      productivity: number;
      quality: number;
      efficiency: number;
    };
  };
}

export interface NeuroProductivityInsight {
  id: string;
  userId: string;
  type: 'pattern_recognition' | 'optimization_opportunity' | 'limitation_identified' | 'performance_trend' | 'recommendation';
  title: string;
  description: string;
  category: 'attention' | 'memory' | 'creativity' | 'energy' | 'environment' | 'schedule' | 'intervention';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  evidence: InsightEvidence[];
  recommendations: InsightRecommendation[];
  potential_impact: {
    productivity_gain: number; // percentage
    quality_improvement: number; // percentage
    efficiency_gain: number; // percentage
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    time_required: number; // minutes
    resources_needed: string[];
    cost?: number;
  };
  status: 'new' | 'reviewed' | 'accepted' | 'implemented' | 'rejected' | 'archived';
  createdAt: Date;
  reviewedAt?: Date;
  implementedAt?: Date;
}

export interface InsightEvidence {
  type: 'brainwave_data' | 'performance_metrics' | 'session_data' | 'environmental_data' | 'user_feedback';
  description: string;
  data_source: string;
  timestamp: Date;
  strength: number; // 0-100
}

export interface InsightRecommendation {
  action: string;
  description: string;
  expected_outcome: string;
  implementation_steps: string[];
  success_criteria: string[];
  timeline: string;
  resources: string[];
}

export interface NeuroProductivityReport {
  id: string;
  userId: string;
  period: {
    start: Date;
    end: Date;
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  };
  summary: {
    total_sessions: number;
    total_duration: number; // minutes
    average_session_length: number;
    overall_productivity_score: number;
    improvement_trend: 'improving' | 'stable' | 'declining';
  };
  performance_analysis: {
    productivity_patterns: ProductivityPattern[];
    cognitive_trends: CognitiveTrend[];
    environmental_impacts: EnvironmentalImpact[];
    intervention_effectiveness: InterventionEffectiveness[];
  };
  insights: NeuroProductivityInsight[];
  recommendations: ReportRecommendation[];
  goals: GoalProgress[];
  achievements: NeuroAchievement[];
  generatedAt: Date;
}

export interface CognitiveTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  change_rate: number; // % per period
  significance: number; // 0-100
  factors: string[];
}

export interface EnvironmentalImpact {
  factor: string;
  impact_level: number; // 0-100
  correlation_strength: number; // 0-100
  optimal_range: { min: number; max: number };
  current_compliance: number; // 0-100
}

export interface InterventionEffectiveness {
  intervention_type: string;
  success_rate: number; // 0-100
  average_impact: number; // 0-100
  user_satisfaction: number; // 1-5
  usage_frequency: number;
  cost_effectiveness: number; // 0-100
}

export interface ReportRecommendation {
  category: 'environment' | 'schedule' | 'interventions' | 'goals' | 'training';
  priority: 'low' | 'medium' | 'high';
  action: string;
  rationale: string;
  expected_benefit: string;
  implementation_effort: 'low' | 'medium' | 'high';
}

export interface GoalProgress {
  goalId: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'on_track' | 'ahead' | 'behind' | 'completed' | 'missed';
  progress_rate: number; // % per period
}

export interface NeuroAchievement {
  id: string;
  title: string;
  description: string;
  category: 'focus' | 'creativity' | 'learning' | 'productivity' | 'consistency';
  type: 'milestone' | 'streak' | 'improvement' | 'breakthrough';
  criteria: AchievementCriteria;
  progress: AchievementProgress;
  unlockedAt?: Date;
  rewards: AchievementReward[];
}

export interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
  completed: boolean;
  lastUpdated: Date;
}

export interface AchievementCriteria {
  metric: string;
  target: number;
  operator: 'equals' | 'greater_than' | 'less_than' | 'average' | 'streak';
  time_period?: number; // days
}

export interface AchievementReward {
  type: 'badge' | 'insight' | 'recommendation' | 'feature_unlock';
  name: string;
  description: string;
  value: any;
}
