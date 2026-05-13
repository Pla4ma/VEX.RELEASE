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

export interface NarrativeStructure {
    type: NarrativeType;
    acts: NarrativeAct[];
    pacing: PacingProfile;
    tension: TensionCurve;
    resolution: ResolutionType;
    moral: StoryMoral;
}

export interface NarrativeAct {
    id: string;
    name: string;
    type: ActType;
    position: number;
    duration: number;
    purpose: string;
    events: string[];
    climax: boolean;
    resolution: boolean;
}

export interface PacingProfile {
    rhythm: PacingRhythm;
    variation: PacingVariation;
    intensity: IntensityProfile;
    beats: StoryBeat[];
}

export interface PacingVariation {
    frequency: number;
    amplitude: number;
    pattern: VariationPattern;
}

export interface IntensityProfile {
    baseline: number;
    peaks: IntensityPeak[];
    valleys: IntensityValley[];
    transitions: IntensityTransition[];
}

export interface IntensityPeak {
    timestamp: number;
    intensity: number;
    duration: number;
    cause: string;
    significance: 'minor' | 'major' | 'climactic';
}

export interface IntensityValley {
    timestamp: number;
    intensity: number;
    duration: number;
    purpose: string;
    recovery: number;
}

export interface IntensityTransition {
    from: number;
    to: number;
    timing: number;
    method: TransitionMethod;
    duration: number;
}

export interface StoryBeat {
    id: string;
    type: BeatType;
    timing: number;
    description: string;
    significance: 'minor' | 'major' | 'critical';
    emotional: EmotionalBeat;
    impact: number;
}

export interface EmotionalBeat {
    primary: EmotionType;
    secondary?: EmotionType;
    intensity: number;
    duration: number;
    target_audience: AudienceType;
}

export interface TensionCurve {
    points: TensionPoint[];
    arc: TensionArc;
    release: TensionRelease[];
    building: TensionBuilding[];
}

export interface TensionPoint {
    timestamp: number;
    tension: number;
    type: TensionType;
    source: string;
    resolution?: number;
}

export interface TensionArc {
    shape: ArcShape;
    peak: number;
    plateau: number;
    descent: number;
}

export interface TensionRelease {
    timestamp: number;
    type: ReleaseType;
    effectiveness: number;
    satisfaction: number;
    setup: string;
}

export interface TensionBuilding {
    start: number;
    end: number;
    method: BuildingMethod;
    effectiveness: number;
    techniques: BuildingTechnique[];
}

export interface BuildingTechnique {
    technique: string;
    application: string;
    effectiveness: number;
}

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
    intensity: number;
    expression: string;
    development: TraitDevelopment;
}

export interface CharacterValue {
    value: string;
    importance: number;
    source: string;
    tested: boolean;
    evolution: ValueEvolution;
}

export interface CharacterFlaw {
    flaw: string;
    severity: 'minor' | 'major' | 'fatal';
    origin: string;
    consequences: string[];
    growth: FlawGrowth;
}

export interface CharacterStrength {
    strength: string;
    application: string;
    limitation: string;
    growth: StrengthGrowth;
}

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
    influence: number;
}

export interface FamilyDynamics {
    atmosphere: string;
    communication: CommunicationStyle;
    conflict_resolution: ConflictResolutionStyle;
    support: SupportLevel;
}

export interface FamilyRelationship {
    member: string;
    relationship: string;
    quality: number;
    influence: number;
    complexity: number;
}

export interface EducationBackground {
    level: EducationLevel;
    institutions: EducationalInstitution[];
    achievements: AcademicAchievement[];
    struggles: AcademicStruggle[];
    influence: number;
}

export interface EducationalInstitution {
    name: string;
    type: InstitutionType;
    period: TimePeriod;
    experience: InstitutionalExperience;
}

export interface TimePeriod {
    start: Date;
    end?: Date;
    duration: number;
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

export interface ExperienceImpact {
    personal: number;
    professional: number;
    emotional: number;
    philosophical: number;
}

export interface PastTrauma {
    trauma: string;
    type: TraumaType;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    processing: ProcessingStage;
    effects: TraumaEffect[];
    coping: CopingMechanism[];
}

export interface TraumaEffect {
    effect: string;
    area: EffectArea;
    severity: number;
    duration: DurationType;
}

export interface CopingMechanism {
    mechanism: string;
    type: CopingType;
    effectiveness: number;
    healthy: boolean;
    development: CopingDevelopment;
}

export interface PastTriumph {
    triumph: string;
    type: TriumphType;
    significance: 'personal' | 'public' | 'historical';
    impact: TriumphImpact;
    legacy: string;
}

export interface TriumphImpact {
    confidence: number;
    reputation: number;
    opportunity: number;
    perspective: number;
}

export interface CharacterSecret {
    secret: string;
    type: SecretType;
    severity: 'minor' | 'major' | 'critical' | 'existential';
    known_by: string[];
    consequences: string[];
    revelation: RevelationCondition;
}

export interface RevelationCondition {
    trigger: string;
    timing: RevelationTiming;
    impact: RevelationImpact;
    necessity: RevelationNecessity;
}

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
    strength: number;
    clarity: number;
    accessibility: number;
}

export interface SecondaryMotivation {
    motivation: string;
    priority: number;
    compatibility: number;
    influence: number;
}

export interface HiddenMotivation {
    motivation: string;
    awareness: 'unconscious' | 'subconscious' | 'suppressed' | 'denied';
    strength: number;
    manifestation: string[];
}

export interface ConflictingMotivation {
    motivation: string;
    conflict: string;
    tension: number;
    resolution: ConflictResolution;
}

export interface MotivationEvolution {
    changes: MotivationChange[];
    catalysts: MotivationCatalyst[];
    growth: MotivationGrowth;
}

export interface MotivationChange {
    from: string;
    to: string;
    timing: number;
    cause: string;
    significance: 'minor' | 'major' | 'transformative';
}

export interface MotivationCatalyst {
    event: string;
    impact: number;
    timing: number;
    type: CatalystType;
}

export interface MotivationGrowth {
    direction: GrowthDirection;
    maturity: number;
    authenticity: number;
    integration: number;
}

export interface CharacterArc {
    type: ArcType;
    trajectory: ArcTrajectory;
    stages: ArcStage[];
    transformation: CharacterTransformation;
    resolution: ArcResolution;
    significance: ArcSignificance;
}

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

export interface ArcObstacle {
    obstacle: string;
    type: ObstacleType;
    severity: 'minor' | 'major' | 'critical' | 'existential';
    timing: number;
    overcome: boolean;
    method?: string;
}

export interface ArcMilestone {
    milestone: string;
    significance: 'minor' | 'major' | 'critical' | 'transformative';
    timing: number;
    achievement: string;
    impact: string;
}

export interface ArcStage {
    stage: string;
    timing: number;
    duration: number;
    purpose: string;
    challenges: string[];
    growth: string[];
    significance: number;
}

export interface CharacterTransformation {
    before: CharacterState;
    after: CharacterState;
    process: TransformationProcess;
    catalyst: string;
    permanence: number;
    authenticity: number;
}

export interface TransformationProcess {
    method: TransformationMethod;
    duration: number;
    difficulty: number;
    pain: number;
    support: number;
}

export interface ArcResolution {
    type: ResolutionOutcome;
    satisfaction: number;
    closure: number;
    meaning: number;
    impact: string;
}

export interface ArcSignificance {
    personal: number;
    relational: number;
    thematic: number;
    symbolic: number;
    universal: number;
}

export interface CharacterRelationship {
    characterId: string;
    relationship: RelationshipType;
    dynamics: RelationshipDynamics;
    history: RelationshipHistory;
    evolution: RelationshipEvolution;
    significance: RelationshipSignificance;
}

export interface RelationshipDynamics {
    power: PowerDynamic;
    intimacy: IntimacyLevel;
    communication: CommunicationPattern;
    conflict: ConflictPattern;
    support: SupportPattern;
    growth: GrowthPattern;
}

export interface PowerDynamic {
    balance: 'equal' | 'imbalanced' | 'shifting' | 'contested';
    source: string;
    expression: string;
    acceptance: number;
}

export interface IntimacyLevel {
    emotional: number;
    intellectual: number;
    physical: number;
    spiritual: number;
    shared_history: number;
}

export interface CommunicationPattern {
    style: CommunicationStyle;
    frequency: FrequencyLevel;
    honesty: number;
    vulnerability: number;
    understanding: number;
}

export interface ConflictPattern {
    frequency: FrequencyLevel;
    intensity: number;
    resolution: ConflictResolutionStyle;
    impact: number;
    learning: number;
}

export interface SupportPattern {
    type: SupportType;
    availability: number;
    effectiveness: number;
    reciprocity: number;
    conditions: string[];
}

export interface GrowthPattern {
    direction: GrowthDirection;
    rate: number;
    catalysts: string[];
    obstacles: string[];
    potential: number;
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
    timing: number;
    first_impression: string;
    initial_dynamic: string;
    significance: string;
}

export interface RelationshipMilestone {
    milestone: string;
    timing: number;
    significance: 'minor' | 'major' | 'critical' | 'transformative';
    impact: string;
    memory: string;
}

export interface RelationshipCrisis {
    crisis: string;
    timing: number;
    cause: string;
    resolution: string;
    impact: number;
    learning: string;
}

export interface RelationshipTriumph {
    triumph: string;
    timing: number;
    nature: string;
    impact: number;
    bonding: number;
}

export interface RelationshipChange {
    from: string;
    to: string;
    timing: number;
    cause: string;
    permanence: number;
}

export interface RelationshipEvolution {
    trajectory: EvolutionTrajectory;
    stages: EvolutionStage[];
    influences: EvolutionInfluence[];
    potential: EvolutionPotential;
}

export interface EvolutionTrajectory {
    direction: 'improving' | 'declining' | 'cyclical' | 'transformative' | 'static';
    pace: number;
    stability: number;
    predictability: number;
}

export interface EvolutionStage {
    stage: string;
    characteristics: string[];
    duration: number;
    challenges: string[];
    growth: string[];
}

export interface EvolutionInfluence {
    influence: string;
    source: InfluenceSource;
    impact: number;
    timing: number;
}

export interface EvolutionPotential {
    possibilities: string[];
    limitations: string[];
    requirements: string[];
    timeline: string;
    probability: number;
}

export interface RelationshipSignificance {
    narrative: number;
    character: number;
    thematic: number;
    symbolic: number;
    emotional: number;
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
    current_level: number;
    potential: number;
    growth_rate: number;
    obstacles: string[];
    opportunities: string[];
}

export interface DevelopmentGrowth {
    overall: number;
    by_dimension: Record<DevelopmentType, number>;
    acceleration: number;
    sustainability: number;
    authenticity: number;
}

export interface DevelopmentChallenge {
    challenge: string;
    type: ChallengeType;
    difficulty: number;
    timing: number;
    resolution: string;
    learning: string;
}

export interface DevelopmentLearning {
    lesson: string;
    source: LearningSource;
    application: string;
    retention: number;
    transfer: number;
}

export interface DevelopmentMastery {
    skills: MasteredSkill[];
    wisdom: MasteredWisdom[];
    integration: MasteredIntegration[];
    legacy: string;
}

export interface MasteredSkill {
    skill: string;
    level: number;
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
    significance: number;
}

export interface SymbolEvolution {
    stages: SymbolStage[];
    catalyst: string;
    permanence: number;
    universality: number;
}

export interface SymbolStage {
    stage: string;
    meaning: string;
    timing: number;
    context: string;
}

export interface SymbolicArchetype {
    archetype: string;
    expression: string;
    universality: number;
    cultural: string[];
    personal: number;
}

export interface CharacterMetaphor {
    metaphor: string;
    domain: string;
    mapping: MetaphorMapping[];
    insight: string;
    power: number;
}

export interface MetaphorMapping {
    source: string;
    target: string;
    correspondence: string;
    novelty: number;
}

export interface SymbolicTheme {
    theme: string;
    expression: string;
    development: ThemeDevelopment;
    resolution: ThemeResolution;
}

export interface ThemeDevelopment {
    introduction: number;
    exploration: number[];
    complication: number[];
    climax: number;
    resolution: number;
}

export interface ThemeResolution {
    outcome: string;
    clarity: number;
    satisfaction: number;
    universality: number;
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
    timing: number;
    duration: number;
    significance: EventSignificance;
    description: string;
    participants: string[];
    causes: EventCause[];
    effects: EventEffect[];
    symbolism: EventSymbolism;
    alternatives: AlternativeEvent[];
}

export interface EventSignificance {
    plot: number;
    character: number;
    theme: number;
    emotional: number;
    symbolic: number;
}

export interface EventCause {
    cause: string;
    type: CauseType;
    necessity: 'optional' | 'important' | 'critical' | 'essential';
    timing: number;
    visibility: 'explicit' | 'implicit' | 'hidden' | 'revealed';
}

export interface EventEffect {
    effect: string;
    type: EffectType;
    immediacy: 'immediate' | 'delayed' | 'gradual' | 'cumulative';
    scope: EffectScope;
    permanence: number;
}

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
    power: number;
}

export interface EventArchetype {
    archetype: string;
    manifestation: string;
    significance: number;
    universality: number;
}

export interface AlternativeEvent {
    event: string;
    probability: number;
    consequences: string[];
    thematic_impact: number;
    character_impact: number;
    narrative_impact: number;
}

export interface StoryChapter {
    id: string;
    title: string;
    number: number;
    type: ChapterType;
    purpose: ChapterPurpose;
    events: string[];
    characters: string[];
    setting: ChapterSetting;
    mood: ChapterMood;
    theme: ChapterTheme;
    symbolism: ChapterSymbolism;
    transitions: ChapterTransition[];
}

export interface ChapterPurpose {
    primary: string;
    secondary: string[];
    plot_function: PlotFunction;
    character_function: CharacterFunction;
    theme_function: ThemeFunction;
}

export interface ChapterSetting {
    location: string;
    time: string;
    atmosphere: string;
    significance: SettingSignificance;
    symbolism: SettingSymbolism;
}

export interface SettingSignificance {
    narrative: number;
    character: number;
    theme: number;
    mood: number;
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
    intensity: number;
    progression: MoodProgression;
    consistency: number;
}

export interface MoodProgression {
    start: number;
    end: number;
    pattern: ProgressionPattern;
    triggers: string[];
}

export interface ChapterTheme {
    primary: string;
    secondary: string[];
    development: ThemeDevelopment;
    reinforcement: ThemeReinforcement[];
    complexity: number;
}

export interface ThemeReinforcement {
    method: ReinforcementMethod;
    timing: number;
    effectiveness: number;
}

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
    significance: number;
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
    effectiveness: number;
}

export interface StoryChoice {
    id: string;
    timing: number;
    type: ChoiceType;
    options: ChoiceOption[];
    consequences: ChoiceConsequence[];
    significance: ChoiceSignificance;
    context: ChoiceContext;
    resolution: ChoiceResolution;
}

export interface ChoiceOption {
    id: string;
    description: string;
    motivation: string;
    difficulty: number;
    risk: number;
    reward: number;
    alignment: number;
    appeal: number;
}

export interface ChoiceConsequence {
    option: string;
    immediate: string[];
    short_term: string[];
    long_term: string[];
    character_impact: number;
    plot_impact: number;
    theme_impact: number;
}

export interface ChoiceSignificance {
    character: number;
    plot: number;
    theme: number;
    narrative: number;
    emotional: number;
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
    timing: number;
    method: ResolutionMethod;
    satisfaction: number;
    regret: number;
}

export interface StoryOutcome {
    type: OutcomeType;
    resolution: OutcomeResolution;
    satisfaction: OutcomeSatisfaction;
    meaning: OutcomeMeaning;
    impact: OutcomeImpact;
    legacy: OutcomeLegacy;
}

export interface OutcomeResolution {
    plot: string;
    character: string;
    theme: string;
    emotional: string;
    symbolic: string;
}

export interface OutcomeSatisfaction {
    narrative: number;
    emotional: number;
    intellectual: number;
    thematic: number;
    overall: number;
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
    permanence: number;
    significance: number;
}

export interface WorldImpact {
    changes: string[];
    permanence: number;
    scope: ImpactScope;
    significance: number;
}

export interface AudienceImpact {
    emotional: number;
    intellectual: number;
    inspirational: number;
    memorable: number;
}

export interface NarrativeImpact {
    structure: string;
    innovation: number;
    influence: number;
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
    significance: number;
    evolution: MotifEvolution;
}

export interface MotifEvolution {
    introduction: number;
    development: number[];
    climax: number;
    resolution: number;
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
    significance: number;
    originality: number;
}

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

export interface DialogueStyle {
    realism: number;
    naturalness: number;
    character_voice: number;
    exposition: number;
    subtext: number;
    rhythm: DialogueRhythm;
}

export interface DescriptionStyle {
    detail: DetailLevel;
    imagery: ImageryType;
    sensory: SensoryFocus;
    metaphor: MetaphorUsage;
    efficiency: number;
}

export interface SensoryFocus {
    visual: number;
    auditory: number;
    tactile: number;
    olfactory: number;
    gustatory: number;
    kinesthetic: number;
}

export interface MetaphorUsage {
    frequency: number;
    complexity: number;
    originality: number;
    effectiveness: number;
}

export interface PacingStyle {
    speed: PacingSpeed;
    variation: PacingVariation;
    tension: TensionManagement;
    flow: FlowQuality;
}

export interface TensionManagement {
    building: number;
    releasing: number;
    sustaining: number;
    timing: number;
}

export interface FlowQuality {
    smoothness: number;
    continuity: number;
    transitions: number;
    coherence: number;
}

export interface ToneStyle {
    primary: ToneType;
    secondary: ToneType[];
    consistency: number;
    appropriateness: number;
    effectiveness: number;
}

export interface AuthorialVoice {
    presence: VoicePresence;
    personality: VoicePersonality;
    consistency: number;
    distinctiveness: number;
    authenticity: number;
}

export interface VoicePersonality {
    traits: VoiceTrait[];
    attitude: VoiceAttitude;
    worldview: VoiceWorldview;
    values: VoiceValue[];
}

export interface VoiceTrait {
    trait: string;
    intensity: number;
    expression: string;
}

export interface VoiceWorldview {
    perspective: string;
    philosophy: string;
    optimism: number;
    complexity: number;
}

export interface VoiceValue {
    value: string;
    importance: number;
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
    importance: number;
    satisfaction_method: string;
}

export interface AudienceSensitivity {
    sensitivity: string;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    handling: HandlingApproach;
    consideration: number;
}

export interface StoryPurpose {
    primary: PurposeType;
    secondary: PurposeType[];
    message: string;
    impact: PurposeImpact;
    authenticity: number;
}

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
    connection: number;
}

export interface CreationTimeline {
    conception: Date;
    development: Date;
    drafting: Date;
    revision: Date;
    completion: Date;
    duration: number;
}

export interface CreationProcess {
    approach: CreationApproach;
    methods: CreationMethod[];
    tools: CreationTool[];
    environment: CreationEnvironment;
}

export interface CreationTool {
    tool: string;
    type: ToolType;
    usage: string;
    effectiveness: number;
}

export interface CreationEnvironment {
    location: string;
    atmosphere: string;
    routine: string;
    conditions: string[];
}

export interface CreationChallenge {
    challenge: string;
    type: ChallengeType;
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    resolution: string;
    learning: string;
}

export interface InspirationSource {
    source: string;
    type: InspirationType;
    influence: number;
    integration: string;
}

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
    effectiveness: number;
}

export interface FeedbackSource {
    source: string;
    type: FeedbackType;
    feedback: string[];
    incorporation: number;
}

export interface MajorChange {
    change: string;
    type: ChangeType;
    timing: number;
    reason: string;
    impact: string;
}

export interface RevisionLearning {
    insights: string[];
    improvements: string[];
    techniques: string[];
    growth: string[];
}

export interface SessionStoryEvent {
    type: 'story_created' | 'story_updated' | 'chapter_added' | 'character_developed' | 'choice_made' | 'story_completed';
    userId: string;
    sessionId: string;
    storyId: string;
    data: Record<string, any>;
    timestamp: Date;
}
