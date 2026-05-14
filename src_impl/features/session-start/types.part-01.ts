/**
 * Session Start Feature Types
 *
 * Types for session initialization, preparation, and startup experiences.
 */
import type { BriefingSession, ComfortSetup, DistractionManagement, EquipmentCheck, LightingSetup, OrientationContent, OrientationProgress, ReadinessAssessment, SessionConfiguration, SessionContext, SessionGoal, SessionMood, SoundSetup, StartExperience, TemperatureSetup } from './types';

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
  lighting: LightingSetup;
  sound: SoundSetup;
  temperature: TemperatureSetup;
  comfort: ComfortSetup;
  distractions: DistractionManagement;
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

export type StartType = 'manual' | 'scheduled' | 'auto' | 'quick_start' | 'tutorial' | 'challenge' | 'social' | 'guided';

export type StartStatus = 'initializing' | 'preparing' | 'ready' | 'starting' | 'started' | 'failed' | 'cancelled';

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

export type WarmupType = 'mental' | 'physical' | 'technical' | 'creative' | 'social' | 'comprehensive';

export interface WarmupExercise {
  id: string;
  name: string;
  type: 'breathing' | 'stretching' | 'focus' | 'visualization' | 'reaction' | 'memory';
  duration: number; // in seconds
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
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

export type SetupStepType = 'account_check' | 'equipment_setup' | 'environment_check' | 'profile_configuration' | 'goal_setting' | 'privacy_settings' | 'notification_preferences' | 'accessibility_options';

export interface CalibrationSession {
  enabled: boolean;
  type: CalibrationType;
  measurements: CalibrationMeasurement[];
  baseline: CalibrationBaseline;
  adjustments: CalibrationAdjustment[];
  completed: boolean;
  accuracy: number; // 0-100
}

export type CalibrationType = 'input' | 'output' | 'biometric' | 'environmental' | 'performance' | 'comprehensive';

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
  confidence: number; // 0-100
  stability: number; // 0-100
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
  understanding: number; // 0-100
}

export type OrientationType = 'tutorial' | 'overview' | 'controls' | 'objectives' | 'interface' | 'features';
