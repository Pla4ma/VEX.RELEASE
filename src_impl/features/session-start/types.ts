/**
 * Session Start Feature Types
 *
 * Types for session initialization, preparation, and startup experiences.
 */

export interface SessionEnvironment {
  type: "physical" | "virtual" | "hybrid";
  setup: EnvironmentSetup;
  conditions: EnvironmentConditions;
  resources: EnvironmentResources;
}

export interface EnvironmentSetup {
  workspace: string;
  equipment: string[];
  configuration: Record<string, any>;
}

export interface EnvironmentConditions {
  lighting: number; // 0-100
  temperature: number; // 0-100
  noise: number; // 0-100
  comfort: number; // 0-100
}

export interface EnvironmentResources {
  available: string[];
  allocated: string[];
  constraints: string[];
  deadline?: Date;
}

export interface SessionStart {
  id: string;
  sessionId: string;
  userId: string;
  startType: StartType;
  status: StartStatus;
  initiatedAt: Date;
  startedAt: Date;
  preparation: SessionPreparation;
  configuration: SessionConfiguration;
  environment: SessionEnvironment;
  context: SessionContext;
  goals: SessionGoal[];
  mood: SessionMood;
  readiness: ReadinessAssessment;
  experience: StartExperience;
}

export type StartType = "manual" | "scheduled" | "auto" | "quick_start" | "tutorial" | "challenge" | "social" | "guided";

export type StartStatus = "initializing" | "preparing" | "ready" | "starting" | "started" | "failed" | "cancelled";

export interface SessionPreparation {
  warmup: WarmupSession;
  setup: SetupProcess;
  calibration: CalibrationSession;
  orientation: OrientationSession;
  briefing: BriefingSession;
  equipment: EquipmentCheck;
  environment: EnvironmentSetup;
}

export interface WarmupSession {
  enabled: boolean;
  type: WarmupType;
  duration: number; // in seconds
  exercises: WarmupExercise[];
  completed: boolean;
  effectiveness: number; // 0-100
}

export type WarmupType = "mental" | "physical" | "technical" | "creative" | "social" | "comprehensive";

export interface WarmupExercise {
  id: string;
  name: string;
  type: "breathing" | "stretching" | "focus" | "visualization" | "reaction" | "memory";
  duration: number; // in seconds
  instructions: string[];
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  performance?: ExercisePerformance;
}

export interface ExercisePerformance {
  accuracy: number; // 0-100
  speed: number; // 0-100
  consistency: number; // 0-100
  improvement: number; // percentage
}

export interface SetupProcess {
  steps: SetupStep[];
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  duration: number; // in seconds
  skipAllowed: boolean;
}

export interface SetupStep {
  id: string;
  name: string;
  type: SetupStepType;
  description: string;
  instructions: string[];
  required: boolean;
  completed: boolean;
  skipped: boolean;
  duration: number; // in seconds
}

export type SetupStepType = "account_check" | "equipment_setup" | "environment_check" | "profile_configuration" | "goal_setting" | "privacy_settings" | "notification_preferences" | "accessibility_options";

export interface CalibrationSession {
  enabled: boolean;
  type: CalibrationType;
  measurements: CalibrationMeasurement[];
  baseline: CalibrationBaseline;
  adjustments: CalibrationAdjustment[];
  completed: boolean;
  accuracy: number; // 0-100
}

export type CalibrationType = "input" | "output" | "biometric" | "environmental" | "performance" | "comprehensive";

export interface CalibrationMeasurement {
  metric: string;
  value: number;
  unit: string;
  target: number;
  tolerance: number;
  status: "measuring" | "complete" | "failed";
  timestamp: Date;
}

export interface CalibrationBaseline {
  established: boolean;
  metrics: Record<string, number>;
  confidence: number; // 0-100
  stability: number; // 0-100
  lastUpdated: Date;
}

export interface CalibrationAdjustment {
  parameter: string;
  oldValue: number;
  newValue: number;
  reason: string;
  impact: "low" | "medium" | "high";
  timestamp: Date;
}

export interface OrientationSession {
  enabled: boolean;
  type: OrientationType;
  content: OrientationContent;
  progress: OrientationProgress;
  completed: boolean;
  understanding: number; // 0-100
}

export type OrientationType = "tutorial" | "overview" | "controls" | "objectives" | "interface" | "features";

export interface OrientationContent {
  sections: OrientationSection[];
  interactive: boolean;
  skippable: boolean;
  estimatedDuration: number; // in seconds
}

export interface OrientationSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "video" | "interactive" | "demonstration";
  duration: number; // in seconds
  required: boolean;
  completed: boolean;
}

export interface OrientationProgress {
  currentSection: number;
  totalSections: number;
  completedSections: string[];
  timeSpent: number; // in seconds
  engagement: number; // 0-100
}

export interface BriefingSession {
  enabled: boolean;
  type: BriefingType;
  objectives: BriefingObjective[];
  context: BriefingContext;
  strategy: BriefingStrategy;
  tips: BriefingTip[];
  completed: boolean;
}

export type BriefingType = "mission" | "goals" | "strategy" | "tips" | "motivation" | "comprehensive";

export interface BriefingObjective {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  measurable: boolean;
  target?: number;
  unit?: string;
  timeframe?: number; // in seconds
}

export interface BriefingContext {
  previousSession: SessionContext;
  currentStreak: number;
  recentPerformance: PerformanceSummary;
  upcomingChallenges: ChallengeInfo[];
  socialContext: SocialContext;
}

export interface SessionContext {
  environment: EnvironmentContext;
  time: TimeContext;
  social: SocialContext;
  performance: PerformanceContext;
  goals: GoalContext;
  mood: MoodContext;
}

export interface EnvironmentContext {
  location: string;
  noiseLevel: number; // 0-100
  lighting: number; // 0-100
  temperature: number; // 0-100
  comfort: number; // 0-100
  distractions: number; // 0-100
}

export interface TimeContext {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  dayOfWeek: number; // 0-6
  season: "spring" | "summer" | "fall" | "winter";
  timezone: string;
  availableTime: number; // in minutes
  preferredDuration: number; // in minutes
}

export interface SocialContext {
  alone: boolean;
  friendsOnline: number;
  activeRivalries: number;
  teamMembers: number;
  socialMood: "energetic" | "calm" | "competitive" | "collaborative";
}

export interface PerformanceContext {
  recentTrend: "improving" | "stable" | "declining";
  averageScore: number;
  bestScore: number;
  consistency: number; // 0-100
  fatigue: number; // 0-100
  motivation: number; // 0-100
}

export interface GoalContext {
  activeGoals: GoalInfo[];
  completedGoals: number;
  progressTowardsGoals: number; // 0-100
  upcomingDeadlines: DeadlineInfo[];
}

export interface GoalInfo {
  id: string;
  title: string;
  progress: number; // 0-100
  priority: "low" | "medium" | "high" | "critical";
}

export interface DeadlineInfo {
  goalId: string;
  title: string;
  deadline: Date;
  daysRemaining: number;
  progress: number; // 0-100
}

export interface MoodContext {
  current: EmotionState;
  expected: EmotionState;
  factors: MoodFactor[];
  stability: number; // 0-100
}

export interface EmotionState {
  primary: EmotionType;
  intensity: number; // 0-100
  valence: number; // -100 to 100
  arousal: number; // 0-100
}

export type EmotionType = "excited" | "calm" | "focused" | "creative" | "energetic" | "relaxed" | "competitive" | "collaborative" | "curious" | "confident";

export interface MoodFactor {
  factor: string;
  impact: number; // -100 to 100
  description: string;
  category: "positive" | "negative" | "neutral";
}

export interface PerformanceSummary {
  lastSession: SessionSummary;
  recentAverage: number;
  improvementRate: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SessionSummary {
  score: number;
  duration: number;
  completion: boolean;
  satisfaction: number;
  achievements: string[];
}

export interface ChallengeInfo {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly" | "special";
  difficulty: "easy" | "medium" | "hard" | "expert";
  progress: number; // 0-100
  deadline?: Date;
}

export interface BriefingStrategy {
  approach: StrategyApproach;
  tactics: StrategyTactic[];
  resources: StrategyResource[];
  contingencies: StrategyContingency[];
}

export type StrategyApproach = "conservative" | "balanced" | "aggressive" | "adaptive" | "experimental" | "optimized";

export interface StrategyTactic {
  id: string;
  name: string;
  description: string;
  适用条件: string[];
  expectedOutcome: string;
  riskLevel: "low" | "medium" | "high";
}

export interface StrategyResource {
  type: "tool" | "skill" | "knowledge" | "support" | "equipment";
  name: string;
  availability: boolean;
  effectiveness: number; // 0-100
}

export interface StrategyContingency {
  scenario: string;
  trigger: string;
  action: string;
  priority: "low" | "medium" | "high";
}

export interface BriefingTip {
  id: string;
  category: TipCategory;
  content: string;
  relevance: number; // 0-100
  personalized: boolean;
}

export type TipCategory = "performance" | "strategy" | "mindset" | "technical" | "social" | "health" | "environment";

export interface EquipmentCheck {
  required: EquipmentItem[];
  optional: EquipmentItem[];
  status: EquipmentStatus;
  recommendations: EquipmentRecommendation[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  required: boolean;
  available: boolean;
  quality: number; // 0-100
  lastChecked?: Date;
}

export type EquipmentType = "hardware" | "software" | "peripheral" | "furniture" | "environmental" | "accessory";

export interface EquipmentStatus {
  ready: boolean;
  issues: EquipmentIssue[];
  setupTime: number; // in seconds
  qualityScore: number; // 0-100
}

export interface EquipmentIssue {
  item: string;
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
  solution?: string;
  resolved: boolean;
}

export interface EquipmentRecommendation {
  item: string;
  recommendation: string;
  priority: "low" | "medium" | "high";
  estimatedImpact: number; // 0-100
  cost?: number;
}

export interface EnvironmentSetup {
  lighting: LightingSetup;
  sound: SoundSetup;
  temperature: TemperatureSetup;
  comfort: ComfortSetup;
  distractions: DistractionManagement;
}

export interface LightingSetup {
  current: number; // 0-100
  optimal: number; // 0-100
  adjustable: boolean;
  type: "natural" | "artificial" | "mixed";
  recommendations: string[];
}

export interface SoundSetup {
  noiseLevel: number; // 0-100
  backgroundMusic: boolean;
  noiseCancellation: boolean;
  recommendations: string[];
}

export interface TemperatureSetup {
  current: number; // in Celsius/Fahrenheit
  optimal: number; // in Celsius/Fahrenheit
  adjustable: boolean;
  comfort: number; // 0-100
}

export interface ComfortSetup {
  seating: ComfortLevel;
  posture: PostureCheck;
  ergonomics: ErgonomicAssessment;
  recommendations: string[];
}

export type ComfortLevel = "poor" | "fair" | "good" | "excellent";

export interface PostureCheck {
  current: PostureState;
  recommendations: string[];
  exercises: PostureExercise[];
}

export type PostureState = "excellent" | "good" | "fair" | "poor" | "needs_improvement";

export interface PostureExercise {
  name: string;
  duration: number; // in seconds
  instructions: string[];
  frequency: string;
}

export interface ErgonomicAssessment {
  score: number; // 0-100
  issues: ErgonomicIssue[];
  improvements: ErgonomicImprovement[];
}

export interface ErgonomicIssue {
  area: string;
  severity: "low" | "medium" | "high";
  description: string;
  solution: string;
}

export interface ErgonomicImprovement {
  area: string;
  improvement: string;
  impact: number; // 0-100
  effort: "low" | "medium" | "high";
}

export interface DistractionManagement {
  currentLevel: number; // 0-100
  sources: DistractionSource[];
  strategies: DistractionStrategy[];
  effectiveness: number; // 0-100
}

export interface DistractionSource {
  type: "digital" | "physical" | "social" | "environmental";
  source: string;
  frequency: "rare" | "occasional" | "frequent" | "constant";
  impact: number; // 0-100
}

export interface DistractionStrategy {
  strategy: string;
  effectiveness: number; // 0-100
  ease: number; // 0-100
  recommended: boolean;
}

export interface SessionConfiguration {
  mode: SessionMode;
  difficulty: DifficultyLevel;
  duration: DurationConfig;
  objectives: ObjectiveConfig;
  accessibility: AccessibilityConfig;
  privacy: PrivacyConfig;
  social: SocialConfig;
}

export type SessionMode = "focus" | "learning" | "practice" | "challenge" | "creative" | "social" | "relaxation" | "custom";

export type DifficultyLevel = "beginner" | "easy" | "medium" | "hard" | "expert" | "adaptive";

export interface DurationConfig {
  target: number; // in minutes
  minimum: number; // in minutes
  maximum: number; // in minutes
  flexible: boolean;
  autoExtend: boolean;
}

export interface ObjectiveConfig {
  primary: string;
  secondary: string[];
  measurable: boolean;
  timeBound: boolean;
  realistic: boolean;
  specific: boolean;
}

export interface AccessibilityConfig {
  fontSize: "small" | "medium" | "large" | "extra-large";
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  subtitles: boolean;
  keyboardNavigation: boolean;
  voiceControl: boolean;
}

export interface PrivacyConfig {
  dataCollection: boolean;
  analytics: boolean;
  socialSharing: boolean;
  leaderboards: boolean;
  publicProfile: boolean;
  recording: boolean;
}

export interface SocialConfig {
  multiplayer: boolean;
  voiceChat: boolean;
  textChat: boolean;
  screenSharing: boolean;
  spectating: boolean;
  invitations: boolean;
}

export interface SessionGoal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  priority: GoalPriority;
  measurable: boolean;
  target?: number;
  unit?: string;
  timeframe?: number; // in seconds
  progress: GoalProgress;
  milestones: GoalMilestone[];
}

export type GoalType = "performance" | "learning" | "completion" | "time" | "accuracy" | "speed" | "engagement" | "social" | "custom";

export type GoalPriority = "low" | "medium" | "high" | "critical";

export interface GoalProgress {
  current: number;
  target: number;
  percentage: number;
  rate: number; // per minute
  estimatedCompletion?: Date;
}

export interface GoalMilestone {
  id: string;
  title: string;
  value: number;
  achieved: boolean;
  achievedAt?: Date;
  reward?: string;
}

export interface SessionMood {
  current: MoodState;
  target: MoodState;
  assessment: MoodAssessment;
  strategies: MoodStrategy[];
  tracking: MoodTracking;
}

export interface MoodState {
  energy: number; // 0-100
  focus: number; // 0-100
  motivation: number; // 0-100
  confidence: number; // 0-100
  stress: number; // 0-100
  excitement: number; // 0-100
}

export interface MoodAssessment {
  method: AssessmentMethod;
  accuracy: number; // 0-100
  confidence: number; // 0-100
  factors: MoodFactor[];
  recommendations: string[];
}

export type AssessmentMethod = "self_report" | "behavioral" | "physiological" | "performance" | "hybrid";

export interface MoodStrategy {
  strategy: string;
  type: StrategyType;
  effectiveness: number; // 0-100
  duration: number; // in minutes
  instructions: string[];
}

export type StrategyType = "breathing" | "visualization" | "music" | "exercise" | "meditation" | "social" | "environment" | "cognitive";

export interface MoodTracking {
  baseline: MoodState;
  current: MoodState;
  trend: "improving" | "stable" | "declining";
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

export type ReadinessLevel = "not_ready" | "minimal" | "moderate" | "good" | "excellent" | "peak";

export interface ReadinessDimension {
  dimension: ReadinessDimensionType;
  score: number; // 0-100
  weight: number; // 0-1
  status: DimensionStatus;
  factors: string[];
}

export type ReadinessDimensionType = "physical" | "mental" | "emotional" | "technical" | "environmental" | "social";

export type DimensionStatus = "excellent" | "good" | "fair" | "poor" | "critical";

export interface ReadinessFactor {
  factor: string;
  impact: number; // -100 to 100
  category: ReadinessDimensionType;
  actionable: boolean;
  urgency: "low" | "medium" | "high";
}

export interface ReadinessRecommendation {
  recommendation: string;
  priority: RecommendationPriority;
  effort: EffortLevel;
  timeframe: string;
  expectedImpact: number; // 0-100
  type: RecommendationType;
}

export type RecommendationPriority = "low" | "medium" | "high" | "urgent";

export type EffortLevel = "minimal" | "low" | "medium" | "high" | "significant";

export type RecommendationType = "preparation" | "adjustment" | "intervention" | "enhancement" | "recovery" | "prevention";

export interface ReadinessClearance {
  cleared: boolean;
  level: ClearanceLevel;
  conditions: ClearanceCondition[];
  restrictions: ClearanceRestriction[];
  validUntil: Date;
}

export type ClearanceLevel = "no_go" | "conditional" | "full" | "enhanced";

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
  improvements: ExperienceImprovement[];
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
  category: "positive" | "negative";
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
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  reproduction?: string;
  impact: string;
}

export interface ExperienceHighlight {
  highlight: string;
  category: "feature" | "moment" | "achievement" | "interaction";
  description: string;
  memorable: boolean;
}

export interface ExperienceImprovement {
  area: string;
  current: number; // 0-100
  target: number; // 0-100
  gap: number;
  priority: "low" | "medium" | "high";
  strategies: string[];
  resources: ImprovementResource[];
}

export interface ImprovementResource {
  type: "tutorial" | "tool" | "setting" | "feature" | "exercise";
  name: string;
  description: string;
  availability: boolean;
  effectiveness: number; // 0-100
}

// Event Types
export interface SessionStartEvent {
  type: "session_initiated" | "session_prepared" | "session_ready" | "session_started" | "preparation_completed" | "readiness_assessed";
  userId: string;
  sessionId: string;
  startId: string;
  data: Record<string, any>;
  timestamp: Date;
}
