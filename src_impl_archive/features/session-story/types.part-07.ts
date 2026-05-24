import type { ChapterSymbolism, ChapterTransition, MetaphorMapping, SymbolEvolution, ThemeDevelopment } from './types';

export interface EventCause {
  cause: string;
  type: CauseType;
  necessity: 'optional' | 'important' | 'critical' | 'essential';
  timing: number; // relative position
  visibility: 'explicit' | 'implicit' | 'hidden' | 'revealed';
}

export type CauseType = 'character_action' | 'external_force' | 'internal_conflict' | 'past_event' | 'fate' | 'chance' | 'symbolic' | 'thematic';

export interface EventEffect {
  effect: string;
  type: EffectType;
  immediacy: 'immediate' | 'delayed' | 'gradual' | 'cumulative';
  scope: EffectScope;
  permanence: number; // 0-100
}

export type EffectType = 'plot_advancement' | 'character_change' | 'emotional_impact' | 'theme_development' | 'symbolic_meaning' | 'setup' | 'payoff';

export type EffectScope = 'personal' | 'relational' | 'situational' | 'narrative' | 'thematic' | 'universal';

export interface EventSymbolism {
  symbols: EventSymbol[];
  metaphors: EventMetaphor[];
  archetypes: EventArchetype[];
  meaning: string;
}

export interface EventSymbol {
  symbol: string;
  meaning: string;
  context: string;
  evolution: SymbolEvolution;
}

export interface EventMetaphor {
  metaphor: string;
  mapping: MetaphorMapping[];
  insight: string;
  power: number; // 0-100
}

export interface EventArchetype {
  archetype: string;
  manifestation: string;
  significance: number; // 0-100
  universality: number; // 0-100
}

export interface AlternativeEvent {
  event: string;
  probability: number; // 0-100
  consequences: string[];
  thematic_impact: number; // 0-100
  character_impact: number; // 0-100
  narrative_impact: number; // 0-100
}

export interface StoryChapter {
  id: string;
  title: string;
  number: number;
  type: ChapterType;
  purpose: ChapterPurpose;
  events: string[]; // event IDs
  characters: string[]; // character IDs
  setting: ChapterSetting;
  mood: ChapterMood;
  theme: ChapterTheme;
  symbolism: ChapterSymbolism;
  transitions: ChapterTransition[];
}

export type ChapterType = 'exposition' | 'rising_action' | 'climax' | 'falling_action' | 'resolution' | 'epilogue' | 'prologue' | 'interlude' | 'flashback' | 'flash_forward';

export interface ChapterPurpose {
  primary: string;
  secondary: string[];
  plot_function: PlotFunction;
  character_function: CharacterFunction;
  theme_function: ThemeFunction;
}

export type PlotFunction = 'setup' | 'complication' | 'confrontation' | 'resolution' | 'transition' | 'revelation' | 'foreshadowing';

export type CharacterFunction = 'introduction' | 'development' | 'transformation' | 'relationship' | 'conflict' | 'resolution';

export type ThemeFunction = 'introduction' | 'exploration' | 'complication' | 'reinforcement' | 'challenge' | 'resolution';

export interface ChapterSetting {
  location: string;
  time: string;
  atmosphere: string;
  significance: SettingSignificance;
  symbolism: SettingSymbolism;
}

export interface SettingSignificance {
  narrative: number; // 0-100
  character: number; // 0-100
  theme: number; // 0-100
  mood: number; // 0-100
}

export interface SettingSymbolism {
  symbols: SettingSymbol[];
  metaphors: SettingMetaphor[];
  meaning: string;
}

export interface SettingSymbol {
  element: string;
  meaning: string;
  context: string;
  evolution: string;
}

export interface SettingMetaphor {
  metaphor: string;
  mapping: MetaphorMapping[];
  insight: string;
}

export interface ChapterMood {
  primary: MoodType;
  secondary?: MoodType;
  intensity: number; // 0-100
  progression: MoodProgression;
  consistency: number; // 0-100
}

export type MoodType = 'hopeful' | 'tense' | 'somber' | 'joyful' | 'mysterious' | 'romantic' | 'melancholy' | 'exciting' | 'contemplative' | 'ominous';

export interface MoodProgression {
  start: number; // 0-100
  end: number; // 0-100
  pattern: ProgressionPattern;
  triggers: string[];
}

export type ProgressionPattern = 'stable' | 'rising' | 'falling' | 'oscillating' | 'crescendo' | 'diminuendo';

export interface ChapterTheme {
  primary: string;
  secondary: string[];
  development: ThemeDevelopment;
  reinforcement: ThemeReinforcement[];
  complexity: number; // 0-100
}

export interface ThemeReinforcement {
  method: ReinforcementMethod;
  timing: number; // relative position
  effectiveness: number; // 0-100
}

export type ReinforcementMethod = 'dialogue' | 'action' | 'symbolism' | 'setting' | 'character' | 'narrative' | 'metaphor';

