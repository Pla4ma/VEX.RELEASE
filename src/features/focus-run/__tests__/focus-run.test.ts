import {
  buildFocusRunDisplay,
  computeFocusRunGrade,
  resolvePersonalBoss,
} from '../service';
import type { FocusRun, FocusRunGrade } from '../schemas';

const MOCK_RUN: FocusRun = {
  bossId: null,
  cleanStarts: 0,
  completedEncounters: 0,
  events: [],
  finalGrade: null,
  id: 'run-1',
  modifiers: ['Phone away', 'One tab'],
  recoveryWins: 0,
  reflectionUpgrades: 0,
  status: 'active',
  userId: 'user-1',
  weekStartsAt: 1,
};

// =========================================================================
// Phase 5 — Test 1: Run lane has no shop/inventory/wallet.
// =========================================================================
it('Run lane display contains no shop, inventory, or wallet references', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 0,
    lane: 'game_like',
    run: MOCK_RUN,
  });

  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/shop/i);
  expect(serialized).not.toMatch(/inventory/i);
  expect(serialized).not.toMatch(/wallet/i);
});

// =========================================================================
// Phase 5 — Test 2: Run lane has no wagers.
// =========================================================================
it('Run lane display has no wager references', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 0,
    lane: 'game_like',
    run: MOCK_RUN,
  });

  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/wager/i);
  expect(serialized).not.toMatch(/bet/i);
  expect(serialized).not.toMatch(/gamble/i);
});

// =========================================================================
// Phase 5 — Test 3: Run lane has no battle pass.
// =========================================================================
it('Run lane display has no battle pass references', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 0,
    lane: 'game_like',
    run: MOCK_RUN,
  });

  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/battle.?pass/i);
  expect(serialized).not.toMatch(/premium/i);
  expect(serialized).not.toMatch(/tier/i);
});

// =========================================================================
// Phase 5 — Test 4: Personal boss requires evidence after Day 3.
// =========================================================================
it('personal boss is teaser when less than 3 days of evidence exist', () => {
  const boss = resolvePersonalBoss({
    firstActiveDay: weekStartDaysAgo(0),
    signals: ['scrolling', 'scrolling again', 'distracted by feed'],
    now: nowForDaysAgo(0),
  });

  expect(boss.observedDays).toBeLessThan(3);
  expect(boss.isTeaser).toBe(true);
  expect(boss.isEvidenceBased).toBe(false);
});

it('personal boss is evidence-based after 3+ days with 2+ signals', () => {
  const boss = resolvePersonalBoss({
    firstActiveDay: weekStartDaysAgo(5),
    signals: ['deadline avoidance', 'deadline late', 'deadline pressure'],
    now: nowForDaysAgo(0),
  });

  expect(boss.observedDays).toBeGreaterThanOrEqual(3);
  expect(boss.isEvidenceBased).toBe(true);
  expect(boss.isTeaser).toBe(false);
  expect(boss.archetype).toBe('deadline_wraith');
});

// =========================================================================
// Phase 5 — Test 5: Cold game-like user gets tiny teaser only.
// =========================================================================
it('cold game-like user with no signals gets teaser boss', () => {
  const boss = resolvePersonalBoss({
    firstActiveDay: 0,
    signals: [],
  });

  expect(boss.isTeaser).toBe(true);
  expect(boss.isEvidenceBased).toBe(false);
  expect(boss.archetype).toBe('cold_start_shadow');
  expect(boss.name).toBe('Cold Start Shadow');
  expect(boss.recoveryPrompt).toContain('Start one small encounter');
});

// =========================================================================
// Phase 5 — Test 6: Minimal user never sees boss full CTA.
// =========================================================================
it('minimal_normal lane has no run board and no boss CTA', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 10,
    lane: 'minimal_normal',
    run: MOCK_RUN,
  });

  expect(display.laneAllowed).toBe(false);
  expect(display.title).toContain('hidden');

  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/face.*boss/i);
  expect(serialized).not.toMatch(/full cta/i);
});

// =========================================================================
// Phase 5 — Test 7: Game-like completion shows run recap, no currency.
// =========================================================================
it('completed game-like run display shows recap without currency', () => {
  const completedRun: FocusRun = {
    ...MOCK_RUN,
    cleanStarts: 3,
    completedEncounters: 5,
    recoveryWins: 2,
    reflectionUpgrades: 1,
    status: 'completed',
  };

  const display = buildFocusRunDisplay({
    firstActiveDay: 10,
    lane: 'game_like',
    run: completedRun,
  });

  expect(display.completedEncounters).toBe(5);
  expect(display.cleanStarts).toBe(3);
  expect(display.recoveryWins).toBe(2);

  expect(display.finalGrade).not.toBeNull();

  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/coin/i);
  expect(serialized).not.toMatch(/gem/i);
  expect(serialized).not.toMatch(/currency/i);
  expect(serialized).not.toMatch(/reward/i);
});

// =========================================================================
// Phase 5 — Test 8: Achievements are behavior-based.
// (Focus run does not reference the achievement catalog directly,
//  so we assert that no economy/coin/gem reward fields leak.)
// =========================================================================
it('focus run display has no achievement economy reward fields', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 10,
    lane: 'game_like',
    run: { ...MOCK_RUN, completedEncounters: 4 },
  });

  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/"coins"/i);
  expect(serialized).not.toMatch(/"gems"/i);
  expect(serialized).not.toMatch(/"spend"/i);
  expect(serialized).not.toMatch(/"currency"/i);
});

// =========================================================================
// FocusRun grade computation
// =========================================================================
describe('computeFocusRunGrade', () => {
  const gradeCases: Array<{
    encounters: number;
    clean: number;
    recovery: number;
    upgrades: number;
    expected: FocusRunGrade;
  }> = [
    { encounters: 0, clean: 0, recovery: 0, upgrades: 0, expected: 'D' },
    { encounters: 2, clean: 0, recovery: 0, upgrades: 0, expected: 'C' },
    { encounters: 3, clean: 2, recovery: 0, upgrades: 0, expected: 'B' },
    { encounters: 6, clean: 2, recovery: 2, upgrades: 1, expected: 'A' },
    { encounters: 8, clean: 3, recovery: 3, upgrades: 2, expected: 'S' },
  ];

  for (const tc of gradeCases) {
    it(`grade=${tc.expected} for encounters=${tc.encounters} clean=${tc.clean} recovery=${tc.recovery} upgrades=${tc.upgrades}`, () => {
      const run: FocusRun = {
        ...MOCK_RUN,
        cleanStarts: tc.clean,
        completedEncounters: tc.encounters,
        recoveryWins: tc.recovery,
        reflectionUpgrades: tc.upgrades,
        status: 'completed',
      };
      expect(computeFocusRunGrade(run)).toBe(tc.expected);
    });
  }
});

// =========================================================================
// Helpers
// =========================================================================

function weekStartDaysAgo(daysAgo: number): number {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
}

function nowForDaysAgo(_daysAgo: number): number {
  return Date.now();
}
