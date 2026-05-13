/**
 * Session Completion Feature Types
 *
 * Types for session completion tracking, rewards, and post-session experiences.
 */
export interface SessionCompletion {
    id: string;
    sessionId: string;
    userId: string;
    completionType: CompletionType;
    status: CompletionStatus;
    startedAt: Date;
    completedAt: Date;
    duration: number;
    performance: SessionPerformance;
    rewards: CompletionReward[];
    achievements: AchievementUnlock[];
    progress: ProgressUpdate[];
    experience: CompletionExperience;
    shareable: ShareableContent;
    analytics: CompletionAnalytics;
}

export interface SessionPerformance {
    overall: PerformanceScore;
    categories: CategoryPerformance[];
    metrics: PerformanceMetric[];
    comparisons: PerformanceComparison[];
    highlights: PerformanceHighlight[];
    improvements: ImprovementArea[];
}

export interface PerformanceScore {
    value: number;
    grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    rank: number;
    percentile: number;
    change: number;
    significance: 'low' | 'medium' | 'high';
}

export interface CategoryPerformance {
    category: PerformanceCategory;
    score: number;
    grade: string;
    weight: number;
    trend: 'improving' | 'stable' | 'declining';
    details: CategoryDetails;
}

export interface CategoryDetails {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    recommendations: string[];
    nextSteps: string[];
}

export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    target: number;
    achieved: boolean;
    change: number;
    significance: 'low' | 'medium' | 'high';
    context: string;
}

export interface PerformanceComparison {
    type: ComparisonType;
    target: ComparisonTarget;
    score: number;
    targetScore: number;
    difference: number;
    percentile: number;
    interpretation: string;
}

export interface PerformanceHighlight {
    type: HighlightType;
    title: string;
    description: string;
    value: number;
    significance: 'low' | 'medium' | 'high' | 'legendary';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    shareable: boolean;
}

export interface ImprovementArea {
    area: string;
    currentLevel: number;
    targetLevel: number;
    gap: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    resources: LearningResource[];
    estimatedTime: number;
}

export interface LearningResource {
    type: 'tutorial' | 'video' | 'article' | 'exercise' | 'course' | 'book';
    title: string;
    description: string;
    url?: string;
    duration?: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    rating: number;
    relevance: number;
}

export interface CompletionReward {
    id: string;
    type: RewardType;
    amount: number;
    source: RewardSource;
    condition: RewardCondition;
    claimed: boolean;
    claimedAt?: Date;
    expiresAt?: Date;
    metadata: RewardMetadata;
}

export interface RewardCondition {
    type: 'score' | 'time' | 'accuracy' | 'streak' | 'achievement' | 'custom';
    operator: 'greater_than' | 'less_than' | 'equals' | 'reaches';
    value: number;
    description: string;
}

export interface RewardMetadata {
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    category: string;
    icon?: string;
    color?: string;
    animation?: string;
    sound?: string;
    description: string;
    lore?: string;
}

export interface AchievementUnlock {
    id: string;
    achievementId: string;
    name: string;
    description: string;
    category: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    progress: AchievementProgress;
    unlockedAt: Date;
    firstTime: boolean;
    shareable: boolean;
}

export interface AchievementProgress {
    current: number;
    total: number;
    percentage: number;
    completed: boolean;
    nextMilestone?: MilestoneProgress;
}

export interface MilestoneProgress {
    milestone: number;
    required: number;
    current: number;
    percentage: number;
    reward?: string;
}

export interface ProgressUpdate {
    type: ProgressType;
    area: string;
    previous: number;
    current: number;
    change: number;
    percentage: number;
    significance: 'low' | 'medium' | 'high';
    context: string;
}

export interface CompletionExperience {
    flow: FlowExperience;
    satisfaction: SatisfactionScore;
    engagement: EngagementMetrics;
    motivation: MotivationState;
    emotions: EmotionalState;
    feedback: UserFeedback;
}

export interface FlowExperience {
    achieved: boolean;
    duration: number;
    intensity: number;
    quality: number;
    triggers: string[];
    barriers: string[];
    factors: FlowFactor[];
}

export interface FlowFactor {
    factor: string;
    impact: number;
    description: string;
    category: 'positive' | 'negative' | 'neutral';
}

export interface SatisfactionScore {
    overall: number;
    components: SatisfactionComponent[];
    trend: 'improving' | 'stable' | 'declining';
    drivers: SatisfactionDriver[];
}

export interface SatisfactionComponent {
    aspect: 'challenge' | 'skill' | 'control' | 'goals' | 'feedback' | 'immersion';
    score: number;
    weight: number;
    importance: number;
}

export interface SatisfactionDriver {
    driver: string;
    impact: number;
    description: string;
    actionable: boolean;
}

export interface EngagementMetrics {
    attention: number;
    interest: number;
    involvement: number;
    enthusiasm: number;
    focus: number;
    persistence: number;
    quality: number;
}

export interface MotivationState {
    intrinsic: number;
    extrinsic: number;
    competence: number;
    autonomy: number;
    relatedness: number;
    mastery: number;
    purpose: number;
}

export interface EmotionalState {
    primary: Emotion;
    secondary?: Emotion;
    intensity: number;
    valence: number;
    arousal: number;
    stability: number;
}

export interface Emotion {
    type: EmotionType;
    confidence: number;
    triggers: string[];
    duration: number;
}

export interface UserFeedback {
    rating: number;
    difficulty: number;
    enjoyment: number;
    comments?: string;
    suggestions?: string[];
    bugs?: string[];
    wouldRecommend: boolean;
    wouldPlayAgain: boolean;
}

export interface ShareableContent {
    type: ShareableType;
    title: string;
    description: string;
    image?: string;
    data: ShareableData;
    platforms: SocialPlatform[];
    template: ShareableTemplate;
    customizations: ShareableCustomization[];
}

export interface ShareableData {
    score: number;
    rank: number;
    achievement?: string;
    milestone?: string;
    streak?: number;
    time?: string;
    difficulty?: string;
    highlights: string[];
}

export interface ShareableTemplate {
    id: string;
    name: string;
    layout: TemplateLayout;
    style: TemplateStyle;
    text: TemplateText;
    branding: TemplateBranding;
}

export interface TemplateStyle {
    theme: 'light' | 'dark' | 'colorful' | 'minimal' | 'bold';
    colors: ColorScheme;
    fonts: FontScheme;
    animations: AnimationScheme;
}

export interface ColorScheme {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export interface FontScheme {
    heading: string;
    body: string;
    accent: string;
}

export interface AnimationScheme {
    enabled: boolean;
    type: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
    duration: number;
}

export interface TemplateText {
    title: string;
    subtitle?: string;
    body?: string;
    callToAction?: string;
    hashtags?: string[];
}

export interface TemplateBranding {
    logo?: string;
    watermark?: boolean;
    attribution?: boolean;
    customMessage?: string;
}

export interface ShareableCustomization {
    field: string;
    type: 'text' | 'color' | 'image' | 'layout';
    options: CustomizationOption[];
    selected?: unknown;
}

export interface CustomizationOption {
    value: unknown;
    label: string;
    preview?: string;
}

export interface CompletionAnalytics {
    userId: string;
    sessionId: string;
    completionId: string;
    metrics: CompletionMetrics;
    trends: CompletionTrends;
    insights: CompletionInsight[];
    predictions: CompletionPrediction[];
    benchmarks: CompletionBenchmark[];
}

export interface CompletionMetrics {
    completionRate: number;
    averageScore: number;
    averageTime: number;
    satisfactionScore: number;
    engagementScore: number;
    retentionRate: number;
    churnRisk: number;
    lifetimeValue: number;
    sessionCount: number;
    totalPlaytime: number;
}

export interface CompletionTrends {
    performance: TrendData[];
    satisfaction: TrendData[];
    engagement: TrendData[];
    retention: TrendData[];
    improvement: TrendData[];
}

export interface TrendData {
    date: Date;
    value: number;
    change: number;
    significance: 'low' | 'medium' | 'high';
    prediction?: number;
}

export interface CompletionInsight {
    type: InsightType;
    title: string;
    description: string;
    significance: 'low' | 'medium' | 'high';
    confidence: number;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
    recommendations: string[];
    evidence: EvidenceData[];
}

export interface EvidenceData {
    type: 'metric' | 'event' | 'behavior' | 'feedback';
    value: unknown;
    timestamp: Date;
    context: string;
}

export interface CompletionPrediction {
    type: PredictionType;
    prediction: unknown;
    confidence: number;
    timeframe: string;
    factors: PredictionFactor[];
    actions: PredictionAction[];
}

export interface PredictionFactor {
    factor: string;
    impact: number;
    weight: number;
    description: string;
}

export interface PredictionAction {
    action: string;
    expectedImpact: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    resources: string[];
}

export interface CompletionBenchmark {
    type: BenchmarkType;
    category: string;
    userScore: number;
    benchmarkScore: number;
    percentile: number;
    rank: number;
    totalParticipants: number;
    comparison: BenchmarkComparison;
}

export interface BenchmarkComparison {
    difference: number;
    significance: 'low' | 'medium' | 'high';
    interpretation: string;
    improvement: ImprovementPotential;
}

export interface ImprovementPotential {
    potential: number;
    timeframe: string;
    effort: 'low' | 'medium' | 'high';
    strategies: string[];
    resources: LearningResource[];
}

export interface CompletionSettings {
    userId: string;
    preferences: CompletionPreferences;
    notifications: CompletionNotifications;
    privacy: CompletionPrivacy;
    accessibility: CompletionAccessibility;
    automation: CompletionAutomation;
}

export interface CompletionPreferences {
    showDetailedResults: boolean;
    autoShareAchievements: boolean;
    celebrationEffects: boolean;
    soundEffects: boolean;
    vibration: boolean;
    screenEffects: boolean;
    resultDuration: number;
    skipDelay: boolean;
}

export interface CompletionNotifications {
    achievements: boolean;
    milestones: boolean;
    rankUps: boolean;
    unlocks: boolean;
    streaks: boolean;
    summaries: boolean;
    reminders: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface CompletionPrivacy {
    shareResults: boolean;
    shareAchievements: boolean;
    shareProgress: boolean;
    shareAnalytics: boolean;
    publicProfile: boolean;
    leaderboards: boolean;
    socialFeatures: boolean;
    dataRetention: number;
}

export interface CompletionAccessibility {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    subtitles: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    simplifiedUI: boolean;
}

export interface CompletionAutomation {
    autoClaimRewards: boolean;
    autoShareMilestones: boolean;
    autoScheduleNextSession: boolean;
    autoAdjustDifficulty: boolean;
    autoGenerateInsights: boolean;
    autoSendReminders: boolean;
    smartRecommendations: boolean;
}

export interface CompletionEvent {
    type: 'session_completed' | 'achievement_unlocked' | 'reward_claimed' | 'progress_updated' | 'milestone_reached' | 'rank_up' | 'streak_extended';
    userId: string;
    sessionId: string;
    completionId: string;
    data: Record<string, unknown>;
    timestamp: Date;
}
