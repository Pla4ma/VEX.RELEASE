import type { AcademicAchievement, AcademicStruggle, CharacterArc, CharacterDevelopment, CharacterMotivation, CharacterRelationship, CharacterSecret, CharacterSymbolism, InstitutionType, InstitutionalExperience, LifeExperience, PastTrauma, PastTriumph, TimePeriod } from './types';

export interface TensionBuilding {
  start: number; // timestamp
  end: number; // timestamp
  method: BuildingMethod;
  effectiveness: number; // 0-100
  techniques: BuildingTechnique[];
}

export type BuildingMethod = 'gradual' | 'stepwise' | 'exponential' | 'oscillating' | 'interrupted';

export interface BuildingTechnique {
  technique: string;
  application: string;
  effectiveness: number; // 0-100
}

export type ResolutionType = 'happy' | 'sad' | 'bittersweet' | 'tragic' | 'ambiguous' | 'open' | 'circular' | 'transformative' | 'ironic' | 'poetic';

export interface StoryMoral {
  explicit: boolean;
  statement: string;
  themes: string[];
  lessons: StoryLesson[];
  universal: boolean;
  cultural: string[];
}

export interface StoryLesson {
  lesson: string;
  demonstration: string;
  context: string;
  applicability: string[];
}

export interface StoryCharacter {
  id: string;
  name: string;
  role: CharacterRole;
  archetype: CharacterArchetype;
  personality: CharacterPersonality;
  background: CharacterBackground;
  motivation: CharacterMotivation;
  arc: CharacterArc;
  relationships: CharacterRelationship[];
  development: CharacterDevelopment;
  symbolism: CharacterSymbolism;
}

export type CharacterRole = 'protagonist' | 'antagonist' | 'mentor' | 'ally' | 'love_interest' | 'comic_relief' | 'foil' | 'catalyst' | 'narrator' | 'observer' | 'guide' | 'guardian';

export type CharacterArchetype = 'hero' | 'mentor' | 'threshold_guardian' | 'herald' | 'shapeshifter' | 'shadow' | 'trickster' | 'ally' | 'innocent' | 'orphan' | 'martyr' | 'sage' | 'explorer' | 'rebel' | 'ruler' | 'creator' | 'caregiver' | 'jester' | 'lover' | 'magician';

export interface CharacterPersonality {
  traits: PersonalityTrait[];
  temperament: TemperamentType;
  values: CharacterValue[];
  flaws: CharacterFlaw[];
  strengths: CharacterStrength[];
  quirks: CharacterQuirk[];
}

export interface PersonalityTrait {
  trait: string;
  intensity: number; // 0-100
  expression: string;
  development: TraitDevelopment;
}

export type TraitDevelopment = 'static' | 'growing' | 'diminishing' | 'transforming' | 'revealed';

export type TemperamentType = 'sanguine' | 'choleric' | 'melancholic' | 'phlegmatic' | 'supine' | 'mixed';

export interface CharacterValue {
  value: string;
  importance: number; // 0-100
  source: string;
  tested: boolean;
  evolution: ValueEvolution;
}

export type ValueEvolution = 'strengthened' | 'weakened' | 'questioned' | 'abandoned' | 'discovered' | 'transformed';

export interface CharacterFlaw {
  flaw: string;
  severity: 'minor' | 'major' | 'fatal';
  origin: string;
  consequences: string[];
  growth: FlawGrowth;
}

export type FlawGrowth = 'acknowledged' | 'addressed' | 'overcome' | 'embraced' | 'transformed' | 'ignored';

export interface CharacterStrength {
  strength: string;
  application: string;
  limitation: string;
  growth: StrengthGrowth;
}

export type StrengthGrowth = 'developed' | 'mastered' | 'shared' | 'sacrificed' | 'transformed';

export interface CharacterQuirk {
  quirk: string;
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  significance: 'cosmetic' | 'character_revealing' | 'plot_relevant';
  origin: string;
}

export interface CharacterBackground {
  origin: string;
  family: FamilyBackground;
  education: EducationBackground;
  experience: LifeExperience[];
  trauma: PastTrauma[];
  triumph: PastTriumph[];
  secrets: CharacterSecret[];
}

export interface FamilyBackground {
  structure: FamilyStructure;
  dynamics: FamilyDynamics;
  relationships: FamilyRelationship[];
  influence: number; // 0-100
}

export type FamilyStructure = 'nuclear' | 'extended' | 'single_parent' | 'adopted' | 'orphaned' | 'found_family' | 'communal';

export interface FamilyDynamics {
  atmosphere: string;
  communication: CommunicationStyle;
  conflict_resolution: ConflictResolutionStyle;
  support: SupportLevel;
}

export type CommunicationStyle = 'open' | 'closed' | 'indirect' | 'direct' | 'passive_aggressive' | 'assertive';

export type ConflictResolutionStyle = 'collaborative' | 'competitive' | 'accommodating' | 'avoiding' | 'compromising';

export type SupportLevel = 'overwhelming' | 'supportive' | 'conditional' | 'minimal' | 'absent' | 'negative';

export interface FamilyRelationship {
  member: string;
  relationship: string;
  quality: number; // -100 to 100
  influence: number; // 0-100
  complexity: number; // 0-100
}

export interface EducationBackground {
  level: EducationLevel;
  institutions: EducationalInstitution[];
  achievements: AcademicAchievement[];
  struggles: AcademicStruggle[];
  influence: number; // 0-100
}

export type EducationLevel = 'none' | 'basic' | 'secondary' | 'higher' | 'specialized' | 'self_taught' | 'experiential';

export interface EducationalInstitution {
  name: string;
  type: InstitutionType;
  period: TimePeriod;
  experience: InstitutionalExperience;
}

