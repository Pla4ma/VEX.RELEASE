/**
 * Liveops Config Feature — FeatureHealthRegistry Tests (part 2: queries & caching)
 */

import { featureHealthRegistry } from "../feature-health";
import type { FeatureHealthStatus } from "../feature-health";

describe("FeatureHealthRegistry — advanced", () => {
  let testCounter = 1000;
  function nextId(): string {
    return `test_check_${++testCounter}`;
  }

  afterEach(() => {
    featureHealthRegistry.invalidateCache();
    for (const id of featureHealthRegistry.getRegisteredIds()) {
      if (id.startsWith("test_check_")) {
        featureHealthRegistry.unregister(id);
      }
    }
  });

  it("shouldDegrade returns true for unhealthy features", async () => {
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "degraded",
    });
    expect(await featureHealthRegistry.shouldDegrade("content_study")).toBe(true);
  });

  it("shouldDegrade returns false for healthy features", async () => {
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "healthy",
    });
    expect(await featureHealthRegistry.shouldDegrade("content_study")).toBe(false);
  });

  it("getUnhealthyFeatures returns unhealthy features", async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "unavailable",
    });
    featureHealthRegistry.register({
      id: id2, feature: "boss_tab", label: "C2", dependency: "d2",
      check: () => "healthy",
    });
    const unhealthy = await featureHealthRegistry.getUnhealthyFeatures();
    expect(unhealthy).toContain("content_study");
    expect(unhealthy).not.toContain("boss_tab");
  });

  it("getUnhealthyFeaturesFiltered only checks allowed features", async () => {
    const id1 = nextId();
    const id2 = nextId();
    featureHealthRegistry.register({
      id: id1, feature: "content_study", label: "C1", dependency: "d1",
      check: () => "unavailable",
    });
    featureHealthRegistry.register({
      id: id2, feature: "boss_tab", label: "C2", dependency: "d2",
      check: () => "unavailable",
    });
    const unhealthy = await featureHealthRegistry.getUnhealthyFeaturesFiltered(
      new Set(["content_study"]),
    );
    expect(unhealthy).toContain("content_study");
    expect(unhealthy).not.toContain("boss_tab");
  });

  it("invalidateCache clears cache and triggers re-check", async () => {
    let callCount = 0;
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "C1", dependency: "d1",
      check: () => { callCount++; return "healthy"; },
      cacheMs: 60000,
    });
    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("content_study");
    expect(callCount).toBe(1); // cached

    featureHealthRegistry.invalidateCache();
    await featureHealthRegistry.getFeatureHealth("content_study");
    expect(callCount).toBe(2); // re-checked after invalidation
  });

  it("invalidateCache clears specific feature cache", async () => {
    let countA = 0;
    let countB = 0;
    const idA = nextId();
    const idB = nextId();
    featureHealthRegistry.register({
      id: idA, feature: "content_study", label: "A", dependency: "dep",
      check: () => { countA++; return "healthy"; },
      cacheMs: 60000,
    });
    featureHealthRegistry.register({
      id: idB, feature: "boss_tab", label: "B", dependency: "dep",
      check: () => { countB++; return "healthy"; },
      cacheMs: 60000,
    });

    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("boss_tab");
    expect(countA).toBe(1);
    expect(countB).toBe(1);

    featureHealthRegistry.invalidateCache("content_study");
    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("boss_tab");
    expect(countA).toBe(2); // re-checked
    expect(countB).toBe(1); // still cached
  });

  it("handles async health checks", async () => {
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "Async", dependency: "dep",
      check: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return "healthy" as FeatureHealthStatus;
      },
    });
    const status = await featureHealthRegistry.getFeatureHealth("content_study");
    expect(status).toBe("healthy");
  });

  it("caches results within cacheMs window", async () => {
    let callCount = 0;
    const id = nextId();
    featureHealthRegistry.register({
      id, feature: "content_study", label: "Cached", dependency: "dep",
      check: () => { callCount++; return "healthy" as FeatureHealthStatus; },
      cacheMs: 60000,
    });
    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("content_study");
    await featureHealthRegistry.getFeatureHealth("content_study");
    expect(callCount).toBe(1);
  });
});
