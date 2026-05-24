import type { AudienceProfile, AuthorialVoice, CreationMetadata, FlowQuality, ImpactScope, PacingVariation, StoryGenre, StoryPurpose, StoryTheme, SymbolEvolution, SymbolType, ToneStyle } from './types';

export interface WorldImpact {
  changes: string[];
  permanence: number; // 0-100
  scope: ImpactScope;
  significance: number; // 0-100
}

export interface AudienceImpact {
  emotional: number; // 0-100
  intellectual: number; // 0-100
  inspirational: number; // 0-100
  memorable: number; // 0-100
}

export interface NarrativeImpact {
  structure: string;
  innovation: number; // 0-100
  influence: number; // 0-100
  precedent: string;
}

export interface OutcomeLegacy {
  immediate: string[];
  long_term: string[];
  lessons: string[];
  questions: string[];
  inspiration: string[];
}

export interface StoryMetadata {
  genre: StoryGenre;
  themes: StoryTheme[];
  motifs: StoryMotif[];
  symbols: StorySymbol[];
  influences: StoryInfluence[];
  style: StoryStyle;
  audience: AudienceProfile;
  purpose: StoryPurpose;
  creation: CreationMetadata;
}

export interface StoryMotif {
  motif: string;
  type: MotifType;
  frequency: number;
  significance: number; // 0-100
  evolution: MotifEvolution;
}

export type MotifType = 'visual' | 'auditory' | 'behavioral' | 'dialogue' | 'symbolic' | 'structural' | 'thematic';

export interface MotifEvolution {
  introduction: number; // story position
  development: number[]; // story positions
  climax: number; // story position
  resolution: number; // story position
  transformation: string;
}

export interface StorySymbol {
  symbol: string;
  meaning: string;
  type: SymbolType;
  context: string;
  evolution: SymbolEvolution;
}

export interface StoryInfluence {
  source: string;
  type: InfluenceType;
  integration: string;
  significance: number; // 0-100
  originality: number; // 0-100
}

export type InfluenceType = 'literary' | 'mythological' | 'historical' | 'cultural' | 'philosophical' | 'artistic' | 'personal';

export interface StoryStyle {
  narrative: NarrativeStyle;
  dialogue: DialogueStyle;
  description: DescriptionStyle;
  pacing: PacingStyle;
  tone: ToneStyle;
  voice: AuthorialVoice;
}

export interface NarrativeStyle {
  perspective: NarrativePerspective;
  tense: NarrativeTense;
  reliability: ReliabilityLevel;
  distance: NarrativeDistance;
  technique: NarrativeTechnique[];
}

export type NarrativePerspective = 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient' | 'multiple' | 'unreliable';

export type NarrativeTense = 'past' | 'present' | 'future' | 'mixed';

export type ReliabilityLevel = 'reliable' | 'somewhat_reliable' | 'questionable' | 'unreliable' | 'deceptive';

export type NarrativeDistance = 'intimate' | 'close' | 'moderate' | 'distant' | 'detached';

export type NarrativeTechnique = 'stream_of_consciousness' | 'flashback' | 'foreshadowing' | 'nonlinear' | 'epistolary' | 'fragmentary' | 'experimental';

export interface DialogueStyle {
  realism: number; // 0-100
  naturalness: number; // 0-100
  character_voice: number; // 0-100
  exposition: number; // 0-100
  subtext: number; // 0-100
  rhythm: DialogueRhythm;
}

export type DialogueRhythm = 'rapid' | 'measured' | 'leisurely' | 'staccato' | 'flowing' | 'interrupted';

export interface DescriptionStyle {
  detail: DetailLevel;
  imagery: ImageryType;
  sensory: SensoryFocus;
  metaphor: MetaphorUsage;
  efficiency: number; // 0-100
}

export type DetailLevel = 'minimal' | 'selective' | 'moderate' | 'detailed' | 'extensive';

export type ImageryType = 'visual' | 'auditory' | 'tactile' | 'olfactory' | 'gustatory' | 'kinesthetic' | 'synesthetic';

export interface SensoryFocus {
  visual: number; // 0-100
  auditory: number; // 0-100
  tactile: number; // 0-100
  olfactory: number; // 0-100
  gustatory: number; // 0-100
  kinesthetic: number; // 0-100
}

export interface MetaphorUsage {
  frequency: number; // 0-100
  complexity: number; // 0-100
  originality: number; // 0-100
  effectiveness: number; // 0-100
}

export interface PacingStyle {
  speed: PacingSpeed;
  variation: PacingVariation;
  tension: TensionManagement;
  flow: FlowQuality;
}

export type PacingSpeed = 'slow' | 'moderate' | 'fast' | 'variable' | 'dynamic';

export interface TensionManagement {
  building: number; // 0-100
  releasing: number; // 0-100
  sustaining: number; // 0-100
  timing: number; // 0-100
}

