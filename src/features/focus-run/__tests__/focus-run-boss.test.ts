import { resolvePersonalBoss } from "./focus-run.helpers";
import { weekStartDaysAgo, nowForDaysAgo } from "./focus-run.helpers";

it("personal boss is teaser when less than 3 days of evidence exist", () => {
  const boss = resolvePersonalBoss({
    firstActiveDay: weekStartDaysAgo(0),
    signals: ["scrolling", "scrolling again", "distracted by feed"],
    now: nowForDaysAgo(0),
  });
  expect(boss.observedDays).toBeLessThan(3);
  expect(boss.isTeaser).toBe(true);
  expect(boss.isEvidenceBased).toBe(false);
});

it("personal boss is evidence-based after 3+ days with 2+ signals", () => {
  const boss = resolvePersonalBoss({
    firstActiveDay: weekStartDaysAgo(5),
    signals: ["deadline avoidance", "deadline late", "deadline pressure"],
    now: nowForDaysAgo(0),
  });
  expect(boss.observedDays).toBeGreaterThanOrEqual(3);
  expect(boss.isEvidenceBased).toBe(true);
  expect(boss.isTeaser).toBe(false);
  expect(boss.archetype).toBe("deadline_wraith");
});

it("evidence-based boss cites the detected behavior archetype", () => {
  const boss = resolvePersonalBoss({
    firstActiveDay: weekStartDaysAgo(7),
    signals: [
      "switching contexts",
      "context switching again",
      "lost focus switching tabs",
    ],
    now: nowForDaysAgo(0),
  });
  expect(boss.isEvidenceBased).toBe(true);
  expect(boss.archetype).toBe("switch_swarm");
  expect(boss.name).toBe("Switch Swarm");
  expect(boss.recoveryPrompt).toContain("protect one thread");
});

it("cold game-like user with no signals gets teaser boss", () => {
  const boss = resolvePersonalBoss({
    firstActiveDay: 0,
    signals: [],
  });
  expect(boss.isTeaser).toBe(true);
  expect(boss.isEvidenceBased).toBe(false);
  expect(boss.archetype).toBe("cold_start_shadow");
  expect(boss.name).toBe("Cold Start Shadow");
  expect(boss.recoveryPrompt).toContain("Start one small encounter");
});
