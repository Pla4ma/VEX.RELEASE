export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
}

export interface EventMetadata {
  source: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  correlationId?: string;
}

export interface BaseSessionStartEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata: EventMetadata;
}

export interface SessionInitiatedEvent extends BaseSessionStartEvent {
  type: 'session_initiated';
  data: {
    initiationType: 'manual' | 'auto' | 'scheduled' | 'triggered';
    initiatedAt: Date;
    trigger: {
      source: string;
      context: string;
      parameters: Record<string, unknown>;
    };
    intent: {
      primary: string;
      secondary: string[];
      goals: string[];
      expectations: string[];
    };
    context: {
      previousSession?: string;
      timeSinceLastSession: number;
      currentStreak: number;
      userState: string;
    };
  };
}

export interface SessionPreparationStartedEvent extends BaseSessionStartEvent {
  type: 'session_preparation_started';
  data: {
    preparationType: 'standard' | 'quick' | 'comprehensive' | 'custom';
    preparationSteps: Array<{
      step: string;
      required: boolean;
      estimatedDuration: number;
      dependencies: string[];
    }>;
    environment: {
      setupRequired: string[];
      checks: string[];
      optimizations: string[];
    };
    user: {
      readiness: number;
      mood: string;
      energy: number;
      focus: number;
      motivation: number;
    };
  };
}

export interface SessionPreparationCompletedEvent extends BaseSessionStartEvent {
  type: 'session_preparation_completed';
  data: {
    completedAt: Date;
    duration: number;
    stepsCompleted: string[];
    stepsSkipped: string[];
    stepsFailed: string[];
    finalReadiness: {
      score: number;
      factors: Record<string, number>;
      recommendations: string[];
    };
    environment: {
      optimized: boolean;
      issues: string[];
      adjustments: string[];
    };
  };
}

export interface SessionConfigurationSetEvent extends BaseSessionStartEvent {
  type: 'session_configuration_set';
  data: {
    configurationType:
      | 'difficulty'
      | 'duration'
      | 'objectives'
      | 'environment'
      | 'accessibility';
    configuration: {
      settings: Record<string, unknown>;
      constraints: Record<string, unknown>;
      preferences: Record<string, unknown>;
    };
    validation: {
      valid: boolean;
      errors: string[];
      warnings: string[];
      suggestions: string[];
    };
    personalization: {
      adapted: boolean;
      adaptations: string[];
      confidence: number;
    };
  };
}
