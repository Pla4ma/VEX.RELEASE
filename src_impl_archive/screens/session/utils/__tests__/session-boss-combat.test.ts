import { buildSessionBossCombatEncounter } from '../session-boss-combat';
import type { BossEncounterSummary } from '../../../../features/boss/schemas';

const boss: BossEncounterSummary = {
  id: '11111111-1111-4111-8111-111111111111',
  bossId: '22222222-2222-4222-8222-222222222222',
  bossName: 'Distraction Demon',
  bossAvatarUrl: null,
  healthRemaining: 200,
  maxHealth: 1000,
  percentHealthRemaining: 20,
  status: 'ACTIVE',
  expiresAt: Date.now() + 600000,
  timeRemaining: 600000,
};

describe('buildSessionBossCombatEncounter', () => {
  it('maps active boss health into realtime combat state', () => {
    const result = buildSessionBossCombatEncounter(boss, {
      elapsedSeconds: 120,
      sessionDurationSeconds: 1500,
      sessionId: 'session-1',
      userId: 'user-1',
    });

    expect(result.id).toBe(boss.id);
    expect(result.currentHealth).toBe(200);
    expect(result.maxHealth).toBe(1000);
    expect(result.combatState).toBe('BOSS_RAGE');
    expect(result.timeRemaining).toBe(600);
    expect(result.sessionDuration).toBe(1500);
  });

  it('marks near-death bosses as urgent combat encounters', () => {
    const result = buildSessionBossCombatEncounter(
      { ...boss, healthRemaining: 80, percentHealthRemaining: 8 },
      { elapsedSeconds: 0, sessionDurationSeconds: 0, sessionId: 'session-2', userId: 'user-2' },
    );

    expect(result.combatState).toBe('NEAR_DEATH');
    expect(result.sessionDuration).toBe(1);
  });
});
