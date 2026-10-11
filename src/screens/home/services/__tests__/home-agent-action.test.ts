import { resolveHomeAgentIntent, homeAgentActionLabel } from '../home-agent-action';
import {
  CoachAgentDecisionSchema,
  type CoachAgentDecision,
} from '../../../../features/invisible-agent';

function decision(type: CoachAgentDecision['type']): CoachAgentDecision {
  return CoachAgentDecisionSchema.parse({
    decisionId: `decision-${type}`,
    userId: 'user-1',
    type,
    message: 'A useful next step is ready.',
    reasonCode: 'RECENT_MISSED_SESSION',
    confidence: 0.8,
    expiresAt: '2026-08-30T12:00:00.000Z',
    evidence: {},
    policy: { requiresUserConfirmation: true, canAutoExecute: false },
  });
}

describe('home agent action bridge', () => {
  it('maps every agent decision to a safe destination', () => {
    expect(resolveHomeAgentIntent(decision('START_SESSION'))).toBe('start-session');
    expect(resolveHomeAgentIntent(decision('RESCUE_STREAK'))).toBe('start-session');
    expect(resolveHomeAgentIntent(decision('CONTINUE_STUDY_PLAN'))).toBe('continue-study');
    expect(resolveHomeAgentIntent(decision('REVIEW_PROGRESS'))).toBe('review-progress');
    expect(resolveHomeAgentIntent(decision('NO_ACTION'))).toBe('review-progress');
  });

  it('keeps action labels aligned with the decision type', () => {
    expect(homeAgentActionLabel(decision('START_SESSION'))).toBe('Start focus');
    expect(homeAgentActionLabel(decision('RESCUE_STREAK'))).toBe('Start rescue');
    expect(homeAgentActionLabel(decision('CONTINUE_STUDY_PLAN'))).toBe('Continue study');
    expect(homeAgentActionLabel(decision('REVIEW_PROGRESS'))).toBe('Review progress');
    expect(homeAgentActionLabel(decision('NO_ACTION'))).toBe('Review progress');
  });
});
