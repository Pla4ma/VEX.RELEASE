import type { AudienceType, CreationChallenge, InspirationSource, RevisionHistory } from './types';

export interface FlowQuality {
  smoothness: number; // 0-100
  continuity: number; // 0-100
  transitions: number; // 0-100
  coherence: number; // 0-100
}

export interface ToneStyle {
  primary: ToneType;
  secondary: ToneType[];
  consistency: number; // 0-100
  appropriateness: number; // 0-100
  effectiveness: number; // 0-100
}

export type ToneType = 'serious' | 'humorous' | 'ironic' | 'satirical' | 'romantic' | 'melancholy' | 'optimistic' | 'pessimistic' | 'mysterious' | 'dramatic';

export interface AuthorialVoice {
  presence: VoicePresence;
  personality: VoicePersonality;
  consistency: number; // 0-100
  distinctiveness: number; // 0-100
  authenticity: number; // 0-100
}

export type VoicePresence = 'invisible' | 'subtle' | 'moderate' | 'distinct' | 'prominent' | 'dominant';

export interface VoicePersonality {
  traits: VoiceTrait[];
  attitude: VoiceAttitude;
  worldview: VoiceWorldview;
  values: VoiceValue[];
}

export interface VoiceTrait {
  trait: string;
  intensity: number; // 0-100
  expression: string;
}

export type VoiceAttitude = 'objective' | 'subjective' | 'empathetic' | 'critical' | 'celebratory' | 'skeptical' | 'curious';

export interface VoiceWorldview {
  perspective: string;
  philosophy: string;
  optimism: number; // 0-100
  complexity: number; // 0-100
}

export interface VoiceValue {
  value: string;
  importance: number; // 0-100
  expression: string;
}

export interface AudienceProfile {
  primary: AudienceType;
  secondary: AudienceType[];
  age: AgeRange;
  interests: string[];
  expectations: AudienceExpectation[];
  sensitivities: AudienceSensitivity[];
}

export interface AgeRange {
  min: number;
  max: number;
  preferred: number;
}

export interface AudienceExpectation {
  expectation: string;
  category: ExpectationCategory;
  importance: number; // 0-100
  satisfaction_method: string;
}

export type ExpectationCategory = 'genre' | 'character' | 'plot' | 'theme' | 'style' | 'emotional' | 'intellectual';

export interface AudienceSensitivity {
  sensitivity: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  handling: HandlingApproach;
  consideration: number; // 0-100
}

export type HandlingApproach = 'avoidance' | 'subtle' | 'respectful' | 'educational' | 'confrontational' | 'therapeutic';

export interface StoryPurpose {
  primary: PurposeType;
  secondary: PurposeType[];
  message: string;
  impact: PurposeImpact;
  authenticity: number; // 0-100
}

export type PurposeType = 'entertainment' | 'education' | 'inspiration' | 'persuasion' | 'exploration' | 'healing' | 'preservation' | 'innovation';

export interface PurposeImpact {
  intended: string[];
  potential: string[];
  measurement: ImpactMeasurement;
}

export interface ImpactMeasurement {
  metrics: string[];
  methods: MeasurementMethod[];
  indicators: string[];
}

export type MeasurementMethod = 'emotional_response' | 'behavioral_change' | 'knowledge_retention' | 'perspective_shift' | 'social_discourse' | 'cultural_influence';

export interface CreationMetadata {
  author: AuthorInfo;
  timeline: CreationTimeline;
  process: CreationProcess;
  challenges: CreationChallenge[];
  inspiration: InspirationSource[];
  revision: RevisionHistory;
}

export interface AuthorInfo {
  name: string;
  background: string;
  expertise: string[];
  perspective: string;
  connection: number; // 0-100 to material
}

export interface CreationTimeline {
  conception: Date;
  development: Date;
  drafting: Date;
  revision: Date;
  completion: Date;
  duration: number; // in days
}

export interface CreationProcess {
  approach: CreationApproach;
  methods: CreationMethod[];
  tools: CreationTool[];
  environment: CreationEnvironment;
}

export type CreationApproach = 'planned' | 'discovery' | 'hybrid' | 'collaborative' | 'experimental';

export type CreationMethod = 'outlining' | 'free_writing' | 'research' | 'character_development' | 'world_building' | 'revision';

export interface CreationTool {
  tool: string;
  type: ToolType;
  usage: string;
  effectiveness: number; // 0-100
}

export type ToolType = 'software' | 'reference' | 'organizational' | 'creative' | 'analytical';

export interface CreationEnvironment {
  location: string;
  atmosphere: string;
  routine: string;
  conditions: string[];
}

