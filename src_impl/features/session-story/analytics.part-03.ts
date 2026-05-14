import { capture } from '../../shared/analytics/analytics-service';

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

export function trackStoryChoiceConsequence(
  userId: string,
  sessionId: string,
  storyId: string,
  choiceId: string,
  optionId: string,
  consequenceId: string,
  triggeredAt: Date,
  consequence: {
    type: 'immediate' | 'delayed' | 'conditional' | 'cumulative';
    description: string;
    severity: string;
    duration: string;
    scope: string;
  },
  effects: {
    narrative: string[];
    character: string[];
    world: string[];
    user: string[];
    future: string[];
  },
  visibility: {
    obvious: boolean;
    hidden: boolean;
    discovered: boolean;
    hinted: boolean;
  },
): void {
  capture('session_story_choice_consequence', {
    user_id: userId,
    session_id: sessionId,
    story_id: storyId,
    choice_id: choiceId,
    option_id: optionId,
    consequence_id: consequenceId,
    triggered_at: triggeredAt.toISOString(),
    consequence,
    effects,
    visibility,
  });
}

// ============================================================================
// CHARACTER ANALYTICS
// ============================================================================

