import { describe, it } from "@jest/globals";

type FirstWeekProofDay = {
  day: string;
  checks: string[];
};

const firstWeekProofDays: FirstWeekProofDay[] = [
  {
    day: "Day 0 fresh install",
    checks: [
      "auth starts with no cached session",
      "registration works",
      "onboarding completes",
      "home opens after onboarding",
      "only core features are visible",
    ],
  },
  {
    day: "Day 1 first session",
    checks: [
      "home CTA starts session",
      "timer runs",
      "completion writes grade",
      "streak becomes one day",
      "first-week progress is persisted",
    ],
  },
  {
    day: "Days 2 and 3 companion pacing",
    checks: [
      "companion is teased before unlock",
      "locked route is not registered",
      "queries stay disabled while locked",
      "companion unlocks after third session",
      "companion screen uses real session data",
    ],
  },
  {
    day: "Days 4 through 7 feature pacing",
    checks: [
      "challenges unlock after enough sessions",
      "premium paywall is only teased at the right time",
      "boss route is safe when unlocked",
      "economy remains paced",
      "milestones show earned progress",
    ],
  },
  {
    day: "Cross-cutting resilience",
    checks: [
      "offline completion syncs once",
      "background timer remains coherent",
      "app kill resume works",
      "login restores session history",
      "recovery systems avoid early full-screen pressure",
    ],
  },
];

describe("First-week device proof contract", () => {
  it("documents the manual first-week flow without claiming device execution", () => {
    expect(firstWeekProofDays).toHaveLength(5);
    expect(firstWeekProofDays.flatMap((day) => day.checks)).toHaveLength(25);
  });

  describe.skip.each(firstWeekProofDays)("$day", ({ checks }) => {
    it.each(checks)("requires recorded first-week evidence: %s", () => {
      throw new Error(
        "Manual first-week evidence is required before this can pass.",
      );
    });
  });
});
