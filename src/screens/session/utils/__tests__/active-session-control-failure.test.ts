import {
  buildActiveSessionControlFailure,
  type ActiveSessionControlAction,
} from '../active-session-control-failure';

describe('buildActiveSessionControlFailure', () => {
  it.each<ActiveSessionControlAction>(['pause', 'complete', 'abandon'])(
    'builds user-facing recovery copy for %s failures',
    (action) => {
      const failure = buildActiveSessionControlFailure(action);

      expect(failure.action).toBe(action);
      expect(failure.title.length).toBeGreaterThan(0);
      expect(failure.message).toContain('Retry');
      expect(failure.supportHint).toContain('saved');
    },
  );
});
