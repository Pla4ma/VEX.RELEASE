import { SessionMode } from '../../../session/modes';
import {
  canTriggerIntervention,
  cleanupSessionCooldown,
  DEFAULT_ACTIVE_SESSION_RULES,
  getGlobalCooldownRemaining,
  getInterventionStats,
  initializeSessionCooldown,
  recordIntervention,
} from '../coach-cooldown';

describe('Coach Cooldown', () => {
  const sessionId = 'test-session-123';

  beforeEach(() => {
    cleanupSessionCooldown(sessionId);
  });

  afterEach(() => {
    cleanupSessionCooldown(sessionId);
  });

  describe('initializeSessionCooldown', () => {
    it('creates initial cooldown state', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);
      const stats = getInterventionStats(sessionId);

      expect(stats.totalInterventions).toBe(0);
      expect(stats.lastInterventionAt).toBeNull();
    });
  });

  describe('recordIntervention', () => {
    it('records intervention successfully', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);

      const rule = DEFAULT_ACTIVE_SESSION_RULES[0];
      recordIntervention(sessionId, rule.id);

      const stats = getInterventionStats(sessionId);
      expect(stats.totalInterventions).toBe(1);
      expect(stats.lastInterventionAt).not.toBeNull();
    });

    it('handles unknown session gracefully', () => {
      const rule = DEFAULT_ACTIVE_SESSION_RULES[0];

      expect(() => {
        recordIntervention('unknown-session', rule.id);
      }).not.toThrow();
    });
  });

  describe('canTriggerIntervention', () => {
    it('allows trigger for new intervention', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);

      const rule = DEFAULT_ACTIVE_SESSION_RULES[0];
      expect(canTriggerIntervention(sessionId, rule)).toBe(true);
    });

    it('disallows trigger when max per session reached', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);

      const rule = DEFAULT_ACTIVE_SESSION_RULES[0];

      for (let i = 0; i < rule.maxPerSession; i++) {
        recordIntervention(sessionId, rule.id);
      }

      expect(canTriggerIntervention(sessionId, rule)).toBe(false);
    });

    it('disallows trigger during cooldown period', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);

      const rule = DEFAULT_ACTIVE_SESSION_RULES[0];
      recordIntervention(sessionId, rule.id);

      expect(canTriggerIntervention(sessionId, rule)).toBe(false);
    });

    it('allows trigger after cooldown expires', async () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);

      const rule = {
        ...DEFAULT_ACTIVE_SESSION_RULES[0],
        cooldownSeconds: 0,
      };

      recordIntervention(sessionId, rule.id);

      expect(canTriggerIntervention(sessionId, rule)).toBe(true);
    });

    it('returns false for unknown session', () => {
      const rule = DEFAULT_ACTIVE_SESSION_RULES[0];
      expect(canTriggerIntervention('unknown-session', rule)).toBe(false);
    });
  });

  describe('getGlobalCooldownRemaining', () => {
    it('returns 0 when no interventions', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);
      expect(getGlobalCooldownRemaining(sessionId)).toBe(0);
    });

    it('returns cooldown after intervention', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);
      recordIntervention(sessionId, 'test-rule');

      const remaining = getGlobalCooldownRemaining(sessionId);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(60);
    });
  });

  describe('getInterventionStats', () => {
    it('returns zero stats for unknown session', () => {
      const stats = getInterventionStats('unknown-session');
      expect(stats.totalInterventions).toBe(0);
      expect(stats.lastInterventionAt).toBeNull();
    });

    it('tracks multiple interventions', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);

      recordIntervention(sessionId, 'rule-1');
      recordIntervention(sessionId, 'rule-2');
      recordIntervention(sessionId, 'rule-3');

      const stats = getInterventionStats(sessionId);
      expect(stats.totalInterventions).toBe(3);
      expect(stats.secondsSinceLastIntervention).not.toBeNull();
    });
  });

  describe('cleanupSessionCooldown', () => {
    it('removes session cooldown data', () => {
      initializeSessionCooldown(sessionId, SessionMode.LIGHT_FOCUS);
      recordIntervention(sessionId, 'test-rule');

      cleanupSessionCooldown(sessionId);

      const stats = getInterventionStats(sessionId);
      expect(stats.totalInterventions).toBe(0);
    });
  });

  describe('DEFAULT_ACTIVE_SESSION_RULES', () => {
    it('has rules with required fields', () => {
      DEFAULT_ACTIVE_SESSION_RULES.forEach((rule) => {
        expect(rule.id).toBeDefined();
        expect(rule.trigger).toBeDefined();
        expect(rule.cooldownSeconds).toBeGreaterThanOrEqual(0);
        expect(rule.maxPerSession).toBeGreaterThan(0);
        expect(rule.messageTemplate).toBeDefined();
        expect(rule.priority).toBeGreaterThan(0);
      });
    });

    it('has streak risk rule with highest priority', () => {
      const streakRiskRule = DEFAULT_ACTIVE_SESSION_RULES.find(
        (r) => r.id === 'streak-risk-warning'
      );
      expect(streakRiskRule).toBeDefined();
      expect(streakRiskRule?.priority).toBe(10);
    });

    it('has unique rule IDs', () => {
      const ids = DEFAULT_ACTIVE_SESSION_RULES.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
