/**
 * Session Story Feature Types
 *
 * Types for narrative generation, storytelling, and session chronicles.
 */
import type { ResolutionType, StoryChapter, StoryCharacter, StoryChoice, StoryEvent, StoryMetadata, StoryMoral, StoryOutcome, TensionBuilding } from './types';

export interface SessionStory {
  id: string;
  sessionId: string;
  userId: string;
  title: string;
  genre: StoryGenre;
  theme: StoryTheme;
  narrative: NarrativeStructure;
  characters: StoryCharacter[];
  events: StoryEvent[];
  chapters: StoryChapter[];
  choices: StoryChoice[];
  outcomes: StoryOutcome;
  metadata: StoryMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export type StoryGenre = 'adventure' | 'mystery' | 'fantasy' | 'sci_fi' | 'horror' | 'romance' | 'comedy' | 'drama' | 'thriller' | 'epic' | 'coming_of_age' | 'hero_journey';

export type StoryTheme = 'growth' | 'courage' | 'wisdom' | 'perseverance' | 'friendship' | 'discovery' | 'transformation' | 'redemption' | 'leadership' | 'innovation' | 'mastery' | 'legacy';

export interface NarrativeStructure {
  type: NarrativeType;
  acts: NarrativeAct[];
  pacing: PacingProfile;
  tension: TensionCurve;
  resolution: ResolutionType;
  moral: StoryMoral;
}

export type NarrativeType = 'linear' | 'non_linear' | 'branching' | 'circular' | 'episodic' | 'fragmented' | 'interactive';

export interface NarrativeAct {
  id: string;
  name: string;
  type: ActType;
  position: number;
  duration: number; // relative weight
  purpose: string;
  events: string[]; // event IDs
  climax: boolean;
  resolution: boolean;
}

export type ActType = 'exposition' | 'rising_action' | 'climax' | 'falling_action' | 'resolution' | 'epilogue';

export interface PacingProfile {
  rhythm: PacingRhythm;
  variation: PacingVariation;
  intensity: IntensityProfile;
  beats: StoryBeat[];
}

export type PacingRhythm = 'steady' | 'accelerating' | 'decelerating' | 'variable' | 'staccato' | 'legato';

export interface PacingVariation {
  frequency: number; // 0-100
  amplitude: number; // 0-100
  pattern: VariationPattern;
}

export type VariationPattern = 'regular' | 'irregular' | 'crescendo' | 'diminuendo' | 'wave' | 'spike';

export interface IntensityProfile {
  baseline: number; // 0-100
  peaks: IntensityPeak[];
  valleys: IntensityValley[];
  transitions: IntensityTransition[];
}

export interface IntensityPeak {
  timestamp: number; // relative position
  intensity: number; // 0-100
  duration: number; // relative
  cause: string;
  significance: 'minor' | 'major' | 'climactic';
}

export interface IntensityValley {
  timestamp: number; // relative position
  intensity: number; // 0-100
  duration: number; // relative
  purpose: string;
  recovery: number; // 0-100
}

export interface IntensityTransition {
  from: number; // 0-100
  to: number; // 0-100
  timing: number; // relative position
  method: TransitionMethod;
  duration: number; // relative
}

export type TransitionMethod = 'gradual' | 'abrupt' | 'crescendo' | 'fade' | 'jump_cut' | 'cross_fade';

export interface StoryBeat {
  id: string;
  type: BeatType;
  timing: number; // relative position
  description: string;
  significance: 'minor' | 'major' | 'critical';
  emotional: EmotionalBeat;
  impact: number; // 0-100
}

export type BeatType = 'inciting_incident' | 'plot_point' | 'revelation' | 'conflict' | 'resolution' | 'character_moment' | 'theme_moment' | 'symbolic_moment' | 'turning_point';

export interface EmotionalBeat {
  primary: EmotionType;
  secondary?: EmotionType;
  intensity: number; // 0-100
  duration: number; // relative
  target_audience: AudienceType;
}

export type EmotionType = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'anticipation' | 'trust' | 'love' | 'hope' | 'despair' | 'courage' | 'wonder' | 'nostalgia' | 'triumph';

export type AudienceType = 'character' | 'reader' | 'both' | 'neither';

export type ImpactScope = 'personal' | 'relational' | 'situational' | 'narrative' | 'thematic' | 'universal';

export interface TensionCurve {
  points: TensionPoint[];
  arc: TensionArc;
  release: TensionRelease[];
  building: TensionBuilding[];
}

export interface TensionPoint {
  timestamp: number; // relative position
  tension: number; // 0-100
  type: TensionType;
  source: string;
  resolution?: number; // timestamp
}

export type TensionType = 'conflict' | 'mystery' | 'suspense' | 'dramatic_irony' | 'anticipation' | 'moral_dilemma' | 'time_pressure' | 'resource_constraint' | 'emotional_stakes';

export interface TensionArc {
  shape: ArcShape;
  peak: number; // timestamp
  plateau: number; // duration
  descent: number; // duration
}

export type ArcShape = 'linear' | 'exponential' | 'logarithmic' | 'bell_curve' | 'sawtooth' | 'plateau' | 'irregular';

export interface TensionRelease {
  timestamp: number; // relative position
  type: ReleaseType;
  effectiveness: number; // 0-100
  satisfaction: number; // 0-100
  setup: string; // what led to this
}

export type ReleaseType = 'resolution' | 'revelation' | 'catharsis' | 'irony' | 'surprise' | 'relief' | 'disappointment' | 'anticlimax';

