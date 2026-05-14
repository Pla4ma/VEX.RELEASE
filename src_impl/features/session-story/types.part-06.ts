import type { AlternativeEvent, EventCause, EventEffect, EventSymbolism } from './types';

export interface DevelopmentChallenge {
  challenge: string;
  type: ChallengeType;
  difficulty: number; // 0-100
  timing: number; // story position
  resolution: string;
  learning: string;
}

export type ChallengeType = 'internal' | 'external' | 'interpersonal' | 'existential' | 'moral' | 'skill_based';

export interface DevelopmentLearning {
  lesson: string;
  source: LearningSource;
  application: string;
  retention: number; // 0-100
  transfer: number; // 0-100
}

export type LearningSource = 'experience' | 'teaching' | 'observation' | 'reflection' | 'failure' | 'success' | 'relationship';

export interface DevelopmentMastery {
  skills: MasteredSkill[];
  wisdom: MasteredWisdom[];
  integration: MasteredIntegration[];
  legacy: string;
}

export interface MasteredSkill {
  skill: string;
  level: number; // 0-100
  application: string;
  teaching: boolean;
  innovation: boolean;
}

export interface MasteredWisdom {
  wisdom: string;
  source: string;
  application: string[];
  sharing: string[];
}

export interface MasteredIntegration {
  integration: string;
  components: string[];
  synthesis: string;
  expression: string;
}

export interface CharacterSymbolism {
  symbols: CharacterSymbol[];
  archetypes: SymbolicArchetype[];
  metaphors: CharacterMetaphor[];
  themes: SymbolicTheme[];
  meaning: SymbolicMeaning;
}

export interface CharacterSymbol {
  symbol: string;
  type: SymbolType;
  meaning: string;
  evolution: SymbolEvolution;
  significance: number; // 0-100
}

export type SymbolType = 'object' | 'action' | 'quality' | 'relationship' | 'journey' | 'transformation' | 'sacrifice' | 'rebirth';

export interface SymbolEvolution {
  stages: SymbolStage[];
  catalyst: string;
  permanence: number; // 0-100
  universality: number; // 0-100
}

export interface SymbolStage {
  stage: string;
  meaning: string;
  timing: number; // story position
  context: string;
}

export interface SymbolicArchetype {
  archetype: string;
  expression: string;
  universality: number; // 0-100
  cultural: string[];
  personal: number; // 0-100
}

export interface CharacterMetaphor {
  metaphor: string;
  domain: string;
  mapping: MetaphorMapping[];
  insight: string;
  power: number; // 0-100
}

export interface MetaphorMapping {
  source: string;
  target: string;
  correspondence: string;
  novelty: number; // 0-100
}

export interface SymbolicTheme {
  theme: string;
  expression: string;
  development: ThemeDevelopment;
  resolution: ThemeResolution;
}

export interface ThemeDevelopment {
  introduction: number; // story position
  exploration: number[]; // story positions
  complication: number[]; // story positions
  climax: number; // story position
  resolution: number; // story position
}

export interface ThemeResolution {
  outcome: string;
  clarity: number; // 0-100
  satisfaction: number; // 0-100
  universality: number; // 0-100
}

export interface SymbolicMeaning {
  personal: string;
  universal: string;
  cultural: string[];
  narrative: string;
  integration: string;
}

export interface StoryEvent {
  id: string;
  type: EventType;
  timing: number; // relative position
  duration: number; // relative weight
  significance: EventSignificance;
  description: string;
  participants: string[]; // character IDs
  causes: EventCause[];
  effects: EventEffect[];
  symbolism: EventSymbolism;
  alternatives: AlternativeEvent[];
}

export type EventType = 'action' | 'dialogue' | 'revelation' | 'decision' | 'consequence' | 'transformation' | 'conflict' | 'resolution' | 'symbolic' | 'catalyst';

export interface EventSignificance {
  plot: number; // 0-100
  character: number; // 0-100
  theme: number; // 0-100
  emotional: number; // 0-100
  symbolic: number; // 0-100
}

