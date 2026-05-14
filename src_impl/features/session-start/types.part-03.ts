import type { DistractionManagement, ErgonomicImprovement } from './types';

export interface ChallengeInfo {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  progress: number; // 0-100
  deadline?: Date;
}

export interface BriefingStrategy {
  approach: StrategyApproach;
  tactics: StrategyTactic[];
  resources: StrategyResource[];
  contingencies: StrategyContingency[];
}

export type StrategyApproach = 'conservative' | 'balanced' | 'aggressive' | 'adaptive' | 'experimental' | 'optimized';

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
  effectiveness: number; // 0-100
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
  relevance: number; // 0-100
  personalized: boolean;
}

export type TipCategory = 'performance' | 'strategy' | 'mindset' | 'technical' | 'social' | 'health' | 'environment';

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

export type EquipmentType = 'hardware' | 'software' | 'peripheral' | 'furniture' | 'environmental' | 'accessory';

export interface EquipmentStatus {
  ready: boolean;
  issues: EquipmentIssue[];
  setupTime: number; // in seconds
  qualityScore: number; // 0-100
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
  estimatedImpact: number; // 0-100
  cost?: number;
}

export interface LightingSetup {
  current: number; // 0-100
  optimal: number; // 0-100
  adjustable: boolean;
  type: 'natural' | 'artificial' | 'mixed';
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

export type ComfortLevel = 'poor' | 'fair' | 'good' | 'excellent';

export interface PostureCheck {
  current: PostureState;
  recommendations: string[];
  exercises: PostureExercise[];
}

export type PostureState = 'excellent' | 'good' | 'fair' | 'poor' | 'needs_improvement';

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
  severity: 'low' | 'medium' | 'high';
  description: string;
  solution: string;
}
