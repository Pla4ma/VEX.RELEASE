/**
 * Neuroplasticity Feature Types
 * 
 * Types for brain training, cognitive enhancement, and neural adaptation features.
 */

export interface NeuroplasticityExercise {
  id: string;
  name: string;
  type: 'memory' | 'attention' | 'problem-solving' | 'language' | 'visual-spatial';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number; // in minutes
  description: string;
  instructions: string[];
  targetRegions: BrainRegion[];
  cognitiveDomains: CognitiveDomain[];
  adaptations: NeuralAdaptation[];
}

export interface BrainRegion {
  id: string;
  name: string;
  function: string;
  connectivity: number; // 0-1
  plasticity: number; // 0-1
}

export interface CognitiveDomain {
  id: string;
  name: string;
  description: string;
  currentLevel: number; // 0-100
  potentialLevel: number; // 0-100
  improvementRate: number; // percentage per session
}

export interface NeuralAdaptation {
  id: string;
  type: 'strengthening' | 'weakening' | 'rewiring' | 'new-connection';
  region: string;
  strength: number; // 0-1
  duration: number; // in hours
  requirements: string[];
}

export interface NeuroplasticitySession {
  id: string;
  userId: string;
  exercises: NeuroplasticityExercise[];
  startTime: Date;
  endTime: Date;
  performance: SessionPerformance;
  adaptations: NeuralAdaptation[];
  mood: MoodState;
  environment: EnvironmentFactors;
}

export interface SessionPerformance {
  accuracy: number; // 0-100
  speed: number; // 0-100
  efficiency: number; // 0-100
  improvement: number; // percentage change
  cognitiveLoad: number; // 0-100
}

export interface MoodState {
  energy: number; // 0-100
  focus: number; // 0-100
  stress: number; // 0-100
  motivation: number; // 0-100
  confidence: number; // 0-100
}

export interface EnvironmentFactors {
  noiseLevel: number; // 0-100
  lighting: number; // 0-100
  temperature: number; // 0-100
  distractions: number; // 0-100
  comfort: number; // 0-100
}

export interface NeuroplasticityProgress {
  userId: string;
  overallProgress: number; // 0-100
  domainProgress: Record<string, number>;
  regionAdaptations: Record<string, NeuralAdaptation[]>;
  streakDays: number;
  totalSessions: number;
  averagePerformance: SessionPerformance;
  lastSession: Date;
  nextRecommendedSession: Date;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  goals: TrainingGoal[];
  schedule: TrainingSchedule;
  exercises: NeuroplasticityExercise[];
  duration: number; // in weeks
  intensity: 'low' | 'medium' | 'high';
  adaptation: boolean;
}

export interface TrainingGoal {
  id: string;
  domain: CognitiveDomain;
  targetLevel: number; // 0-100
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  targetLevel: number;
  deadline: Date;
  achieved: boolean;
  achievedDate?: Date;
}

export interface TrainingSchedule {
  frequency: number; // sessions per week
  duration: number; // minutes per session
  preferredTimes: string[]; // time of day preferences
  restDays: number[];
  adaptive: boolean;
}

export interface NeuroplasticityChallenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  exercises: NeuroplasticityExercise[];
  requirements: string[];
  rewards: ChallengeReward[];
  leaderboard: LeaderboardEntry[];
  startDate: Date;
  endDate: Date;
}

export interface ChallengeReward {
  id: string;
  type: 'badge' | 'points' | 'unlock' | 'feature';
  name: string;
  description: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  change: number; // rank change
  avatar?: string;
}

export interface BrainImagingData {
  id: string;
  userId: string;
  type: 'fmri' | 'eeg' | 'pet' | 'spect';
  timestamp: Date;
  regions: BrainRegion[];
  activity: Record<string, number>; // region activity levels
  connectivity: Record<string, number>; // region connectivity matrix
  quality: number; // 0-100
  interpretation: string;
}

export interface CognitiveAssessment {
  id: string;
  userId: string;
  type: 'baseline' | 'progress' | 'comprehensive';
  domains: CognitiveDomain[];
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextAssessment: Date;
  completedAt: Date;
}

export interface NeuroplasticitySettings {
  userId: string;
  preferences: UserPreferences;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  difficulty: DifficultySettings;
  accessibility: AccessibilitySettings;
}

export interface UserPreferences {
  exerciseTypes: string[];
  sessionDuration: number;
  preferredTimes: string[];
  musicPreference: 'none' | 'classical' | 'ambient' | 'nature' | 'custom';
  visualTheme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  researchParticipation: boolean;
  leaderboards: boolean;
  socialFeatures: boolean;
}

export interface NotificationSettings {
  sessionReminders: boolean;
  progressUpdates: boolean;
  challengeAlerts: boolean;
  socialNotifications: boolean;
  researchUpdates: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface DifficultySettings {
  adaptiveMode: boolean;
  baseDifficulty: 'easy' | 'medium' | 'hard';
  adjustmentRate: number; // 0-100
  frustrationThreshold: number; // 0-100
  masteryThreshold: number; // 0-100
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  subtitles: boolean;
}

// Event Types
export interface NeuroplasticityEvent {
  type: 'session_started' | 'session_completed' | 'exercise_completed' | 'adaptation_occurred' | 'goal_achieved' | 'challenge_completed';
  userId: string;
  sessionId?: string;
  exerciseId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

// Analytics Types
export interface NeuroplasticityAnalytics {
  userId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    totalSessions: number;
    averagePerformance: SessionPerformance;
    improvementRate: number;
    adaptationRate: number;
    streakDays: number;
    goalProgress: number;
  };
  trends: {
    performance: TrendData[];
    adaptations: TrendData[];
    cognitiveDomains: Record<string, TrendData[]>;
  };
  insights: string[];
  recommendations: string[];
}

export interface TrendData {
  date: Date;
  value: number;
  change: number;
  significance: 'low' | 'medium' | 'high';
}
