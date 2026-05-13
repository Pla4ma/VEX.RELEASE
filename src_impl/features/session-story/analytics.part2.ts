import { capture } from "../../shared/analytics/analytics-service";


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

export function trackStoryChoicePresented(
  userId: string,
  sessionId: string,
  storyId: string,
  choiceId: string,
  presentedAt: Date,
  choice: {
    title: string;
    description: string;
    context: string;
    stakes: string;
  },
  options: {
    id: string;
    text: string;
    description: string;
    consequences: string[];
    requirements: string[];
    hints: string[];
  }[],
  constraints: {
    timeLimit?: number;
    requirements: string[];
    restrictions: string[];
    penalties: string[];
  },
  guidance: {
    hints: string[];
    recommendations: string[];
    warnings: string[];
  },
): void {
  capture('session_story_choice_presented', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    choice_id: choiceId,
    presented_at: presentedAt.toISOString(),
    choice,
    options,
    constraints,
    guidance,
  });
}

export function trackStoryChoiceMade(
  userId: string,
  sessionId: string,
  storyId: string,
  choiceId: string,
  optionId: string,
  madeAt: Date,
  decisionTime: number,
  reasoning: {
    factors: string[];
    priorities: string[];
    emotions: string[];
    logic: string;
  },
  context: {
    information: string[];
    uncertainty: number;
    pressure: number;
    influence: string[];
  },
  confidence: {
    level: number;
    justification: string;
    doubts: string[];
  },
): void {
  capture('session_story_choice_made', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    choice_id: choiceId,
    option_id: optionId,
    made_at: madeAt.toISOString(),
    decision_time: decisionTime,
    reasoning,
    context,
    confidence,
  });
}