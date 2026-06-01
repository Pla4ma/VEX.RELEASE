import { decideNudge } from '../service';

describe('notification policy — context routing', () => {
  describe('decideNudge — context routing', () => {
    it('routes avoidance context to rescue type', () => {
      const result = decideNudge({
        lane: 'minimal_normal',
        completedSessions: 2,
        daysSinceOnboarding: 2,
        context: 'avoidance',
      });
      expect(result.type).toBe('rescue');
      expect(result.allowed).toBe(true);
      expect(result.priority).toBe('high');
    });

    it('routes deadline context + student lane to study_deadline', () => {
      const result = decideNudge({
        lane: 'student',
        completedSessions: 2,
        daysSinceOnboarding: 2,
        context: 'deadline',
      });
      expect(result.type).toBe('study_deadline');
      expect(result.priority).toBe('high');
    });

    it('routes project_stale + deep_creative to project_resume', () => {
      const result = decideNudge({
        lane: 'deep_creative',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        context: 'project_stale',
      });
      expect(result.type).toBe('project_resume');
    });

    it('routes run_open + game_like to run_continue', () => {
      const result = decideNudge({
        lane: 'game_like',
        completedSessions: 5,
        daysSinceOnboarding: 4,
        context: 'run_open',
      });
      expect(result.type).toBe('run_continue');
    });

    it('routes weekly_ready context to weekly_insight', () => {
      const result = decideNudge({
        lane: 'student',
        completedSessions: 3,
        daysSinceOnboarding: 5,
        context: 'weekly_ready',
      });
      expect(result.type).toBe('weekly_insight');
    });

    it('returns gentle_return when user has completed sessions and no special context', () => {
      const result = decideNudge({
        lane: 'student',
        completedSessions: 2,
        daysSinceOnboarding: 2,
      });
      expect(result.type).toBe('gentle_return');
      expect(result.allowed).toBe(true);
    });

    it('returns none when no sessions completed and no context', () => {
      const result = decideNudge({
        lane: 'student',
        completedSessions: 0,
        daysSinceOnboarding: 2,
      });
      expect(result.allowed).toBe(false);
    });
  });
});
