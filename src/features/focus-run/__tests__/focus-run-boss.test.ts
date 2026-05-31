import { resolvePersonalBlocker } from './focus-run.helpers';
import { weekStartDaysAgo, nowForDaysAgo } from './focus-run.helpers';

it('personal blocker is teaser when less than 3 days of evidence exist', () => {
  const blocker = resolvePersonalBlocker({
    firstActiveDay: weekStartDaysAgo(0),
    signals: ['scrolling', 'scrolling again', 'distracted by feed'],
    now: nowForDaysAgo(0),
  });
  expect(blocker.observedDays).toBeLessThan(3);
  expect(blocker.isTeaser).toBe(true);
  expect(blocker.isEvidenceBased).toBe(false);
});

it('personal blocker is evidence-based after 3+ days with 2+ signals', () => {
  const blocker = resolvePersonalBlocker({
    firstActiveDay: weekStartDaysAgo(8),
    signals: ['deadline avoidance', 'deadline late', 'deadline pressure'],
    now: nowForDaysAgo(0),
  });
  expect(blocker.observedDays).toBeGreaterThanOrEqual(3);
  expect(blocker.isEvidenceBased).toBe(true);
  expect(blocker.isTeaser).toBe(false);
  expect(blocker.archetype).toBe('deadline_pressure');
});

it('evidence-based blocker cites the detected behavior archetype', () => {
  const blocker = resolvePersonalBlocker({
    firstActiveDay: weekStartDaysAgo(7),
    signals: [
      'switching contexts',
      'context switching again',
      'lost focus switching tabs',
    ],
    now: nowForDaysAgo(0),
  });
  expect(blocker.isEvidenceBased).toBe(true);
  expect(blocker.archetype).toBe('context_switching');
  expect(blocker.name).toBe('Context Switching');
  expect(blocker.recoveryPrompt).toContain('protect one thread');
});

it('cold game-like user with no signals gets teaser blocker', () => {
  const blocker = resolvePersonalBlocker({
    firstActiveDay: 0,
    signals: [],
  });
  expect(blocker.isTeaser).toBe(true);
  expect(blocker.isEvidenceBased).toBe(false);
  expect(blocker.archetype).toBe('blank_start');
  expect(blocker.name).toBe('The Blank Page');
  expect(blocker.recoveryPrompt).toContain('Start one small run');
});
