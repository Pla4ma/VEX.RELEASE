import type { AudienceImpact, NarrativeImpact, OutcomeLegacy, SymbolType, TransitionMethod, WorldImpact } from './types';

export interface ChapterSymbolism {
  symbols: ChapterSymbol[];
  archetypes: ChapterArchetype[];
  patterns: SymbolicPattern[];
  meaning: ChapterMeaning;
}

export interface ChapterSymbol {
  symbol: string;
  type: SymbolType;
  meaning: string;
  context: string;
  integration: string;
}

export interface ChapterArchetype {
  archetype: string;
  manifestation: string;
  significance: number; // 0-100
  evolution: string;
}

export interface SymbolicPattern {
  pattern: string;
  elements: string[];
  meaning: string;
  recurrence: number;
}

export interface ChapterMeaning {
  literal: string;
  metaphorical: string;
  symbolic: string;
  thematic: string;
  universal: string;
}

export interface ChapterTransition {
  type: TransitionType;
  method: TransitionMethod;
  destination: string;
  purpose: TransitionPurpose;
  effectiveness: number; // 0-100
}

export type TransitionType = 'temporal' | 'spatial' | 'perspective' | 'thematic' | 'emotional' | 'narrative';

export type TransitionPurpose = 'continuation' | 'contrast' | 'connection' | 'revelation' | 'setup' | 'resolution';

export interface StoryChoice {
  id: string;
  timing: number; // relative position
  type: ChoiceType;
  options: ChoiceOption[];
  consequences: ChoiceConsequence[];
  significance: ChoiceSignificance;
  context: ChoiceContext;
  resolution: ChoiceResolution;
}

export type ChoiceType = 'moral' | 'strategic' | 'emotional' | 'practical' | 'existential' | 'relational' | 'sacrificial' | 'transformative';

export interface ChoiceOption {
  id: string;
  description: string;
  motivation: string;
  difficulty: number; // 0-100
  risk: number; // 0-100
  reward: number; // 0-100
  alignment: number; // 0-100 with character
  appeal: number; // 0-100 to audience
}

export interface ChoiceConsequence {
  option: string;
  immediate: string[];
  short_term: string[];
  long_term: string[];
  character_impact: number; // 0-100
  plot_impact: number; // 0-100
  theme_impact: number; // 0-100
}

export interface ChoiceSignificance {
  character: number; // 0-100
  plot: number; // 0-100
  theme: number; // 0-100
  narrative: number; // 0-100
  emotional: number; // 0-100
}

export interface ChoiceContext {
  situation: string;
  stakes: string;
  constraints: string[];
  influences: string[];
  timing: string;
}

export interface ChoiceResolution {
  made: boolean;
  option?: string;
  timing: number; // relative position
  method: ResolutionMethod;
  satisfaction: number; // 0-100
  regret: number; // 0-100
}

export type ResolutionMethod = 'deliberate' | 'instinctive' | 'forced' | 'accidental' | 'deferred' | 'collective';

export interface StoryOutcome {
  type: OutcomeType;
  resolution: OutcomeResolution;
  satisfaction: OutcomeSatisfaction;
  meaning: OutcomeMeaning;
  impact: OutcomeImpact;
  legacy: OutcomeLegacy;
}

export type OutcomeType = 'triumph' | 'tragedy' | 'bittersweet' | 'ambiguous' | 'transformative' | 'cyclical' | 'transcendent' | 'poetic';

export interface OutcomeResolution {
  plot: string;
  character: string;
  theme: string;
  emotional: string;
  symbolic: string;
}

export interface OutcomeSatisfaction {
  narrative: number; // 0-100
  emotional: number; // 0-100
  intellectual: number; // 0-100
  thematic: number; // 0-100
  overall: number; // 0-100
}

export interface OutcomeMeaning {
  personal: string;
  universal: string;
  cultural: string[];
  symbolic: string;
  philosophical: string;
}

export interface OutcomeImpact {
  characters: CharacterImpact[];
  world: WorldImpact;
  audience: AudienceImpact;
  narrative: NarrativeImpact;
}

export interface CharacterImpact {
  character: string;
  impact: string;
  permanence: number; // 0-100
  significance: number; // 0-100
}

