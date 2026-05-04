/**
 * Neuroplasticity Feature Events
 * 
 * Event definitions for brain training, cognitive enhancement, and neural adaptation features.
 */

import { NeuroplasticityEvent } from './types';

// Base Event Interface
export interface BaseNeuroplasticityEvent {
  id: string;
  userId: string;
  sessionId?: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata: EventMetadata;
}

export interface EventMetadata {
  source: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  sessionId?: string;
  correlationId?: string;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
}

// Exercise Events
export interface ExerciseStartedEvent extends BaseNeuroplasticityEvent {
  type: 'exercise_started';
  data: {
    exerciseId: string;
    exerciseType: string;
    difficulty: string;
    targetRegions: string[];
    cognitiveDomains: string[];
  };
}

export interface ExerciseCompletedEvent extends BaseNeuroplasticityEvent {
  type: 'exercise_completed';
  data: {
    exerciseId: string;
    performance: {
      accuracy: number;
      speed: number;
      efficiency: number;
      improvement: number;
      cognitiveLoad: number;
    };
    duration: number;
    adaptations: string[];
    moodState: {
      energy: number;
      focus: number;
      stress: number;
      motivation: number;
      confidence: number;
    };
  };
}

export interface ExerciseSkippedEvent extends BaseNeuroplasticityEvent {
  type: 'exercise_skipped';
  data: {
    exerciseId: string;
    reason: 'difficulty' | 'time' | 'interest' | 'technical' | 'user_choice';
    skippedAt: number; // percentage through exercise
  };
}

// Session Events
export interface NeuroplasticitySessionStartedEvent extends BaseNeuroplasticityEvent {
  type: 'neuroplasticity_session_started';
  data: {
    sessionId: string;
    exercises: string[];
    goals: string[];
    environment: {
      noiseLevel: number;
      lighting: number;
      temperature: number;
      distractions: number;
      comfort: number;
    };
    initialMood: {
      energy: number;
      focus: number;
      stress: number;
      motivation: number;
      confidence: number;
    };
  };
}

export interface NeuroplasticitySessionCompletedEvent extends BaseNeuroplasticityEvent {
  type: 'neuroplasticity_session_completed';
  data: {
    sessionId: string;
    duration: number;
    exercisesCompleted: number;
    totalExercises: number;
    overallPerformance: {
      accuracy: number;
      speed: number;
      efficiency: number;
      improvement: number;
    };
    adaptations: {
      type: string;
      region: string;
      strength: number;
      duration: number;
    }[];
    moodChange: {
      before: number;
      after: number;
      improvement: number;
    };
  };
}

// Adaptation Events
export interface NeuralAdaptationOccurredEvent extends BaseNeuroplasticityEvent {
  type: 'neural_adaptation_occurred';
  data: {
    adaptationId: string;
    type: 'strengthening' | 'weakening' | 'rewiring' | 'new_connection';
    region: string;
    strength: number;
    duration: number;
    trigger: string;
    exerciseId?: string;
    cognitiveDomain: string;
  };
}

export interface AdaptationMilestoneReachedEvent extends BaseNeuroplasticityEvent {
  type: 'adaptation_milestone_reached';
  data: {
    milestoneId: string;
    adaptationType: string;
    region: string;
    currentLevel: number;
    targetLevel: number;
    progress: number;
    unlockedFeatures: string[];
  };
}

// Progress Events
export interface CognitiveDomainImprovedEvent extends BaseNeuroplasticityEvent {
  type: 'cognitive_domain_improved';
  data: {
    domain: string;
    previousLevel: number;
    currentLevel: number;
    improvement: number;
    targetLevel: number;
    exercisesCompleted: number;
    timeSpent: number;
    nextMilestone: {
      level: number;
      estimatedTime: number;
      requiredExercises: number;
    };
  };
}

export interface BrainRegionStrengthenedEvent extends BaseNeuroplasticityEvent {
  type: 'brain_region_strengthened';
  data: {
    region: string;
    previousConnectivity: number;
    currentConnectivity: number;
    previousPlasticity: number;
    currentPlasticity: number;
    improvement: number;
    contributingExercises: string[];
  };
}

// Training Plan Events
export interface TrainingPlanCreatedEvent extends BaseNeuroplasticityEvent {
  type: 'training_plan_created';
  data: {
    planId: string;
    name: string;
    goals: {
      domain: string;
      targetLevel: number;
      deadline: Date;
      priority: string;
    }[];
    schedule: {
      frequency: number;
      duration: number;
      preferredTimes: string[];
      restDays: number[];
    };
    estimatedDuration: number;
    difficulty: string;
  };
}

export interface TrainingPlanUpdatedEvent extends BaseNeuroplasticityEvent {
  type: 'training_plan_updated';
  data: {
    planId: string;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
      reason: string;
    }[];
    updatedBy: 'user' | 'system' | 'coach';
  };
}

export interface TrainingPlanCompletedEvent extends BaseNeuroplasticityEvent {
  type: 'training_plan_completed';
  data: {
    planId: string;
    originalGoals: string[];
    achievedGoals: string[];
    partialGoals: string[];
    missedGoals: string[];
    totalDuration: number;
    actualDuration: number;
    overallImprovement: number;
    nextRecommendations: string[];
  };
}

// Challenge Events
export interface ChallengeStartedEvent extends BaseNeuroplasticityEvent {
  type: 'challenge_started';
  data: {
    challengeId: string;
    name: string;
    type: 'daily' | 'weekly' | 'monthly';
    difficulty: string;
    exercises: string[];
    requirements: string[];
    rewards: {
      type: string;
      amount: number;
      name: string;
    }[];
    startDate: Date;
    endDate: Date;
  };
}

export interface ChallengeCompletedEvent extends BaseNeuroplasticityEvent {
  type: 'challenge_completed';
  data: {
    challengeId: string;
    completionTime: Date;
    score: number;
    rank?: number;
    totalParticipants: number;
    rewardsEarned: {
      type: string;
      amount: number;
      name: string;
    }[];
    achievements: string[];
  };
}

// Achievement Events
export interface AchievementUnlockedEvent extends BaseNeuroplasticityEvent {
  type: 'achievement_unlocked';
  data: {
    achievementId: string;
    name: string;
    description: string;
    category: string;
    rarity: string;
    points: number;
    progress: {
      current: number;
      total: number;
      percentage: number;
    };
    unlockedAt: Date;
    firstTime: boolean;
    shareable: boolean;
  };
}

export interface AchievementProgressUpdatedEvent extends BaseNeuroplasticityEvent {
  type: 'achievement_progress_updated';
  data: {
    achievementId: string;
    previousProgress: number;
    currentProgress: number;
    totalRequired: number;
    percentage: number;
    contributingAction: string;
    nextMilestone?: {
      milestone: number;
      required: number;
      reward: string;
    };
  };
}

// Streak Events
export interface StreakExtendedEvent extends BaseNeuroplasticityEvent {
  type: 'streak_extended';
  data: {
    streakType: 'daily' | 'weekly' | 'exercise' | 'challenge';
    currentStreak: number;
    previousStreak: number;
    streakStartDate: Date;
    lastActivityDate: Date;
    nextMilestone: {
      streak: number;
      reward: string;
    };
  };
}

export interface StreakLostEvent extends BaseNeuroplasticityEvent {
  type: 'streak_lost';
  data: {
    streakType: 'daily' | 'weekly' | 'exercise' | 'challenge';
    finalStreak: number;
    streakStartDate: Date;
    lastActivityDate: Date;
    daysMissed: number;
    recoveryOptions: string[];
  };
}

export interface StreakRecoveredEvent extends BaseNeuroplasticityEvent {
  type: 'streak_recovered';
  data: {
    streakType: 'daily' | 'weekly' | 'exercise' | 'challenge';
    recoveredStreak: number;
    daysSinceLoss: number;
    recoveryBonus: boolean;
    encouragementMessage: string;
  };
}

// Assessment Events
export interface CognitiveAssessmentCompletedEvent extends BaseNeuroplasticityEvent {
  type: 'cognitive_assessment_completed';
  data: {
    assessmentId: string;
    assessmentType: 'baseline' | 'progress' | 'comprehensive';
    domains: {
      domain: string;
      score: number;
      level: string;
      improvement: number;
    }[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextAssessmentDate: Date;
  completedAt: Date;
  };
}

export interface BrainImagingDataReceivedEvent extends BaseNeuroplasticityEvent {
  type: 'brain_imaging_data_received';
  data: {
    imagingId: string;
    type: 'fmri' | 'eeg' | 'pet' | 'spect';
    timestamp: Date;
    regions: {
      region: string;
      activity: number;
      connectivity: number;
      quality: number;
    }[];
    quality: number;
    interpretation: string;
    adaptations: string[];
  };
}

// Settings Events
export interface NeuroplasticitySettingsUpdatedEvent extends BaseNeuroplasticityEvent {
  type: 'neuroplasticity_settings_updated';
  data: {
    settings: {
      preferences: {
        exerciseTypes: string[];
        sessionDuration: number;
        preferredTimes: string[];
        musicPreference: string;
        visualTheme: string;
      };
      notifications: {
        sessionReminders: boolean;
        progressUpdates: boolean;
        challengeAlerts: boolean;
        frequency: string;
      };
      difficulty: {
        adaptiveMode: boolean;
        baseDifficulty: string;
        adjustmentRate: number;
        frustrationThreshold: number;
      };
      accessibility: {
        fontSize: string;
        colorBlindMode: string;
        highContrast: boolean;
        reducedMotion: boolean;
      };
    };
    updatedFields: string[];
  };
}

// Error Events
export interface NeuroplasticityErrorEvent extends BaseNeuroplasticityEvent {
  type: 'neuroplasticity_error';
  data: {
    errorType: 'exercise_error' | 'session_error' | 'adaptation_error' | 'system_error';
    errorCode: string;
    errorMessage: string;
    context: {
      exerciseId?: string;
      sessionId?: string;
      step?: string;
      action?: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    recoverable: boolean;
    userImpact: string;
  };
}

// Engagement Events
export interface NeuroplasticityEngagementEvent extends BaseNeuroplasticityEvent {
  type: 'neuroplasticity_engagement';
  data: {
    engagementType: 'feature_used' | 'content_viewed' | 'interaction' | 'feedback';
    feature: string;
    action: string;
    duration?: number;
    value?: any;
    context?: string;
  };
}

export interface NeuroplasticityFeedbackEvent extends BaseNeuroplasticityEvent {
  type: 'neuroplasticity_feedback';
  data: {
    feedbackType: 'exercise_rating' | 'session_feedback' | 'bug_report' | 'suggestion';
    rating?: number;
    comment?: string;
    category?: string;
    context?: {
      exerciseId?: string;
      sessionId?: string;
      feature?: string;
    };
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

// Union Type for All Neuroplasticity Events
export type NeuroplasticityEventType = 
  | ExerciseStartedEvent
  | ExerciseCompletedEvent
  | ExerciseSkippedEvent
  | NeuroplasticitySessionStartedEvent
  | NeuroplasticitySessionCompletedEvent
  | NeuralAdaptationOccurredEvent
  | AdaptationMilestoneReachedEvent
  | CognitiveDomainImprovedEvent
  | BrainRegionStrengthenedEvent
  | TrainingPlanCreatedEvent
  | TrainingPlanUpdatedEvent
  | TrainingPlanCompletedEvent
  | ChallengeStartedEvent
  | ChallengeCompletedEvent
  | AchievementUnlockedEvent
  | AchievementProgressUpdatedEvent
  | StreakExtendedEvent
  | StreakLostEvent
  | StreakRecoveredEvent
  | CognitiveAssessmentCompletedEvent
  | BrainImagingDataReceivedEvent
  | NeuroplasticitySettingsUpdatedEvent
  | NeuroplasticityErrorEvent
  | NeuroplasticityEngagementEvent
  | NeuroplasticityFeedbackEvent;

// Event Factory Functions
export function createExerciseStartedEvent(
  userId: string,
  exerciseId: string,
  exerciseType: string,
  difficulty: string,
  targetRegions: string[],
  cognitiveDomains: string[]
): ExerciseStartedEvent {
  return {
    id: generateEventId(),
    type: 'exercise_started',
    userId,
    timestamp: new Date(),
    data: {
      exerciseId,
      exerciseType,
      difficulty,
      targetRegions,
      cognitiveDomains,
    },
    metadata: createEventMetadata('neuroplasticity'),
  };
}

export function createExerciseCompletedEvent(
  userId: string,
  exerciseId: string,
  performance: any,
  duration: number,
  adaptations: any[],
  moodState: any
): ExerciseCompletedEvent {
  return {
    id: generateEventId(),
    type: 'exercise_completed',
    userId,
    timestamp: new Date(),
    data: {
      exerciseId,
      performance,
      duration,
      adaptations,
      moodState,
    },
    metadata: createEventMetadata('neuroplasticity'),
  };
}

export function createNeuralAdaptationOccurredEvent(
  userId: string,
  adaptationId: string,
  type: string,
  region: string,
  strength: number,
  duration: number,
  trigger: string,
  exerciseId?: string,
  cognitiveDomain?: string
): NeuralAdaptationOccurredEvent {
  return {
    id: generateEventId(),
    type: 'neural_adaptation_occurred',
    userId,
    timestamp: new Date(),
    data: {
      adaptationId,
      type,
      region,
      strength,
      duration,
      trigger,
      exerciseId,
      cognitiveDomain,
    },
    metadata: createEventMetadata('neuroplasticity'),
  };
}

export function createAchievementUnlockedEvent(
  userId: string,
  achievementId: string,
  name: string,
  description: string,
  category: string,
  rarity: string,
  points: number,
  progress: any
): AchievementUnlockedEvent {
  return {
    id: generateEventId(),
    type: 'achievement_unlocked',
    userId,
    timestamp: new Date(),
    data: {
      achievementId,
      name,
      description,
      category,
      rarity,
      points,
      progress,
      unlockedAt: new Date(),
      firstTime: true,
      shareable: true,
    },
    metadata: createEventMetadata('neuroplasticity'),
  };
}

export function createStreakExtendedEvent(
  userId: string,
  streakType: string,
  currentStreak: number,
  previousStreak: number,
  streakStartDate: Date,
  lastActivityDate: Date
): StreakExtendedEvent {
  return {
    id: generateEventId(),
    type: 'streak_extended',
    userId,
    timestamp: new Date(),
    data: {
      streakType,
      currentStreak,
      previousStreak,
      streakStartDate,
      lastActivityDate,
      nextMilestone: calculateNextMilestone(currentStreak),
    },
    metadata: createEventMetadata('neuroplasticity'),
  };
}

// Helper Functions
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEventMetadata(source: string): EventMetadata {
  return {
    source,
    version: '1.0.0',
    platform: getPlatform(),
  };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  // Add platform detection logic here
  return 'unknown';
}

function calculateNextMilestone(currentStreak: number): { streak: number; reward: string } {
  const milestones = [
    { streak: 3, reward: 'Bronze Streak Badge' },
    { streak: 7, reward: 'Silver Streak Badge' },
    { streak: 14, reward: 'Gold Streak Badge' },
    { streak: 30, reward: 'Platinum Streak Badge' },
    { streak: 60, reward: 'Diamond Streak Badge' },
    { streak: 100, reward: 'Master Streak Badge' },
  ];

  for (const milestone of milestones) {
    if (currentStreak < milestone.streak) {
      return milestone;
    }
  }

  return { streak: currentStreak + 30, reward: 'Legendary Streak Badge' };
}

// Event Validation
export function validateNeuroplasticityEvent(event: NeuroplasticityEventType): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'exercise_started':
      return validateExerciseStartedEvent(event as ExerciseStartedEvent);
    case 'exercise_completed':
      return validateExerciseCompletedEvent(event as ExerciseCompletedEvent);
    case 'achievement_unlocked':
      return validateAchievementUnlockedEvent(event as AchievementUnlockedEvent);
    default:
      return true;
  }
}

function validateExerciseStartedEvent(event: ExerciseStartedEvent): boolean {
  const { data } = event;
  return !!(
    data.exerciseId &&
    data.exerciseType &&
    data.difficulty &&
    data.targetRegions &&
    data.cognitiveDomains
  );
}

function validateExerciseCompletedEvent(event: ExerciseCompletedEvent): boolean {
  const { data } = event;
  return !!(
    data.exerciseId &&
    data.performance &&
    typeof data.duration === 'number' &&
    data.adaptations &&
    data.moodState
  );
}

function validateAchievementUnlockedEvent(event: AchievementUnlockedEvent): boolean {
  const { data } = event;
  return !!(
    data.achievementId &&
    data.name &&
    data.description &&
    data.category &&
    data.rarity &&
    typeof data.points === 'number' &&
    data.progress
  );
}

// Event Serialization
export function serializeNeuroplasticityEvent(event: NeuroplasticityEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeNeuroplasticityEvent(data: string): NeuroplasticityEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}
