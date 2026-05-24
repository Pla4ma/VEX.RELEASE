import {
  resolveFallbackTier,
  renderDeterministicMessage,
  buildDegradedResponse,
  buildDeterministicResponse,
  buildAISuccessResponse,
} from '../ai-fallback-tiers';

describe('AI Fallback Tiers', () => {
  describe('resolveFallbackTier', () => {
    it('returns ai_success when AI is available', () => {
      expect(resolveFallbackTier(true, true, false)).toBe('ai_success');
      expect(resolveFallbackTier(true, false, false)).toBe('ai_success');
    });

    it('returns deterministic_contextual when AI fails but context exists', () => {
      expect(resolveFallbackTier(false, true, true)).toBe('deterministic_contextual');
    });

    it('returns quiet_degradation when AI fails and no context exists', () => {
      expect(resolveFallbackTier(false, false, false)).toBe('quiet_degradation');
      expect(resolveFallbackTier(false, false, true)).toBe('quiet_degradation');
    });
  });

  describe('renderDeterministicMessage', () => {
    it('replaces template variables from context', () => {
      const result = renderDeterministicMessage('streak_nudge', 'medium', {
        hoursRemaining: '3',
        streak: '15',
        duration: '15',
      });
      expect(result).toContain('3h');
      expect(result).toContain('15-day');
    });

    it('falls back to default subKey when specific one missing', () => {
      const result = renderDeterministicMessage('coach_message', 'NONEXISTENT', {
        streak: '7',
        hoursSinceLast: '2',
      });
      expect(result).toContain('7-day');
    });

    it('handles missing context keys gracefully', () => {
      const result = renderDeterministicMessage('coach_message', 'STREAK_RISK', {});
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('renders coach_message with session progress data', () => {
      const result = renderDeterministicMessage('coach_message', 'PROGRESS_REMINDER', {
        level: '12',
        xpToNext: '350',
      });
      expect(result).toContain('12');
      expect(result).toContain('350');
    });

    it('renders comeback_prompt for each day', () => {
      const day1 = renderDeterministicMessage('comeback_prompt', 'day1', {
        sessionsCompleted: '1',
        streakProgress: '33',
      });
      expect(day1).toContain('Day 1');

      const day2 = renderDeterministicMessage('comeback_prompt', 'day2', {
        sessionsCompleted: '2',
        streakProgress: '66',
      });
      expect(day2).toContain('Day 2');

      const day3 = renderDeterministicMessage('comeback_prompt', 'day3', {
        sessionsCompleted: '3',
        streakProgress: '100',
      });
      expect(day3).toContain('Final comeback');
    });

    it('renders streak_nudge for all risk levels', () => {
      const low = renderDeterministicMessage('streak_nudge', 'low', { streak: '10' });
      expect(low).toContain('secure');

      const critical = renderDeterministicMessage('streak_nudge', 'critical', {
        streak: '100',
        minutesRemaining: '5',
      });
      expect(critical).toContain('NOW');
    });
  });

  describe('buildDegradedResponse', () => {
    it('returns empty content with showAI=false', () => {
      const result = buildDegradedResponse('coach_message', 'Gemini quota exhausted');
      expect(result.tier).toBe('quiet_degradation');
      expect(result.content).toBe('');
      expect(result.showAI).toBe(false);
    });

    it('includes debug message', () => {
      const result = buildDegradedResponse('session_summary', 'Missing API key');
      expect(result.debugMessage).toContain('Missing API key');
    });
  });

  describe('buildDeterministicResponse', () => {
    it('returns contextual content with showAI=true', () => {
      const result = buildDeterministicResponse('streak_nudge', 'high', {
        hoursRemaining: '1',
        streak: '50',
        duration: '15',
      });
      expect(result.tier).toBe('deterministic_contextual');
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.showAI).toBe(true);
    });
  });

  describe('buildAISuccessResponse', () => {
    it('returns ai_success tier with content', () => {
      const result = buildAISuccessResponse('Personalized AI message here!');
      expect(result.tier).toBe('ai_success');
      expect(result.content).toBe('Personalized AI message here!');
      expect(result.showAI).toBe(true);
    });
  });

  describe('complete fallback flow', () => {
    it('AI success → AI unavailable with context → no context at all', () => {
      const success = buildAISuccessResponse('Great work on your streak!');
      expect(success.tier).toBe('ai_success');

      const degradedWithContext = buildDeterministicResponse('coach_message', 'STREAK_RISK', {
        streak: '7',
        duration: '15',
      });
      expect(degradedWithContext.tier).toBe('deterministic_contextual');

      const degradedNoContext = buildDegradedResponse('coach_message', 'API timeout');
      expect(degradedNoContext.tier).toBe('quiet_degradation');
      expect(degradedNoContext.content).toBe('');
    });
  });
});
