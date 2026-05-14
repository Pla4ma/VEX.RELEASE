import { capture } from '../../shared/analytics/analytics-service';

export function trackNarrativeBranchTaken(
  userId: string,
  sessionId: string,
  storyId: string,
  branchId: string,
  branchType: 'choice' | 'consequence' | 'random' | 'conditional',
  takenAt: Date,
  decision: {
    option: string;
    reasoning: string;
    confidence: number;
    timeSpent: number;
  },
  context: {
    chapter: number;
    scene: number;
    situation: string;
    characters: string[];
    stakes: string;
  },
  consequences: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    hidden: string[];
  },
  alternatives: {
    notTaken: string[];
    unavailable: string[];
    future: string[];
  },
): void {
  capture('session_story_narrative_branch_taken', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    branch_id: branchId,
    branch_type: branchType,
    taken_at: takenAt.toISOString(),
    decision,
    context,
    consequences,
    alternatives,
  });
}

export function trackNarrativeCharacterIntroduced(
  userId: string,
  sessionId: string,
  storyId: string,
  characterId: string,
  characterName: string,
  characterType: 'protagonist' | 'antagonist' | 'supporting' | 'npc' | 'mentor' | 'companion',
  introducedAt: Date,
  introduction: {
    method: string;
    context: string;
    significance: string;
    role: string;
  },
  characteristics: {
    personality: string[];
    appearance: string;
    background: string;
    motivations: string[];
    conflicts: string[];
  },
  relationships: {
    withUser: string;
    withOthers: Record<string, string>;
    dynamics: string[];
  },
): void {
  capture('session_story_narrative_character_introduced', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    character_id: characterId,
    character_name: characterName,
    character_type: characterType,
    introduced_at: introducedAt.toISOString(),
    introduction,
    characteristics,
    relationships,
  });
}

export function trackNarrativeTwistRevealed(
  userId: string,
  sessionId: string,
  storyId: string,
  twistId: string,
  twistType: 'plot' | 'character' | 'world' | 'motivation' | 'identity' | 'time',
  revealedAt: Date,
  revelation: {
    method: string;
    timing: string;
    buildup: string;
    payoff: string;
  },
  impact: {
    shock: number;
    surprise: number;
    satisfaction: number;
    confusion: number;
  },
  context: {
    expectations: string[];
    clues: string[];
    misdirection: string[];
    foreshadowing: string[];
  },
  aftermath: {
    understanding: number;
    acceptance: number;
    reevaluation: number;
    speculation: string[];
  },
): void {
  capture('session_story_narrative_twist_revealed', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    twist_id: twistId,
    twist_type: twistType,
    revealed_at: revealedAt.toISOString(),
    revelation,
    impact,
    context,
    aftermath,
  });
}

// ============================================================================
// CHOICE ANALYTICS
// ============================================================================

