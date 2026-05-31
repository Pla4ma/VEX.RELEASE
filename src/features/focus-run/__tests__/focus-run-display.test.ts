import { buildFocusRunDisplay } from './focus-run.helpers';
import { MOCK_RUN } from './focus-run.helpers';
import type { FocusRun } from '../schemas';

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

it('Run Day 0 — new user sees tiny teaser preview, no full Run board', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 0,
    lane: 'game_like',
    run: null,
    signals: [],
  });
  expect(display.laneAllowed).toBe(true);
  expect(display.blocker.isTeaser).toBe(true);
  expect(display.blocker.isEvidenceBased).toBe(false);
  expect(display.completedRuns).toBe(0);
  expect(display.finalGrade).toBeNull();
  expect(display.weekSummary).toBe('No runs yet this week.');
  expect(display.title).toBe('Weekly Momentum');
});

it('minimal_normal lane has no run board and no boss CTA', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 10,
    lane: 'minimal_normal',
    run: MOCK_RUN,
  });
  expect(display.laneAllowed).toBe(false);
  expect(display.title).toContain('hidden');
  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/face.*blocker/i);
  expect(serialized).not.toMatch(/full cta/i);
});

it('student lane hides run board', () => {
  const display = buildFocusRunDisplay({
    lane: 'student',
    run: MOCK_RUN,
  });
  expect(display.laneAllowed).toBe(false);
  expect(display.title).toContain('hidden');
});

it('completed game-like run display shows recap without currency', () => {
  const completedRun: FocusRun = {
    ...MOCK_RUN,
    cleanStarts: 3,
    completedRuns: 5,
    recoveryWins: 2,
    reflectionUpgrades: 1,
    status: 'completed',
  };
  const display = buildFocusRunDisplay({
    firstActiveDay: 10,
    lane: 'game_like',
    run: completedRun,
  });
  expect(display.completedRuns).toBe(5);
  expect(display.cleanStarts).toBe(3);
  expect(display.recoveryWins).toBe(2);
  expect(display.finalGrade).not.toBeNull();
  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/coin/i);
  expect(serialized).not.toMatch(/gem/i);
  expect(serialized).not.toMatch(/currency/i);
  expect(serialized).not.toMatch(/reward/i);
});

it('Run completion shows grade and stat recap, no currency or economy values', () => {
  const completedRun: FocusRun = {
    ...MOCK_RUN,
    cleanStarts: 8,
    completedRuns: 12,
    recoveryWins: 5,
    reflectionUpgrades: 3,
    status: 'completed',
  };
  const display = buildFocusRunDisplay({
    firstActiveDay: 14,
    lane: 'game_like',
    run: completedRun,
    signals: ['scroll', 'late start', 'switching'],
  });
  expect(display.finalGrade).toBe('S');
  expect(display.weekSummary).toContain('12 runs');
  expect(display.weekSummary).toContain('8 clean starts');
  expect(display.weekSummary).toContain('5 recovery wins');
  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/coins/i);
  expect(serialized).not.toMatch(/gems/i);
  expect(serialized).not.toMatch(/currency/i);
  expect(serialized).not.toMatch(/shop/i);
});

it('focus run display has no achievement economy reward fields', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 10,
    lane: 'game_like',
    run: { ...MOCK_RUN, completedRuns: 4 },
  });
  const serialized = JSON.stringify(display);
  expect(serialized).not.toMatch(/"coins"/i);
  expect(serialized).not.toMatch(/"gems"/i);
  expect(serialized).not.toMatch(/"spend"/i);
  expect(serialized).not.toMatch(/"currency"/i);
});

it('FocusRunDisplay schema has no coin, gem, shop, or economy fields', () => {
  const display = buildFocusRunDisplay({
    firstActiveDay: 5,
    lane: 'game_like',
    run: MOCK_RUN,
    signals: ['scrolling'],
  });
  const keys = Object.keys(display);
  const economyKeys = keys.filter((k) =>
    /coin|gem|shop|inventory|wallet|wager|battle|pass|currency/i.test(k),
  );
  expect(economyKeys).toHaveLength(0);
});
