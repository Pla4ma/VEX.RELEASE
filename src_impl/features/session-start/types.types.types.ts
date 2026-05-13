/**
 * Session Start Feature Types
 *
 * Types for session initialization, preparation, and startup experiences.
 */
export interface SessionEnvironment {
    type: 'physical' | 'virtual' | 'hybrid';
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
    lighting: number;
    temperature: number;
    noise: number;
    comfort: number;
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
    duration: number;
    exercises: WarmupExercise[];
    completed: boolean;
    effectiveness: number;
}

export interface WarmupExercise {
    id: string;
    name: string;
    type: 'breathing' | 'stretching' | 'focus' | 'visualization' | 'reaction' | 'memory';
    duration: number;
    instructions: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    completed: boolean;
    performance?: ExercisePerformance;
}

export interface ExercisePerformance {
    accuracy: number;
    speed: number;
    consistency: number;
    improvement: number;
}

export interface SetupProcess {
    steps: SetupStep[];
    currentStep: number;
    totalSteps: number;
    completed: boolean;
    duration: number;
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
    duration: number;
}

export interface CalibrationSession {
    enabled: boolean;
    type: CalibrationType;
    measurements: CalibrationMeasurement[];
    baseline: CalibrationBaseline;
    adjustments: CalibrationAdjustment[];
    completed: boolean;
    accuracy: number;
}

export interface CalibrationMeasurement {
    metric: string;
    value: number;
    unit: string;
    target: number;
    tolerance: number;
    status: 'measuring' | 'complete' | 'failed';
    timestamp: Date;
}

export interface CalibrationBaseline {
    established: boolean;
    metrics: Record<string, number>;
    confidence: number;
    stability: number;
    lastUpdated: Date;
}

export interface CalibrationAdjustment {
    parameter: string;
    oldValue: number;
    newValue: number;
    reason: string;
    impact: 'low' | 'medium' | 'high';
    timestamp: Date;
}

export interface OrientationSession {
    enabled: boolean;
    type: OrientationType;
    content: OrientationContent;
    progress: OrientationProgress;
    completed: boolean;
    understanding: number;
}

export interface OrientationContent {
    sections: OrientationSection[];
    interactive: boolean;
    skippable: boolean;
    estimatedDuration: number;
}

export interface OrientationSection {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'video' | 'interactive' | 'demonstration';
    duration: number;
    required: boolean;
    completed: boolean;
}

export interface OrientationProgress {
    currentSection: number;
    totalSections: number;
    completedSections: string[];
    timeSpent: number;
    engagement: number;
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

export interface BriefingObjective {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    measurable: boolean;
    target?: number;
    unit?: string;
    timeframe?: number;
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
    noiseLevel: number;
    lighting: number;
    temperature: number;
    comfort: number;
    distractions: number;
}

export interface TimeContext {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: number;
    season: 'spring' | 'summer' | 'fall' | 'winter';
    timezone: string;
    availableTime: number;
    preferredDuration: number;
}

export interface SocialContext {
    alone: boolean;
    friendsOnline: number;
    activeRivalries: number;
    teamMembers: number;
    socialMood: 'energetic' | 'calm' | 'competitive' | 'collaborative';
}

export interface PerformanceContext {
    recentTrend: 'improving' | 'stable' | 'declining';
    averageScore: number;
    bestScore: number;
    consistency: number;
    fatigue: number;
    motivation: number;
}

export interface GoalContext {
    activeGoals: GoalInfo[];
    completedGoals: number;
    progressTowardsGoals: number;
    upcomingDeadlines: DeadlineInfo[];
}

export interface GoalInfo {
    id: string;
    title: string;
    progress: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeadlineInfo {
    goalId: string;
    title: string;
    deadline: Date;
    daysRemaining: number;
    progress: number;
}

export interface MoodContext {
    current: EmotionState;
    expected: EmotionState;
    factors: MoodFactor[];
    stability: number;
}

export interface EmotionState {
    primary: EmotionType;
    intensity: number;
    valence: number;
    arousal: number;
}

export interface MoodFactor {
    factor: string;
    impact: number;
    description: string;
    category: 'positive' | 'negative' | 'neutral';
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
    type: 'daily' | 'weekly' | 'monthly' | 'special';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    progress: number;
    deadline?: Date;
}

export interface BriefingStrategy {
    approach: StrategyApproach;
    tactics: StrategyTactic[];
    resources: StrategyResource[];
    contingencies: StrategyContingency[];
}

export interface StrategyTactic {
    id: string;
    name: string;
    description: string;
    适用条件: string[];
    expectedOutcome: string;
    riskLevel: 'low' | 'medium' | 'high';
}

export interface StrategyResource {
    type: 'tool' | 'skill' | 'knowledge' | 'support' | 'equipment';
    name: string;
    availability: boolean;
    effectiveness: number;
}

export interface StrategyContingency {
    scenario: string;
    trigger: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
}

export interface BriefingTip {
    id: string;
    category: TipCategory;
    content: string;
    relevance: number;
    personalized: boolean;
}

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
    quality: number;
    lastChecked?: Date;
}

export interface EquipmentStatus {
    ready: boolean;
    issues: EquipmentIssue[];
    setupTime: number;
    qualityScore: number;
}

export interface EquipmentIssue {
    item: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    solution?: string;
    resolved: boolean;
}

export interface EquipmentRecommendation {
    item: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: number;
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
    current: number;
    optimal: number;
    adjustable: boolean;
    type: 'natural' | 'artificial' | 'mixed';
    recommendations: string[];
}

export interface SoundSetup {
    noiseLevel: number;
    backgroundMusic: boolean;
    noiseCancellation: boolean;
    recommendations: string[];
}

export interface TemperatureSetup {
    current: number;
    optimal: number;
    adjustable: boolean;
    comfort: number;
}

export interface ComfortSetup {
    seating: ComfortLevel;
    posture: PostureCheck;
    ergonomics: ErgonomicAssessment;
    recommendations: string[];
}

export interface PostureCheck {
    current: PostureState;
    recommendations: string[];
    exercises: PostureExercise[];
}

export interface PostureExercise {
    name: string;
    duration: number;
    instructions: string[];
    frequency: string;
}

export interface ErgonomicAssessment {
    score: number;
    issues: ErgonomicIssue[];
    improvements: ErgonomicImprovement[];
}

export interface ErgonomicIssue {
    area: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    solution: string;
}

export interface ErgonomicImprovement {
    area: string;
    improvement: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
}

export interface DistractionManagement {
    currentLevel: number;
    sources: DistractionSource[];
    strategies: DistractionStrategy[];
    effectiveness: number;
}

export interface DistractionSource {
    type: 'digital' | 'physical' | 'social' | 'environmental';
    source: string;
    frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
    impact: number;
}

export interface DistractionStrategy {
    strategy: string;
    effectiveness: number;
    ease: number;
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

export interface DurationConfig {
    target: number;
    minimum: number;
    maximum: number;
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
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
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
    timeframe?: number;
    progress: GoalProgress;
    milestones: GoalMilestone[];
}

export interface GoalProgress {
    current: number;
    target: number;
    percentage: number;
    rate: number;
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
    energy: number;
    focus: number;
    motivation: number;
    confidence: number;
    stress: number;
    excitement: number;
}

export interface MoodAssessment {
    method: AssessmentMethod;
    accuracy: number;
    confidence: number;
    factors: MoodFactor[];
    recommendations: string[];
}

export interface MoodStrategy {
    strategy: string;
    type: StrategyType;
    effectiveness: number;
    duration: number;
    instructions: string[];
}

export interface MoodTracking {
    baseline: MoodState;
    current: MoodState;
    trend: 'improving' | 'stable' | 'declining';
    volatility: number;
    patterns: MoodPattern[];
}

export interface MoodPattern {
    pattern: string;
    frequency: number;
    impact: number;
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
    value: number;
    level: ReadinessLevel;
    confidence: number;
    lastUpdated: Date;
}

export interface ReadinessDimension {
    dimension: ReadinessDimensionType;
    score: number;
    weight: number;
    status: DimensionStatus;
    factors: string[];
}

export interface ReadinessFactor {
    factor: string;
    impact: number;
    category: ReadinessDimensionType;
    actionable: boolean;
    urgency: 'low' | 'medium' | 'high';
}

export interface ReadinessRecommendation {
    recommendation: string;
    priority: RecommendationPriority;
    effort: EffortLevel;
    timeframe: string;
    expectedImpact: number;
    type: RecommendationType;
}

export interface ReadinessClearance {
    cleared: boolean;
    level: ClearanceLevel;
    conditions: ClearanceCondition[];
    restrictions: ClearanceRestriction[];
    validUntil: Date;
}

export interface ClearanceCondition {
    condition: string;
    met: boolean;
    critical: boolean;
    description: string;
}

export interface ClearanceRestriction {
    restriction: string;
    reason: string;
    duration: number;
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
    depth: number;
    duration: number;
    quality: number;
    triggers: string[];
    barriers: string[];
}

export interface EngagementLevel {
    cognitive: number;
    emotional: number;
    behavioral: number;
    overall: number;
}

export interface ImmersionLevel {
    presence: number;
    absorption: number;
    flow: number;
    overall: number;
}

export interface SatisfactionLevel {
    immediate: number;
    anticipated: number;
    overall: number;
    factors: SatisfactionFactor[];
}

export interface SatisfactionFactor {
    factor: string;
    impact: number;
    description: string;
    category: 'positive' | 'negative';
}

export interface ExperienceFeedback {
    rating: number;
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

export interface ExperienceImprovement {
    area: string;
    current: number;
    target: number;
    gap: number;
    priority: 'low' | 'medium' | 'high';
    strategies: string[];
    resources: ImprovementResource[];
}

export interface ImprovementResource {
    type: 'tutorial' | 'tool' | 'setting' | 'feature' | 'exercise';
    name: string;
    description: string;
    availability: boolean;
    effectiveness: number;
}

export interface SessionStartEvent {
    type: 'session_initiated' | 'session_prepared' | 'session_ready' | 'session_started' | 'preparation_completed' | 'readiness_assessed';
    userId: string;
    sessionId: string;
    startId: string;
    data: Record<string, any>;
    timestamp: Date;
}
