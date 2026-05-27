import {
  getFirstWeekMilestone,
  getNextMilestone,
  getMilestoneProgress,
} from "../first-week-narrative";

describe("first-week-narrative", () => {
  it("returns Day 0 milestone for 0 completed sessions", () => {
    const milestone = getFirstWeekMilestone(0);
    expect(milestone).not.toBeNull();
    expect(milestone!.day).toBe(0);
    expect(milestone!.title).toBe("VEX matches your mode");
    expect(milestone!.ctaLabel).toBe("Start first session");
  });

  it("returns Day 1 milestone after first session", () => {
    const milestone = getFirstWeekMilestone(1);
    expect(milestone).not.toBeNull();
    expect(milestone!.day).toBe(1);
    expect(milestone!.title).toBe("VEX remembers your rhythm");
  });

  it("returns Day 3 milestone after 3 sessions", () => {
    const milestone = getFirstWeekMilestone(3);
    expect(milestone).not.toBeNull();
    expect(milestone!.day).toBe(3);
    expect(milestone!.title).toBe("VEX shows what it learned");
  });

  it("returns Day 5 milestone after 5 sessions", () => {
    const milestone = getFirstWeekMilestone(5);
    expect(milestone).not.toBeNull();
    expect(milestone!.day).toBe(5);
    expect(milestone!.title).toBe("Your mode feels more personal");
  });

  it("returns Day 7 milestone after 7 sessions", () => {
    const milestone = getFirstWeekMilestone(7);
    expect(milestone).not.toBeNull();
    expect(milestone!.day).toBe(7);
    expect(milestone!.title).toBe("First weekly intelligence");
  });

  it("returns null for non-milestone session counts", () => {
    expect(getFirstWeekMilestone(2)).toBeNull();
    expect(getFirstWeekMilestone(4)).toBeNull();
    expect(getFirstWeekMilestone(6)).toBeNull();
    expect(getFirstWeekMilestone(8)).toBeNull();
  });

  it("returns next milestone correctly", () => {
    const next = getNextMilestone(0);
    expect(next).not.toBeNull();
    expect(next!.day).toBe(1);
    expect(next!.title).toBe("VEX remembers your rhythm");
  });

  it("returns next milestone from mid-week", () => {
    const next = getNextMilestone(2);
    expect(next).not.toBeNull();
    expect(next!.day).toBe(3);
  });

  it("returns null when past all milestones", () => {
    expect(getNextMilestone(7)).toBeNull();
    expect(getNextMilestone(10)).toBeNull();
  });

  it("computes milestone progress label", () => {
    const start = getMilestoneProgress(0);
    expect(start.current).toBe(0);
    expect(start.next).toBe(1);
    expect(start.label).toContain("0 of 1");

    const mid = getMilestoneProgress(2);
    expect(mid.current).toBe(1);
    expect(mid.next).toBe(3);

    const done = getMilestoneProgress(7);
    expect(done.current).toBe(7);
    expect(done.next).toBeNull();
    expect(done.label).toBe("Weekly intelligence ready");
  });
});
