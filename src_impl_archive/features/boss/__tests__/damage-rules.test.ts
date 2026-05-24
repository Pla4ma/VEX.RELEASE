import { applyBossDamageRules } from '../damage-rules';
import { CalculateDamageInputSchema } from '../schemas';

function buildInput(overrides: Partial<Parameters<typeof applyBossDamageRules>[1]>) {
  return CalculateDamageInputSchema.parse({
    sessionDuration: 1800,
    sessionQuality: 100,
    streakDays: 0,
    squadMultiplier: 1,
    equippedItemIds: [],
    ...overrides,
  });
}

describe('boss damage rules', () => {
  it('blocks non-S-grade damage against The Perfectionist', () => {
    const input = buildInput({
      bossId: 'boss-perfectionist',
      sessionQuality: 94,
    });

    expect(applyBossDamageRules(30, input)).toBe(0);
  });

  it('allows S-grade damage against The Perfectionist', () => {
    const input = buildInput({
      bossId: 'boss-perfectionist',
      sessionQuality: 95,
    });

    expect(applyBossDamageRules(30, input)).toBe(30);
  });

  it('blocks Burnout Beast damage without squad coordination', () => {
    const input = buildInput({
      bossId: 'boss-burnout-beast',
      squadMultiplier: 1,
    });

    expect(applyBossDamageRules(30, input)).toBe(0);
  });

  it('punishes Doomscroller background events', () => {
    const clean = buildInput({ bossId: 'boss-doomscroller' });
    const distracted = buildInput({
      bossId: 'boss-doomscroller',
      backgroundEvents: 2,
    });

    expect(applyBossDamageRules(30, distracted)).toBeLessThan(
      applyBossDamageRules(30, clean),
    );
  });

  it('boosts Monday Demon damage on Monday morning', () => {
    const input = buildInput({
      bossId: 'boss-monday-demon',
      currentDay: 1,
      currentHour: 9,
    });

    expect(applyBossDamageRules(30, input)).toBe(45);
  });
});
