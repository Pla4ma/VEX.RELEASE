import type { CommunicationStyle, ConflictResolutionStyle, DevelopmentChallenge, DevelopmentLearning, DevelopmentMastery, GrowthDirection } from './types';

export interface CommunicationPattern {
  style: CommunicationStyle;
  frequency: FrequencyLevel;
  honesty: number; // 0-100
  vulnerability: number; // 0-100
  understanding: number; // 0-100
}

export type FrequencyLevel = 'constant' | 'daily' | 'weekly' | 'occasional' | 'rare' | 'seasonal';

export interface ConflictPattern {
  frequency: FrequencyLevel;
  intensity: number; // 0-100
  resolution: ConflictResolutionStyle;
  impact: number; // 0-100
  learning: number; // 0-100
}

export interface SupportPattern {
  type: SupportType;
  availability: number; // 0-100
  effectiveness: number; // 0-100
  reciprocity: number; // 0-100
  conditions: string[];
}

export type SupportType = 'emotional' | 'practical' | 'informational' | 'spiritual' | 'financial' | 'protective';

export interface GrowthPattern {
  direction: GrowthDirection;
  rate: number; // 0-100
  catalysts: string[];
  obstacles: string[];
  potential: number; // 0-100
}

export interface RelationshipHistory {
  origin: RelationshipOrigin;
  milestones: RelationshipMilestone[];
  crises: RelationshipCrisis[];
  triumphs: RelationshipTriumph[];
  changes: RelationshipChange[];
}

export interface RelationshipOrigin {
  circumstances: string;
  timing: number; // story position
  first_impression: string;
  initial_dynamic: string;
  significance: string;
}

export interface RelationshipMilestone {
  milestone: string;
  timing: number; // story position
  significance: 'minor' | 'major' | 'critical' | 'transformative';
  impact: string;
  memory: string;
}

export interface RelationshipCrisis {
  crisis: string;
  timing: number; // story position
  cause: string;
  resolution: string;
  impact: number; // 0-100
  learning: string;
}

export interface RelationshipTriumph {
  triumph: string;
  timing: number; // story position
  nature: string;
  impact: number; // 0-100
  bonding: number; // 0-100
}

export interface RelationshipChange {
  from: string;
  to: string;
  timing: number; // story position
  cause: string;
  permanence: number; // 0-100
}

export interface RelationshipEvolution {
  trajectory: EvolutionTrajectory;
  stages: EvolutionStage[];
  influences: EvolutionInfluence[];
  potential: EvolutionPotential;
}

export interface EvolutionTrajectory {
  direction: 'improving' | 'declining' | 'cyclical' | 'transformative' | 'static';
  pace: number; // 0-100
  stability: number; // 0-100
  predictability: number; // 0-100
}

export interface EvolutionStage {
  stage: string;
  characteristics: string[];
  duration: number; // relative
  challenges: string[];
  growth: string[];
}

export interface EvolutionInfluence {
  influence: string;
  source: InfluenceSource;
  impact: number; // 0-100
  timing: number; // story position
}

export type InfluenceSource = 'internal' | 'external' | 'mutual' | 'situational' | 'third_party' | 'societal';

export interface EvolutionPotential {
  possibilities: string[];
  limitations: string[];
  requirements: string[];
  timeline: string;
  probability: number; // 0-100
}

export interface RelationshipSignificance {
  narrative: number; // 0-100
  character: number; // 0-100
  thematic: number; // 0-100
  symbolic: number; // 0-100
  emotional: number; // 0-100
}

export interface CharacterDevelopment {
  dimensions: DevelopmentDimension[];
  growth: DevelopmentGrowth;
  challenges: DevelopmentChallenge[];
  learning: DevelopmentLearning[];
  mastery: DevelopmentMastery;
}

export interface DevelopmentDimension {
  dimension: DevelopmentType;
  current_level: number; // 0-100
  potential: number; // 0-100
  growth_rate: number; // 0-100
  obstacles: string[];
  opportunities: string[];
}

export type DevelopmentType = 'emotional' | 'intellectual' | 'moral' | 'social' | 'spiritual' | 'physical' | 'creative' | 'leadership';

export interface DevelopmentGrowth {
  overall: number; // 0-100
  by_dimension: Record<DevelopmentType, number>;
  acceleration: number; // 0-100
  sustainability: number; // 0-100
  authenticity: number; // 0-100
}

