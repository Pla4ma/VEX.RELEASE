/**
 * Session Story Feature Types
 *
 * Types for narrative generation, storytelling, and session chronicles.
 */

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

export type StoryGenre = "adventure" | "mystery" | "fantasy" | "sci_fi" | "horror" | "romance" | "comedy" | "drama" | "thriller" | "epic" | "coming_of_age" | "hero_journey";

export type StoryTheme = "growth" | "courage" | "wisdom" | "perseverance" | "friendship" | "discovery" | "transformation" | "redemption" | "leadership" | "innovation" | "mastery" | "legacy";

export interface NarrativeStructure {
  type: NarrativeType;
  acts: NarrativeAct[];
  pacing: PacingProfile;
  tension: TensionCurve;
  resolution: ResolutionType;
  moral: StoryMoral;
}

export type NarrativeType = "linear" | "non_linear" | "branching" | "circular" | "episodic" | "fragmented" | "interactive";

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

export type ActType = "exposition" | "rising_action" | "climax" | "falling_action" | "resolution" | "epilogue";

export interface PacingProfile {
  rhythm: PacingRhythm;
  variation: PacingVariation;
  intensity: IntensityProfile;
  beats: StoryBeat[];
}

export type PacingRhythm = "steady" | "accelerating" | "decelerating" | "variable" | "staccato" | "legato";

export interface PacingVariation {
  frequency: number; // 0-100
  amplitude: number; // 0-100
  pattern: VariationPattern;
}

export type VariationPattern = "regular" | "irregular" | "crescendo" | "diminuendo" | "wave" | "spike";

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
  significance: "minor" | "major" | "climactic";
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

export type TransitionMethod = "gradual" | "abrupt" | "crescendo" | "fade" | "jump_cut" | "cross_fade";

export interface StoryBeat {
  id: string;
  type: BeatType;
  timing: number; // relative position
  description: string;
  significance: "minor" | "major" | "critical";
  emotional: EmotionalBeat;
  impact: number; // 0-100
}

export type BeatType = "inciting_incident" | "plot_point" | "revelation" | "conflict" | "resolution" | "character_moment" | "theme_moment" | "symbolic_moment" | "turning_point";

export interface EmotionalBeat {
  primary: EmotionType;
  secondary?: EmotionType;
  intensity: number; // 0-100
  duration: number; // relative
  target_audience: AudienceType;
}

export type EmotionType = "joy" | "sadness" | "anger" | "fear" | "surprise" | "disgust" | "anticipation" | "trust" | "love" | "hope" | "despair" | "courage" | "wonder" | "nostalgia" | "triumph";

export type AudienceType = "character" | "reader" | "both" | "neither";

export type ImpactScope = "personal" | "relational" | "situational" | "narrative" | "thematic" | "universal";

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

export type TensionType = "conflict" | "mystery" | "suspense" | "dramatic_irony" | "anticipation" | "moral_dilemma" | "time_pressure" | "resource_constraint" | "emotional_stakes";

export interface TensionArc {
  shape: ArcShape;
  peak: number; // timestamp
  plateau: number; // duration
  descent: number; // duration
}

export type ArcShape = "linear" | "exponential" | "logarithmic" | "bell_curve" | "sawtooth" | "plateau" | "irregular";

export interface TensionRelease {
  timestamp: number; // relative position
  type: ReleaseType;
  effectiveness: number; // 0-100
  satisfaction: number; // 0-100
  setup: string; // what led to this
}

export type ReleaseType = "resolution" | "revelation" | "catharsis" | "irony" | "surprise" | "relief" | "disappointment" | "anticlimax";

export interface TensionBuilding {
  start: number; // timestamp
  end: number; // timestamp
  method: BuildingMethod;
  effectiveness: number; // 0-100
  techniques: BuildingTechnique[];
}

export type BuildingMethod = "gradual" | "stepwise" | "exponential" | "oscillating" | "interrupted";

export interface BuildingTechnique {
  technique: string;
  application: string;
  effectiveness: number; // 0-100
}

export type ResolutionType = "happy" | "sad" | "bittersweet" | "tragic" | "ambiguous" | "open" | "circular" | "transformative" | "ironic" | "poetic";

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

export type CharacterRole = "protagonist" | "antagonist" | "mentor" | "ally" | "love_interest" | "comic_relief" | "foil" | "catalyst" | "narrator" | "observer" | "guide" | "guardian";

export type CharacterArchetype = "hero" | "mentor" | "threshold_guardian" | "herald" | "shapeshifter" | "shadow" | "trickster" | "ally" | "innocent" | "orphan" | "martyr" | "sage" | "explorer" | "rebel" | "ruler" | "creator" | "caregiver" | "jester" | "lover" | "magician";

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

export type TraitDevelopment = "static" | "growing" | "diminishing" | "transforming" | "revealed";

export type TemperamentType = "sanguine" | "choleric" | "melancholic" | "phlegmatic" | "supine" | "mixed";

export interface CharacterValue {
  value: string;
  importance: number; // 0-100
  source: string;
  tested: boolean;
  evolution: ValueEvolution;
}

export type ValueEvolution = "strengthened" | "weakened" | "questioned" | "abandoned" | "discovered" | "transformed";

export interface CharacterFlaw {
  flaw: string;
  severity: "minor" | "major" | "fatal";
  origin: string;
  consequences: string[];
  growth: FlawGrowth;
}

export type FlawGrowth = "acknowledged" | "addressed" | "overcome" | "embraced" | "transformed" | "ignored";

export interface CharacterStrength {
  strength: string;
  application: string;
  limitation: string;
  growth: StrengthGrowth;
}

export type StrengthGrowth = "developed" | "mastered" | "shared" | "sacrificed" | "transformed";

export interface CharacterQuirk {
  quirk: string;
  frequency: "rare" | "occasional" | "frequent" | "constant";
  significance: "cosmetic" | "character_revealing" | "plot_relevant";
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

export type FamilyStructure = "nuclear" | "extended" | "single_parent" | "adopted" | "orphaned" | "found_family" | "communal";

export interface FamilyDynamics {
  atmosphere: string;
  communication: CommunicationStyle;
  conflict_resolution: ConflictResolutionStyle;
  support: SupportLevel;
}

export type CommunicationStyle = "open" | "closed" | "indirect" | "direct" | "passive_aggressive" | "assertive";

export type ConflictResolutionStyle = "collaborative" | "competitive" | "accommodating" | "avoiding" | "compromising";

export type SupportLevel = "overwhelming" | "supportive" | "conditional" | "minimal" | "absent" | "negative";

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

export type EducationLevel = "none" | "basic" | "secondary" | "higher" | "specialized" | "self_taught" | "experiential";

export interface EducationalInstitution {
  name: string;
  type: InstitutionType;
  period: TimePeriod;
  experience: InstitutionalExperience;
}

export type InstitutionType = "formal" | "informal" | "military" | "religious" | "trade" | "artistic" | "specialized";

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
  significance: "minor" | "major" | "transformative";
  recognition: string[];
  impact: string;
}

export interface AcademicStruggle {
  struggle: string;
  severity: "minor" | "major" | "significant";
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

export type ExperienceType = "travel" | "career" | "relationship" | "crisis" | "adventure" | "loss" | "discovery" | "achievement" | "failure" | "transformation";

export interface ExperienceImpact {
  personal: number; // 0-100
  professional: number; // 0-100
  emotional: number; // 0-100
  philosophical: number; // 0-100
}

export interface PastTrauma {
  trauma: string;
  type: TraumaType;
  severity: "minor" | "moderate" | "severe" | "extreme";
  processing: ProcessingStage;
  effects: TraumaEffect[];
  coping: CopingMechanism[];
}

export type TraumaType = "physical" | "emotional" | "psychological" | "existential" | "social" | "moral" | "spiritual";

export type ProcessingStage = "denial" | "anger" | "bargaining" | "depression" | "acceptance" | "integration" | "transformation";

export interface TraumaEffect {
  effect: string;
  area: EffectArea;
  severity: number; // 0-100
  duration: DurationType;
}

export type EffectArea = "behavior" | "emotion" | "cognition" | "relationships" | "worldview" | "physical";

export type DurationType = "temporary" | "persistent" | "chronic" | "episodic" | "delayed";

export interface CopingMechanism {
  mechanism: string;
  type: CopingType;
  effectiveness: number; // 0-100
  healthy: boolean;
  development: CopingDevelopment;
}

export type CopingType = "avoidance" | "confrontation" | "seeking_support" | "self_medication" | "spiritual" | "creative" | "intellectual" | "physical";

export type CopingDevelopment = "innate" | "learned" | "adapted" | "abandoned" | "replaced";

export interface PastTriumph {
  triumph: string;
  type: TriumphType;
  significance: "personal" | "public" | "historical";
  impact: TriumphImpact;
  legacy: string;
}

export type TriumphType = "personal" | "professional" | "creative" | "athletic" | "intellectual" | "moral" | "social" | "survival";

export interface TriumphImpact {
  confidence: number; // 0-100
  reputation: number; // 0-100
  opportunity: number; // 0-100
  perspective: number; // 0-100
}

export interface CharacterSecret {
  secret: string;
  type: SecretType;
  severity: "minor" | "major" | "critical" | "existential";
  known_by: string[];
  consequences: string[];
  revelation: RevelationCondition;
}

export type SecretType = "shameful" | "dangerous" | "embarrassing" | "protective" | "identity" | "ability" | "relationship" | "history";

export interface RevelationCondition {
  trigger: string;
  timing: RevelationTiming;
  impact: RevelationImpact;
  necessity: RevelationNecessity;
}

export type RevelationTiming = "early" | "mid_story" | "climax" | "resolution" | "epilogue" | "never";

export type RevelationImpact = "minor" | "significant" | "transformative" | "catastrophic" | "redemptive";

export type RevelationNecessity = "optional" | "helpful" | "important" | "critical" | "essential";

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

export type MotivationSource = "intrinsic" | "extrinsic" | "existential" | "relational" | "situational" | "historical" | "mystical";

export interface SecondaryMotivation {
  motivation: string;
  priority: number; // 1-10
  compatibility: number; // 0-100 with primary
  influence: number; // 0-100
}

export interface HiddenMotivation {
  motivation: string;
  awareness: "unconscious" | "subconscious" | "suppressed" | "denied";
  strength: number; // 0-100
  manifestation: string[];
}

export interface ConflictingMotivation {
  motivation: string;
  conflict: string;
  tension: number; // 0-100
  resolution: ConflictResolution;
}

export type ConflictResolution = "prioritized" | "compromised" | "integrated" | "transcended" | "unresolved";

export interface MotivationEvolution {
  changes: MotivationChange[];
  catalysts: MotivationCatalyst[];
  growth: MotivationGrowth;
}

export interface MotivationChange {
  from: string;
  to: string;
  timing: number; // story position
  cause: string;
  significance: "minor" | "major" | "transformative";
}

export interface MotivationCatalyst {
  event: string;
  impact: number; // 0-100
  timing: number; // story position
  type: CatalystType;
}

export type CatalystType = "trauma" | "revelation" | "relationship" | "achievement" | "failure" | "discovery" | "choice" | "sacrifice";

export interface MotivationGrowth {
  direction: GrowthDirection;
  maturity: number; // 0-100
  authenticity: number; // 0-100
  integration: number; // 0-100
}

export type GrowthDirection = "simplifying" | "complexifying" | "deepening" | "broadening" | "transforming" | "integrating";

export interface CharacterArc {
  type: ArcType;
  trajectory: ArcTrajectory;
  stages: ArcStage[];
  transformation: CharacterTransformation;
  resolution: ArcResolution;
  significance: ArcSignificance;
}

export type ArcType = "growth" | "fall" | "redemption" | "discovery" | "corruption" | "sacrifice" | "mastery" | "liberation" | "integration" | "transcendence";

export interface ArcTrajectory {
  start: CharacterState;
  end: CharacterState;
  path: TrajectoryPath;
  obstacles: ArcObstacle[];
  milestones: ArcMilestone[];
}

export interface CharacterState {
  identity: string;
  worldview: string;
  capabilities: string[];
  limitations: string[];
  relationships: string[];
  purpose: string;
}

export type TrajectoryPath = "linear" | "spiral" | "zigzag" | "plateau" | "collapse" | "rebirth" | "integration";

export interface ArcObstacle {
  obstacle: string;
  type: ObstacleType;
  severity: "minor" | "major" | "critical" | "existential";
  timing: number; // story position
  overcome: boolean;
  method?: string;
}

export type ObstacleType = "internal" | "external" | "interpersonal" | "societal" | "existential" | "supernatural";

export interface ArcMilestone {
  milestone: string;
  significance: "minor" | "major" | "critical" | "transformative";
  timing: number; // story position
  achievement: string;
  impact: string;
}

export interface ArcStage {
  stage: string;
  timing: number; // story position
  duration: number; // relative
  purpose: string;
  challenges: string[];
  growth: string[];
  significance: number; // 0-100
}

export interface CharacterTransformation {
  before: CharacterState;
  after: CharacterState;
  process: TransformationProcess;
  catalyst: string;
  permanence: number; // 0-100
  authenticity: number; // 0-100
}

export interface TransformationProcess {
  method: TransformationMethod;
  duration: number; // relative
  difficulty: number; // 0-100
  pain: number; // 0-100
  support: number; // 0-100
}

export type TransformationMethod = "gradual" | "sudden" | "forced" | "chosen" | "discovered" | "earned" | "gifted" | "sacrificed";

export interface ArcResolution {
  type: ResolutionOutcome;
  satisfaction: number; // 0-100
  closure: number; // 0-100
  meaning: number; // 0-100
  impact: string;
}

export type ResolutionOutcome = "triumph" | "tragedy" | "bittersweet" | "ambiguous" | "transcendent" | "cyclical" | "open" | "poetic";

export interface ArcSignificance {
  personal: number; // 0-100
  relational: number; // 0-100
  thematic: number; // 0-100
  symbolic: number; // 0-100
  universal: number; // 0-100
}

export interface CharacterRelationship {
  characterId: string;
  relationship: RelationshipType;
  dynamics: RelationshipDynamics;
  history: RelationshipHistory;
  evolution: RelationshipEvolution;
  significance: RelationshipSignificance;
}

export type RelationshipType = "family" | "friend" | "romantic" | "mentor" | "rival" | "ally" | "enemy" | "colleague" | "acquaintance" | "stranger" | "symbolic";

export interface RelationshipDynamics {
  power: PowerDynamic;
  intimacy: IntimacyLevel;
  communication: CommunicationPattern;
  conflict: ConflictPattern;
  support: SupportPattern;
  growth: GrowthPattern;
}

export interface PowerDynamic {
  balance: "equal" | "imbalanced" | "shifting" | "contested";
  source: string;
  expression: string;
  acceptance: number; // 0-100
}

export interface IntimacyLevel {
  emotional: number; // 0-100
  intellectual: number; // 0-100
  physical: number; // 0-100
  spiritual: number; // 0-100
  shared_history: number; // 0-100
}

export interface CommunicationPattern {
  style: CommunicationStyle;
  frequency: FrequencyLevel;
  honesty: number; // 0-100
  vulnerability: number; // 0-100
  understanding: number; // 0-100
}

export type FrequencyLevel = "constant" | "daily" | "weekly" | "occasional" | "rare" | "seasonal";

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

export type SupportType = "emotional" | "practical" | "informational" | "spiritual" | "financial" | "protective";

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
  significance: "minor" | "major" | "critical" | "transformative";
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
  direction: "improving" | "declining" | "cyclical" | "transformative" | "static";
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

export type InfluenceSource = "internal" | "external" | "mutual" | "situational" | "third_party" | "societal";

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

export type DevelopmentType = "emotional" | "intellectual" | "moral" | "social" | "spiritual" | "physical" | "creative" | "leadership";

export interface DevelopmentGrowth {
  overall: number; // 0-100
  by_dimension: Record<DevelopmentType, number>;
  acceleration: number; // 0-100
  sustainability: number; // 0-100
  authenticity: number; // 0-100
}

export interface DevelopmentChallenge {
  challenge: string;
  type: ChallengeType;
  difficulty: number; // 0-100
  timing: number; // story position
  resolution: string;
  learning: string;
}

export type ChallengeType = "internal" | "external" | "interpersonal" | "existential" | "moral" | "skill_based";

export interface DevelopmentLearning {
  lesson: string;
  source: LearningSource;
  application: string;
  retention: number; // 0-100
  transfer: number; // 0-100
}

export type LearningSource = "experience" | "teaching" | "observation" | "reflection" | "failure" | "success" | "relationship";

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

export type SymbolType = "object" | "action" | "quality" | "relationship" | "journey" | "transformation" | "sacrifice" | "rebirth";

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

export type EventType = "action" | "dialogue" | "revelation" | "decision" | "consequence" | "transformation" | "conflict" | "resolution" | "symbolic" | "catalyst";

export interface EventSignificance {
  plot: number; // 0-100
  character: number; // 0-100
  theme: number; // 0-100
  emotional: number; // 0-100
  symbolic: number; // 0-100
}

export interface EventCause {
  cause: string;
  type: CauseType;
  necessity: "optional" | "important" | "critical" | "essential";
  timing: number; // relative position
  visibility: "explicit" | "implicit" | "hidden" | "revealed";
}

export type CauseType = "character_action" | "external_force" | "internal_conflict" | "past_event" | "fate" | "chance" | "symbolic" | "thematic";

export interface EventEffect {
  effect: string;
  type: EffectType;
  immediacy: "immediate" | "delayed" | "gradual" | "cumulative";
  scope: EffectScope;
  permanence: number; // 0-100
}

export type EffectType = "plot_advancement" | "character_change" | "emotional_impact" | "theme_development" | "symbolic_meaning" | "setup" | "payoff";

export type EffectScope = "personal" | "relational" | "situational" | "narrative" | "thematic" | "universal";

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

export type ChapterType = "exposition" | "rising_action" | "climax" | "falling_action" | "resolution" | "epilogue" | "prologue" | "interlude" | "flashback" | "flash_forward";

export interface ChapterPurpose {
  primary: string;
  secondary: string[];
  plot_function: PlotFunction;
  character_function: CharacterFunction;
  theme_function: ThemeFunction;
}

export type PlotFunction = "setup" | "complication" | "confrontation" | "resolution" | "transition" | "revelation" | "foreshadowing";

export type CharacterFunction = "introduction" | "development" | "transformation" | "relationship" | "conflict" | "resolution";

export type ThemeFunction = "introduction" | "exploration" | "complication" | "reinforcement" | "challenge" | "resolution";

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

export type MoodType = "hopeful" | "tense" | "somber" | "joyful" | "mysterious" | "romantic" | "melancholy" | "exciting" | "contemplative" | "ominous";

export interface MoodProgression {
  start: number; // 0-100
  end: number; // 0-100
  pattern: ProgressionPattern;
  triggers: string[];
}

export type ProgressionPattern = "stable" | "rising" | "falling" | "oscillating" | "crescendo" | "diminuendo";

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

export type ReinforcementMethod = "dialogue" | "action" | "symbolism" | "setting" | "character" | "narrative" | "metaphor";

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

export type TransitionType = "temporal" | "spatial" | "perspective" | "thematic" | "emotional" | "narrative";

export type TransitionPurpose = "continuation" | "contrast" | "connection" | "revelation" | "setup" | "resolution";

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

export type ChoiceType = "moral" | "strategic" | "emotional" | "practical" | "existential" | "relational" | "sacrificial" | "transformative";

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

export type ResolutionMethod = "deliberate" | "instinctive" | "forced" | "accidental" | "deferred" | "collective";

export interface StoryOutcome {
  type: OutcomeType;
  resolution: OutcomeResolution;
  satisfaction: OutcomeSatisfaction;
  meaning: OutcomeMeaning;
  impact: OutcomeImpact;
  legacy: OutcomeLegacy;
}

export type OutcomeType = "triumph" | "tragedy" | "bittersweet" | "ambiguous" | "transformative" | "cyclical" | "transcendent" | "poetic";

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

export type MotifType = "visual" | "auditory" | "behavioral" | "dialogue" | "symbolic" | "structural" | "thematic";

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

export type InfluenceType = "literary" | "mythological" | "historical" | "cultural" | "philosophical" | "artistic" | "personal";

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

export type NarrativePerspective = "first_person" | "second_person" | "third_person_limited" | "third_person_omniscient" | "multiple" | "unreliable";

export type NarrativeTense = "past" | "present" | "future" | "mixed";

export type ReliabilityLevel = "reliable" | "somewhat_reliable" | "questionable" | "unreliable" | "deceptive";

export type NarrativeDistance = "intimate" | "close" | "moderate" | "distant" | "detached";

export type NarrativeTechnique = "stream_of_consciousness" | "flashback" | "foreshadowing" | "nonlinear" | "epistolary" | "fragmentary" | "experimental";

export interface DialogueStyle {
  realism: number; // 0-100
  naturalness: number; // 0-100
  character_voice: number; // 0-100
  exposition: number; // 0-100
  subtext: number; // 0-100
  rhythm: DialogueRhythm;
}

export type DialogueRhythm = "rapid" | "measured" | "leisurely" | "staccato" | "flowing" | "interrupted";

export interface DescriptionStyle {
  detail: DetailLevel;
  imagery: ImageryType;
  sensory: SensoryFocus;
  metaphor: MetaphorUsage;
  efficiency: number; // 0-100
}

export type DetailLevel = "minimal" | "selective" | "moderate" | "detailed" | "extensive";

export type ImageryType = "visual" | "auditory" | "tactile" | "olfactory" | "gustatory" | "kinesthetic" | "synesthetic";

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

export type PacingSpeed = "slow" | "moderate" | "fast" | "variable" | "dynamic";

export interface TensionManagement {
  building: number; // 0-100
  releasing: number; // 0-100
  sustaining: number; // 0-100
  timing: number; // 0-100
}

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

export type ToneType = "serious" | "humorous" | "ironic" | "satirical" | "romantic" | "melancholy" | "optimistic" | "pessimistic" | "mysterious" | "dramatic";

export interface AuthorialVoice {
  presence: VoicePresence;
  personality: VoicePersonality;
  consistency: number; // 0-100
  distinctiveness: number; // 0-100
  authenticity: number; // 0-100
}

export type VoicePresence = "invisible" | "subtle" | "moderate" | "distinct" | "prominent" | "dominant";

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

export type VoiceAttitude = "objective" | "subjective" | "empathetic" | "critical" | "celebratory" | "skeptical" | "curious";

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

export type ExpectationCategory = "genre" | "character" | "plot" | "theme" | "style" | "emotional" | "intellectual";

export interface AudienceSensitivity {
  sensitivity: string;
  severity: "minor" | "moderate" | "major" | "critical";
  handling: HandlingApproach;
  consideration: number; // 0-100
}

export type HandlingApproach = "avoidance" | "subtle" | "respectful" | "educational" | "confrontational" | "therapeutic";

export interface StoryPurpose {
  primary: PurposeType;
  secondary: PurposeType[];
  message: string;
  impact: PurposeImpact;
  authenticity: number; // 0-100
}

export type PurposeType = "entertainment" | "education" | "inspiration" | "persuasion" | "exploration" | "healing" | "preservation" | "innovation";

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

export type MeasurementMethod = "emotional_response" | "behavioral_change" | "knowledge_retention" | "perspective_shift" | "social_discourse" | "cultural_influence";

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

export type CreationApproach = "planned" | "discovery" | "hybrid" | "collaborative" | "experimental";

export type CreationMethod = "outlining" | "free_writing" | "research" | "character_development" | "world_building" | "revision";

export interface CreationTool {
  tool: string;
  type: ToolType;
  usage: string;
  effectiveness: number; // 0-100
}

export type ToolType = "software" | "reference" | "organizational" | "creative" | "analytical";

export interface CreationEnvironment {
  location: string;
  atmosphere: string;
  routine: string;
  conditions: string[];
}

export interface CreationChallenge {
  challenge: string;
  type: ChallengeType;
  severity: "minor" | "moderate" | "major" | "critical";
  resolution: string;
  learning: string;
}

export interface InspirationSource {
  source: string;
  type: InspirationType;
  influence: number; // 0-100
  integration: string;
}

export type InspirationType = "personal" | "literary" | "historical" | "cultural" | "natural" | "artistic" | "philosophical" | "scientific";

export interface RevisionHistory {
  versions: RevisionVersion[];
  feedback: FeedbackSource[];
  changes: MajorChange[];
  learning: RevisionLearning;
}

export interface RevisionVersion {
  version: string;
  date: Date;
  changes: string[];
  reason: string;
  effectiveness: number; // 0-100
}

export interface FeedbackSource {
  source: string;
  type: FeedbackType;
  feedback: string[];
  incorporation: number; // 0-100
}

export type FeedbackType = "beta_reader" | "editor" | "workshop" | "professional" | "peer" | "self";

export interface MajorChange {
  change: string;
  type: ChangeType;
  timing: number; // version number
  reason: string;
  impact: string;
}

export type ChangeType = "structural" | "character" | "plot" | "theme" | "style" | "tonal";

export interface RevisionLearning {
  insights: string[];
  improvements: string[];
  techniques: string[];
  growth: string[];
}

// Event Types
export interface SessionStoryEvent {
  type: "story_created" | "story_updated" | "chapter_added" | "character_developed" | "choice_made" | "story_completed";
  userId: string;
  sessionId: string;
  storyId: string;
  data: Record<string, any>;
  timestamp: Date;
}
