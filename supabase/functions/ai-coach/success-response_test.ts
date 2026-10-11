import { buildModelSuccessResponse } from './success-response.ts';
import {
  AIRequestSchema,
  AgentContextSnapshotSchema,
  CoachAgentDecisionSchema,
  CoachPayloadSchema,
  type AgentContextSnapshot,
  type AgentDecisionRequest,
} from './schemas.ts';

const userId = '550e8400-e29b-41d4-a716-446655440000';

Deno.test('agent decisions return a server-bound structured envelope', () => {
  const request = buildAgentRequest({ activeStudyPackId: 'pack-1' });
  const response = buildModelSuccessResponse(
    request,
    JSON.stringify({
      type: 'CONTINUE_STUDY_PLAN',
      message: 'Continue the plan you started.',
      reasonCode: 'ACTIVE_STUDY_PLAN',
      confidence: 0.8,
    }),
    'test-model',
    100,
    false,
    14,
    7,
  );
  const decision = CoachAgentDecisionSchema.parse(response.structuredData);

  assert(response.content === decision.message, 'Response content lost the decision message');
  assert(decision.userId === userId, 'Decision identity was not bound to the request');
  assert(decision.actionPayload?.studyPackId === 'pack-1', 'Study action was not bound to the active plan');
  assert(decision.evidence.studyPackIds?.[0] === 'pack-1', 'Study evidence was not bound to the active plan');
  assert(decision.policy.canAutoExecute === false, 'Agent decision can auto-execute');
  assert(response.metadata.tokensUsed === 21, 'Provider token usage was not preserved');
});

Deno.test('invalid model decisions use the context-aware deterministic fallback', () => {
  const request = buildAgentRequest({ lowEnergyPattern: true });
  const response = buildModelSuccessResponse(request, 'not JSON', 'test-model', 0, false);
  const decision = CoachAgentDecisionSchema.parse(response.structuredData);

  assert(decision.type === 'START_SESSION', 'Invalid model output did not fall back to a safe action');
  assert(decision.reasonCode === 'LOW_ENERGY_PATTERN', 'Fallback ignored the low-energy signal');
  assert(response.metadata.fallbackUsed, 'Deterministic fallback was not reported');
});

Deno.test('agent policy blocks unsupported plans and actions after completion', () => {
  const unsupportedRescue = buildModelSuccessResponse(
    buildAgentRequest(),
    decisionJson('RESCUE_STREAK', 'STREAK_AT_RISK'),
    'test-model',
    0,
    false,
  );
  const unsupportedDecision = CoachAgentDecisionSchema.parse(unsupportedRescue.structuredData);
  assert(unsupportedDecision.type === 'START_SESSION', 'Unsupported streak rescue was accepted');

  const completed = buildModelSuccessResponse(
    buildAgentRequest({ completedToday: true }),
    decisionJson('START_SESSION', 'RECENT_MISSED_SESSION'),
    'test-model',
    0,
    false,
  );
  const completedDecision = CoachAgentDecisionSchema.parse(completed.structuredData);
  assert(completedDecision.type === 'NO_ACTION', 'Agent nudged a user after a completed session');
});

Deno.test('agent does not rescue when the streak is no longer active', () => {
  const response = buildModelSuccessResponse(
    buildAgentRequest({ currentStreak: 0, hoursUntilStreakDeadline: 0 }),
    decisionJson('RESCUE_STREAK', 'STREAK_AT_RISK'),
    'test-model',
    0,
    false,
  );
  const decision = CoachAgentDecisionSchema.parse(response.structuredData);

  assert(decision.type === 'START_SESSION', 'Inactive streak was incorrectly rescued');
  assert(response.metadata.fallbackUsed, 'Unsafe rescue did not trigger fallback');
});

Deno.test('agent cannot claim the user has finished when they have not', () => {
  const response = buildModelSuccessResponse(
    buildAgentRequest(),
    decisionJson('NO_ACTION', 'ENOUGH_DONE_TODAY'),
    'test-model',
    0,
    false,
  );
  const decision = CoachAgentDecisionSchema.parse(response.structuredData);

  assert(decision.type === 'START_SESSION', 'Unsupported completion claim was accepted');
  assert(response.metadata.fallbackUsed, 'False completion claim did not trigger fallback');
});

Deno.test('coach output normalization reaches both content and structured data', () => {
  const request = AIRequestSchema.parse({
    requestType: 'GENERATE_COACH_MESSAGE',
    userId,
    context: { category: 'MOTIVATION_BOOST' },
  });
  if (request.requestType !== 'GENERATE_COACH_MESSAGE') {
    throw new Error('Coach request was not parsed');
  }
  const response = buildModelSuccessResponse(
    request,
    'Welcome to the team, let’s get started on our first match. Your focus is ready.',
    'test-model',
    0,
    false,
  );
  const payload = CoachPayloadSchema.parse(response.structuredData);

  assert(response.content === 'Start with one clear target. Your focus is ready.', 'Normalized coach text was discarded');
  assert(payload.message === response.content, 'Structured coach message differs from delivered text');
});

function buildAgentRequest(
  overrides: Partial<AgentContextSnapshot> = {},
): AgentDecisionRequest {
  const context = AgentContextSnapshotSchema.parse({
    userId,
    isOnline: true,
    completedToday: false,
    currentStreak: 4,
    hoursUntilStreakDeadline: 6,
    recentSessionIds: ['session-1'],
    activeStudyPackId: null,
    lowEnergyPattern: false,
    trustLevel: 'normal',
    ...overrides,
  });
  const request = AIRequestSchema.parse({
    requestType: 'GENERATE_AGENT_DECISION',
    userId,
    context,
  });
  if (request.requestType !== 'GENERATE_AGENT_DECISION') {
    throw new Error('Agent request was not parsed');
  }
  return request;
}

function decisionJson(type: string, reasonCode: string): string {
  return JSON.stringify({
    type,
    message: 'Take one steady next step.',
    reasonCode,
    confidence: 0.7,
  });
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
