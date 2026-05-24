import type { CommunicationPattern, ConflictPattern, GrowthPattern, RelationshipEvolution, RelationshipHistory, RelationshipSignificance, SupportPattern } from './types';

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
  significance: 'minor' | 'major' | 'transformative';
}

export interface MotivationCatalyst {
  event: string;
  impact: number; // 0-100
  timing: number; // story position
  type: CatalystType;
}

export type CatalystType = 'trauma' | 'revelation' | 'relationship' | 'achievement' | 'failure' | 'discovery' | 'choice' | 'sacrifice';

export interface MotivationGrowth {
  direction: GrowthDirection;
  maturity: number; // 0-100
  authenticity: number; // 0-100
  integration: number; // 0-100
}

export type GrowthDirection = 'simplifying' | 'complexifying' | 'deepening' | 'broadening' | 'transforming' | 'integrating';

export interface CharacterArc {
  type: ArcType;
  trajectory: ArcTrajectory;
  stages: ArcStage[];
  transformation: CharacterTransformation;
  resolution: ArcResolution;
  significance: ArcSignificance;
}

export type ArcType = 'growth' | 'fall' | 'redemption' | 'discovery' | 'corruption' | 'sacrifice' | 'mastery' | 'liberation' | 'integration' | 'transcendence';

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

export type TrajectoryPath = 'linear' | 'spiral' | 'zigzag' | 'plateau' | 'collapse' | 'rebirth' | 'integration';

export interface ArcObstacle {
  obstacle: string;
  type: ObstacleType;
  severity: 'minor' | 'major' | 'critical' | 'existential';
  timing: number; // story position
  overcome: boolean;
  method?: string;
}

export type ObstacleType = 'internal' | 'external' | 'interpersonal' | 'societal' | 'existential' | 'supernatural';

export interface ArcMilestone {
  milestone: string;
  significance: 'minor' | 'major' | 'critical' | 'transformative';
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

export type TransformationMethod = 'gradual' | 'sudden' | 'forced' | 'chosen' | 'discovered' | 'earned' | 'gifted' | 'sacrificed';

export interface ArcResolution {
  type: ResolutionOutcome;
  satisfaction: number; // 0-100
  closure: number; // 0-100
  meaning: number; // 0-100
  impact: string;
}

export type ResolutionOutcome = 'triumph' | 'tragedy' | 'bittersweet' | 'ambiguous' | 'transcendent' | 'cyclical' | 'open' | 'poetic';

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

export type RelationshipType = 'family' | 'friend' | 'romantic' | 'mentor' | 'rival' | 'ally' | 'enemy' | 'colleague' | 'acquaintance' | 'stranger' | 'symbolic';

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
  acceptance: number; // 0-100
}

export interface IntimacyLevel {
  emotional: number; // 0-100
  intellectual: number; // 0-100
  physical: number; // 0-100
  spiritual: number; // 0-100
  shared_history: number; // 0-100
}

