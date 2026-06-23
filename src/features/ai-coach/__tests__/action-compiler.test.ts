import { compileVexAction } from '../action';

const userId = '123e4567-e89b-12d3-a456-426614174000';
const studyPackId = '123e4567-e89b-12d3-a456-426614174010';
const context = {
  userId,
  canStartSession: true,
  canRescueStreak: true,
  allowedStudyPackIds: [studyPackId],
};

describe('compileVexAction', () => {
  it('turns valid LLM output into a confirmation-only action card', () => {
    const result = compileVexAction(
      { type: 'START_SESSION', durationMinutes: 25, mode: 'focus' },
      context,
    );

    expect(result.blockedReasons).toEqual([]);
    expect(result.card).toMatchObject({
      action: { type: 'START_SESSION', durationMinutes: 25 },
      ctaLabel: 'Start session',
      requiresUserConfirmation: true,
    });
  });

  it('blocks actions that fail policy checks', () => {
    const result = compileVexAction(
      { type: 'CONTINUE_STUDY_PLAN', studyPackId: userId },
      context,
    );

    expect(result.blockedReasons).toEqual([
      'Study plan is not available to this user.',
    ]);
    expect(result.card.action).toMatchObject({ type: 'NO_ACTION' });
  });

  it('falls back safely when LLM output is not schema-valid', () => {
    const result = compileVexAction(
      { type: 'START_SESSION', durationMinutes: 1, mode: 'focus' },
      context,
    );

    expect(result.card.action).toMatchObject({
      type: 'NO_ACTION',
      reason: 'Coach could not turn this into a safe action.',
    });
  });
});
