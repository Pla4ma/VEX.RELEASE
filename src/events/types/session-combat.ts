export interface SessionCombatEventDefinitions {
  'session:combat_initialized': {
    encounterId: string;
    bossId: string;
    bossName: string;
    maxHealth: number;
  };
  'session:combat_attack': {
    sessionId: string;
    userId: string;
    damage: number;
    target: string;
  };
  'session:combat_combo': {
    sessionId: string;
    userId: string;
    comboCount: number;
    damage: number;
  };
  'session:combat_phase_change': {
    sessionId: string;
    previousPhase: string;
    newPhase: string;
  };
  'session:combat_near_death': {
    sessionId: string;
    userId: string;
    healthPercentage: number;
  };
  'session:combat_victory': {
    sessionId: string;
    userId: string;
    bossId: string;
    duration: number;
  };
  'session:boss_defeated': {
    sessionId: string;
    userId: string;
    bossId: string;
    rewards: unknown;
  };
  'session:score:updated': {
    sessionId: string;
    userId: string;
    score: number;
    previousScore: number;
    reason: string;
  };
  'session:bonus:earned': {
    sessionId: string;
    userId: string;
    type: string;
    amount: number;
    description: string;
  };
  'session:damage:taken': {
    sessionId: string;
    userId: string;
    amount: number;
    reason: string;
    remainingHealth?: number;
  };
  'session:anticheat:flag': {
    sessionId: string;
    userId: string;
    flag: unknown;
  };
  'session:anticheat:cleared': {
    sessionId: string;
    userId: string;
    clearedAt: number;
  };
}
