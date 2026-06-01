import {
  describe,
  expect,
  it,
  vexStartSession,
  expectData,
  GATE_OPEN,
  GATE_CLOSED,
  validStartSession,
} from './helpers';

describe('VexAction Boundaries', () => {
  describe('start_session', () => {
    it('returns success with valid input', () => {
      const result = vexStartSession(validStartSession, GATE_OPEN);
      expect(result.status).toBe('success');
      expect(result.data).toHaveProperty('lane', 'minimal_normal');
      expect(result.data).toHaveProperty('userFacingModeName', 'Clean');
      expect(result.data).toHaveProperty('ctaLabel');
      expect(result.data).toHaveProperty('successCondition');
    });

    it('fails validation on invalid lane', () => {
      const result = vexStartSession(
        { ...validStartSession, lane: 'invalid' },
        GATE_OPEN,
      );
      expect(result.status).toBe('validation_error');
    });

    it('is blocked when gate is closed', () => {
      const result = vexStartSession(validStartSession, GATE_CLOSED);
      expect(result.status).toBe('feature_blocked');
    });

    it('generates lane-adaptive output (not static)', () => {
      const student = vexStartSession(
        { ...validStartSession, lane: 'student' },
        GATE_OPEN,
      );
      const game = vexStartSession(
        { ...validStartSession, lane: 'game_like' },
        GATE_OPEN,
      );
      expect(expectData(student.data, 'sessionMode')).not.toBe(
        expectData(game.data, 'sessionMode'),
      );
    });
  });
});
