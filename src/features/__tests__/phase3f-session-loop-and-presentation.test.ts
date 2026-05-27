import {
  baseLaneProfile,
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
  buildLaneSessionBrief,
  resolveLaneCopy,
  decideNudge,
} from "./phase3-lane-polish-helpers";
import type { Lane } from "./phase3-lane-polish-helpers";

describe("Phase 3F — Session Loop and Presentation", () => {
  it("all modes share same core session loop (SessionMode enum covers all)", () => {
    const laneSessionModes: Record<Lane, string> = {
      student: buildLaneSessionBrief({ lane: "student" }).sessionMode,
      game_like: buildLaneSessionBrief({ lane: "game_like" }).sessionMode,
      deep_creative: buildLaneSessionBrief({ lane: "deep_creative" })
        .sessionMode,
      minimal_normal: buildLaneSessionBrief({ lane: "minimal_normal" })
        .sessionMode,
    };

    expect(laneSessionModes.student).toBe("STUDY");
    expect(laneSessionModes.game_like).toBe("SPRINT");
    expect(laneSessionModes.deep_creative).toBe("CREATIVE");
    expect(laneSessionModes.minimal_normal).toBe("LIGHT_FOCUS");

    for (const mode of Object.values(laneSessionModes)) {
      expect(mode).toBeDefined();
      expect(typeof mode).toBe("string");
    }
  });

  it("modes differ by presentation/policy, not separate session engines", () => {
    const lanes: Lane[] = [
      "student",
      "game_like",
      "deep_creative",
      "minimal_normal",
    ];

    const presentations = lanes.map((lane) =>
      getLanePresentationPolicy({ lane, reducedMotion: false }),
    );

    const icons = new Set(presentations.map((p) => p.icon));
    expect(icons.size).toBe(4);

    const tones = new Set(presentations.map((p) => p.copyTone));
    expect(tones.size).toBe(4);

    const feelings = new Set(presentations.map((p) => p.visualFeeling));
    expect(feelings.size).toBe(4);

    for (const p of presentations) {
      expect(p.lane).toBeDefined();
      expect(p.animation).toBeDefined();
      expect(p.density).toBeDefined();
      expect(p.emptyStateCta).toBeDefined();
      expect(p.loadingState).toBeDefined();
    }
  });

  it("NotificationPolicy consumes LaneProfile for budget and type decisions", () => {
    const lanes: Lane[] = [
      "student",
      "game_like",
      "deep_creative",
      "minimal_normal",
    ];

    const decisions: Record<
      Lane,
      ReturnType<typeof decideNudge>
    > = {} as Record<Lane, ReturnType<typeof decideNudge>>;

    for (const lane of lanes) {
      const profile = baseLaneProfile({ primaryLane: lane });
      decisions[lane] = decideNudge({
        lane,
        laneProfile: profile,
        completedSessions: 5,
        daysSinceOnboarding: 5,
        context: "weekly_ready",
      });
    }

    for (const lane of lanes) {
      expect(decisions[lane].lane).toBe(lane);
    }

    expect(decisions.minimal_normal.budgetRemaining).toBe(1);
    expect(decisions.student.budgetRemaining).toBe(2);
    expect(decisions.game_like.budgetRemaining).toBe(2);
    expect(decisions.deep_creative.budgetRemaining).toBe(2);
  });

  it("FeatureAvailability: LaneMechanicPolicy blockedMechanics enforces per-lane feature visibility", () => {
    const lanes: Lane[] = [
      "student",
      "game_like",
      "deep_creative",
      "minimal_normal",
    ];
    const oldEconomy = [
      "shop",
      "gems",
      "wagers",
      "economy",
      "trading",
    ] as const;

    for (const lane of lanes) {
      const policy = getLaneMechanicPolicy(
        baseLaneProfile({ primaryLane: lane }),
      );
      const anyBlocked = oldEconomy.some((m) =>
        policy.blockedMechanics.includes(m),
      );
      expect(anyBlocked).toBe(true);
    }

    const cleanPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "minimal_normal" }),
    );
    expect(cleanPolicy.blockedMechanics).toContain("boss_full_cta");
    expect(cleanPolicy.blockedMechanics).toContain("challenge_spam");
    expect(cleanPolicy.blockedMechanics).toContain("xp_first_ui");
    expect(cleanPolicy.blockedMechanics).toContain("economy");

    const runPolicy = getLaneMechanicPolicy(
      baseLaneProfile({ primaryLane: "game_like" }),
    );
    expect(runPolicy.blockedMechanics).toContain("paid_saves");
    expect(runPolicy.blockedMechanics).toContain("gems");
    expect(runPolicy.blockedMechanics).toContain("shop");
    expect(runPolicy.blockedMechanics).toContain("trading");
    expect(runPolicy.blockedMechanics).toContain("wagers");
    expect(runPolicy.blockedMechanics).toContain("generic_leaderboards");
  });

  it("same core session loop produces lane-varied outputs without separate engines", () => {
    for (const lane of [
      "student",
      "game_like",
      "deep_creative",
      "minimal_normal",
    ] as const) {
      const profile = baseLaneProfile({ primaryLane: lane });

      const brief = buildLaneSessionBrief({ laneProfile: profile });
      const policy = getLaneMechanicPolicy(profile);
      const pres = getLanePresentationPolicy({ lane, reducedMotion: false });
      const copy = resolveLaneCopy("DAY_0_NOT_STARTED", profile, "fallback");

      expect(brief.lane).toBe(lane);
      expect(policy.lane).toBe(lane);
      expect(pres.lane).toBe(lane);
      const publicNameMap: Record<Lane, string> = {
        student: "study",
        game_like: "run",
        deep_creative: "project",
        minimal_normal: "clean",
      };
      expect(copy.laneStageTheme).toContain(publicNameMap[lane]);
    }

    expect(getLaneMechanicPolicy).toBeDefined();
    expect(getLanePresentationPolicy).toBeDefined();
    expect(buildLaneSessionBrief).toBeDefined();
    expect(resolveLaneCopy).toBeDefined();
  });
});
