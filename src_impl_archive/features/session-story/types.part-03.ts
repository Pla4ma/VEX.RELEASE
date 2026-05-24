import type { MotivationEvolution } from './types';

export type InstitutionType = 'formal' | 'informal' | 'military' | 'religious' | 'trade' | 'artistic' | 'specialized';

export interface TimePeriod {
  start: Date;
  end?: Date;
  duration: number; // in years
}

export interface InstitutionalExperience {
  positive: string[];
  negative: string[];
  neutral: string[];
  transformative: string[];
}

export interface AcademicAchievement {
  achievement: string;
  significance: 'minor' | 'major' | 'transformative';
  recognition: string[];
  impact: string;
}

export interface AcademicStruggle {
  struggle: string;
  severity: 'minor' | 'major' | 'significant';
  resolution: string;
  growth: string;
}

export interface LifeExperience {
  experience: string;
  type: ExperienceType;
  period: TimePeriod;
  impact: ExperienceImpact;
  lessons: string[];
}

export type ExperienceType = 'travel' | 'career' | 'relationship' | 'crisis' | 'adventure' | 'loss' | 'discovery' | 'achievement' | 'failure' | 'transformation';

export interface ExperienceImpact {
  personal: number; // 0-100
  professional: number; // 0-100
  emotional: number; // 0-100
  philosophical: number; // 0-100
}

export interface PastTrauma {
  trauma: string;
  type: TraumaType;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  processing: ProcessingStage;
  effects: TraumaEffect[];
  coping: CopingMechanism[];
}

export type TraumaType = 'physical' | 'emotional' | 'psychological' | 'existential' | 'social' | 'moral' | 'spiritual';

export type ProcessingStage = 'denial' | 'anger' | 'bargaining' | 'depression' | 'acceptance' | 'integration' | 'transformation';

export interface TraumaEffect {
  effect: string;
  area: EffectArea;
  severity: number; // 0-100
  duration: DurationType;
}

export type EffectArea = 'behavior' | 'emotion' | 'cognition' | 'relationships' | 'worldview' | 'physical';

export type DurationType = 'temporary' | 'persistent' | 'chronic' | 'episodic' | 'delayed';

export interface CopingMechanism {
  mechanism: string;
  type: CopingType;
  effectiveness: number; // 0-100
  healthy: boolean;
  development: CopingDevelopment;
}

export type CopingType = 'avoidance' | 'confrontation' | 'seeking_support' | 'self_medication' | 'spiritual' | 'creative' | 'intellectual' | 'physical';

export type CopingDevelopment = 'innate' | 'learned' | 'adapted' | 'abandoned' | 'replaced';

export interface PastTriumph {
  triumph: string;
  type: TriumphType;
  significance: 'personal' | 'public' | 'historical';
  impact: TriumphImpact;
  legacy: string;
}

export type TriumphType = 'personal' | 'professional' | 'creative' | 'athletic' | 'intellectual' | 'moral' | 'social' | 'survival';

export interface TriumphImpact {
  confidence: number; // 0-100
  reputation: number; // 0-100
  opportunity: number; // 0-100
  perspective: number; // 0-100
}

export interface CharacterSecret {
  secret: string;
  type: SecretType;
  severity: 'minor' | 'major' | 'critical' | 'existential';
  known_by: string[];
  consequences: string[];
  revelation: RevelationCondition;
}

export type SecretType = 'shameful' | 'dangerous' | 'embarrassing' | 'protective' | 'identity' | 'ability' | 'relationship' | 'history';

export interface RevelationCondition {
  trigger: string;
  timing: RevelationTiming;
  impact: RevelationImpact;
  necessity: RevelationNecessity;
}

export type RevelationTiming = 'early' | 'mid_story' | 'climax' | 'resolution' | 'epilogue' | 'never';

export type RevelationImpact = 'minor' | 'significant' | 'transformative' | 'catastrophic' | 'redemptive';

export type RevelationNecessity = 'optional' | 'helpful' | 'important' | 'critical' | 'essential';

export interface CharacterMotivation {
  primary: PrimaryMotivation;
  secondary: SecondaryMotivation[];
  hidden: HiddenMotivation[];
  conflicting: ConflictingMotivation[];
  evolution: MotivationEvolution;
}

export interface PrimaryMotivation {
  motivation: string;
  source: MotivationSource;
  strength: number; // 0-100
  clarity: number; // 0-100
  accessibility: number; // 0-100
}

export type MotivationSource = 'intrinsic' | 'extrinsic' | 'existential' | 'relational' | 'situational' | 'historical' | 'mystical';

export interface SecondaryMotivation {
  motivation: string;
  priority: number; // 1-10
  compatibility: number; // 0-100 with primary
  influence: number; // 0-100
}

export interface HiddenMotivation {
  motivation: string;
  awareness: 'unconscious' | 'subconscious' | 'suppressed' | 'denied';
  strength: number; // 0-100
  manifestation: string[];
}

export interface ConflictingMotivation {
  motivation: string;
  conflict: string;
  tension: number; // 0-100
  resolution: ConflictResolution;
}

export type ConflictResolution = 'prioritized' | 'compromised' | 'integrated' | 'transcended' | 'unresolved';

