import { FALLBACK_CONTENT } from '../ai-fallback-content';
import { SYSTEM_PROMPTS, USER_PROMPT_TEMPLATES } from '../ai-prompts';
import { VALIDATION_RULES, RATE_LIMITS, AI_FEATURE_FLAGS } from '../ai-constants';

describe('ai-fallback-content', () => {
  it('has coach message categories', () => {
    expect(FALLBACK_CONTENT.COACH_MESSAGE).toBeDefined();
    expect(FALLBACK_CONTENT.COACH_MESSAGE.STREAK_RISK.length).toBeGreaterThan(0);
    expect(FALLBACK_CONTENT.COACH_MESSAGE.SESSION_SUGGESTION.length).toBeGreaterThan(0);
    expect(FALLBACK_CONTENT.COACH_MESSAGE.MILESTONE_HYPE.length).toBeGreaterThan(0);
    expect(FALLBACK_CONTENT.COACH_MESSAGE.COMEBACK_SUPPORT.length).toBeGreaterThan(0);
    expect(FALLBACK_CONTENT.COACH_MESSAGE.POST_FAILURE.length).toBeGreaterThan(0);
    expect(FALLBACK_CONTENT.COACH_MESSAGE.PROGRESS_REMINDER.length).toBeGreaterThan(0);
    expect(FALLBACK_CONTENT.COACH_MESSAGE.MOTIVATION_BOOST.length).toBeGreaterThan(0);
    expect(FALLBACK_CONTENT.COACH_MESSAGE.BREAK_SUGGESTION.length).toBeGreaterThan(0);
  });

  it('has session summary periods', () => {
    expect(FALLBACK_CONTENT.SESSION_SUMMARY.daily).toBeDefined();
    expect(FALLBACK_CONTENT.SESSION_SUMMARY.weekly).toBeDefined();
    expect(FALLBACK_CONTENT.SESSION_SUMMARY.monthly).toBeDefined();
  });

  it('has comeback prompts for all 3 days', () => {
    expect(FALLBACK_CONTENT.COMEBACK_PROMPT.day1).toContain('Day 1');
    expect(FALLBACK_CONTENT.COMEBACK_PROMPT.day2).toContain('Day 2');
    expect(FALLBACK_CONTENT.COMEBACK_PROMPT.day3).toContain('Comeback complete');
  });

  it('has streak risk nudge levels', () => {
    expect(FALLBACK_CONTENT.STREAK_RISK_NUDGE.critical).toContain('CRITICAL');
    expect(FALLBACK_CONTENT.STREAK_RISK_NUDGE.high).toContain('at risk');
    expect(FALLBACK_CONTENT.STREAK_RISK_NUDGE.medium).toContain('warning');
    expect(FALLBACK_CONTENT.STREAK_RISK_NUDGE.low).toContain('Heads up');
  });

  it('has weekly reflection default', () => {
    expect(FALLBACK_CONTENT.WEEKLY_REFLECTION.default).toContain('Week at a Glance');
  });

  it('all fallback Coach messages are non-empty strings', () => {
    for (const [category, messages] of Object.entries(FALLBACK_CONTENT.COACH_MESSAGE)) {
      for (const msg of messages) {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('ai-prompts', () => {
  it('has system prompts for all categories', () => {
    expect(SYSTEM_PROMPTS.COACH_MESSAGE).toBeDefined();
    expect(SYSTEM_PROMPTS.SESSION_SUMMARY).toBeDefined();
    expect(SYSTEM_PROMPTS.COMEBACK_PROMPT).toBeDefined();
    expect(SYSTEM_PROMPTS.STREAK_RISK_NUDGE).toBeDefined();
    expect(SYSTEM_PROMPTS.WEEKLY_REFLECTION).toBeDefined();
  });

  it('system prompts are non-empty strings', () => {
    for (const [key, prompt] of Object.entries(SYSTEM_PROMPTS)) {
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(10);
    }
  });

  it('coach message prompt mentions VEX identity', () => {
    expect(SYSTEM_PROMPTS.COACH_MESSAGE).toContain('VEX');
  });

  it('coach message prompt forbids mentioning AI', () => {
    expect(SYSTEM_PROMPTS.COACH_MESSAGE.toLowerCase()).toContain('never mention being an ai');
  });

  it('has user prompt templates for all categories', () => {
    expect(USER_PROMPT_TEMPLATES.COACH_MESSAGE).toContain('{{category}}');
    expect(USER_PROMPT_TEMPLATES.SESSION_SUMMARY).toContain('{{sessionCount}}');
    expect(USER_PROMPT_TEMPLATES.COMEBACK_PROMPT).toContain('{{comebackDay}}');
    expect(USER_PROMPT_TEMPLATES.STREAK_RISK_NUDGE).toContain('{{currentStreak}}');
    expect(USER_PROMPT_TEMPLATES.WEEKLY_REFLECTION).toContain('{{weekNumber}}');
  });
});

describe('ai-constants', () => {
  describe('VALIDATION_RULES', () => {
    it('has rules for all AI request categories', () => {
      expect(VALIDATION_RULES.COACH_MESSAGE).toBeDefined();
      expect(VALIDATION_RULES.SESSION_SUMMARY).toBeDefined();
      expect(VALIDATION_RULES.COMEBACK_PROMPT).toBeDefined();
      expect(VALIDATION_RULES.STREAK_RISK_NUDGE).toBeDefined();
      expect(VALIDATION_RULES.WEEKLY_REFLECTION).toBeDefined();
    });

    it('coach message has non-empty forbidden patterns', () => {
      expect(VALIDATION_RULES.COACH_MESSAGE.forbiddenPatterns.length).toBeGreaterThan(0);
    });

    it('coach message forbidden patterns match AI identity phrases', () => {
      const patterns = VALIDATION_RULES.COACH_MESSAGE.forbiddenPatterns;
      const testPhrases = ['I am an AI', 'As an AI', 'I am just', 'I cannot', 'I do not have'];
      for (const phrase of testPhrases) {
        const matches = patterns.some((p) => p.test(phrase));
        expect(matches).toBe(true);
      }
    });

    it('session summary has required sections', () => {
      expect(VALIDATION_RULES.SESSION_SUMMARY.requiredSections).toContain('headline');
      expect(VALIDATION_RULES.SESSION_SUMMARY.requiredSections).toContain('reflection');
    });

    it('has min/max length constraints', () => {
      expect(VALIDATION_RULES.COACH_MESSAGE.minLength).toBe(10);
      expect(VALIDATION_RULES.COACH_MESSAGE.maxLength).toBe(1000);
      expect(VALIDATION_RULES.SESSION_SUMMARY.minLength).toBe(50);
      expect(VALIDATION_RULES.SESSION_SUMMARY.maxLength).toBe(2000);
    });
  });

  describe('RATE_LIMITS', () => {
    it('has rate limit constants', () => {
      expect(RATE_LIMITS.PER_USER_PER_MINUTE).toBe(10);
      expect(RATE_LIMITS.PER_USER_PER_HOUR).toBe(100);
      expect(RATE_LIMITS.PER_APP_PER_MINUTE).toBe(1000);
    });

    it('rates are positive integers', () => {
      expect(RATE_LIMITS.PER_USER_PER_MINUTE).toBeGreaterThan(0);
      expect(RATE_LIMITS.PER_USER_PER_HOUR).toBeGreaterThan(0);
      expect(RATE_LIMITS.PER_APP_PER_MINUTE).toBeGreaterThan(0);
    });
  });

  describe('AI_FEATURE_FLAGS', () => {
    it('has all feature flag keys', () => {
      expect(AI_FEATURE_FLAGS.AI_ENABLED).toBe('ai_enabled');
      expect(AI_FEATURE_FLAGS.AI_CACHE_ENABLED).toBe('ai_cache_enabled');
      expect(AI_FEATURE_FLAGS.AI_FALLBACK_ENABLED).toBe('ai_fallback_enabled');
      expect(AI_FEATURE_FLAGS.AI_COACH_MESSAGES).toBe('ai_coach_messages');
      expect(AI_FEATURE_FLAGS.AI_SESSION_SUMMARIES).toBe('ai_session_summaries');
      expect(AI_FEATURE_FLAGS.AI_COMEBACK_PROMPTS).toBe('ai_comeback_prompts');
      expect(AI_FEATURE_FLAGS.AI_STREAK_NUDGES).toBe('ai_streak_nudges');
      expect(AI_FEATURE_FLAGS.AI_WEEKLY_REFLECTIONS).toBe('ai_weekly_reflections');
    });
  });
});
