import { generateCoachPrompt, shouldCoachIntervene } from '../context-snapshot';
import { createTestSnapshot } from './context-snapshot-fixtures';

describe('generateCoachPrompt', () => {
  it('includes user context in prompt', () => {
    const snapshot = createTestSnapshot();
    const prompt = generateCoachPrompt(snapshot);
    expect(prompt).toContain('VEX AI Coach');
    expect(prompt).toContain('Streak: 5 days');
    expect(prompt).toContain('Level: 7');
  });

  it('includes critical priority for at-risk streak', () => {
    const snapshot = createTestSnapshot({
      streakContext: { streakAtRisk: true, hoursSinceLastSession: 20 },
    });
    const prompt = generateCoachPrompt(snapshot);
    expect(prompt).toContain('CRITICAL');
    expect(prompt).toContain('streak is at risk');
  });
});

describe('shouldCoachIntervene', () => {
  it('returns false if recent intervention', () => {
    const snapshot = createTestSnapshot({
      streakContext: { hoursSinceLastSession: 25 },
      temporalContext: { hourOfDay: 9 },
    });
    expect(
      shouldCoachIntervene(snapshot, Date.now() - 2 * 60 * 60 * 1000),
    ).toBe(false);
  });

  it('returns true for at-risk streak after cooldown period', () => {
    const snapshot = createTestSnapshot({
      streakContext: { streakAtRisk: true, hoursSinceLastSession: 20 },
    });
    expect(
      shouldCoachIntervene(snapshot, Date.now() - 5 * 60 * 60 * 1000),
    ).toBe(true);
  });

  it('returns true for optimal time', () => {
    const snapshot = createTestSnapshot({
      temporalContext: { hourOfDay: 9 },
    });
    expect(
      shouldCoachIntervene(snapshot, Date.now() - 5 * 60 * 60 * 1000),
    ).toBe(true);
  });
});
