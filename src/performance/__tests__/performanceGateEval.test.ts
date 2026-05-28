import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import {
  performanceGate,
  mockPerformanceMonitor,
  mockFetch,
  PRODUCTION_TARGETS,
  type PerformanceTargets,
  type PerformanceGate,
} from "./performanceGateSetup";

describe("PerformanceGate", () => {
  let gate: PerformanceGate;
  beforeEach(() => {
    jest.clearAllMocks();
    gate = performanceGate;
    mockFetch.mockClear();
  });
  afterEach(() => {
    gate.cleanup();
  });
  describe("Configuration Management", () => {
    it("should use production targets by default", () => {
      const targets = gate.getTargets();
      expect(targets.minFps).toBe(PRODUCTION_TARGETS.minFps);
      expect(targets.targetFps).toBe(PRODUCTION_TARGETS.targetFps);
      expect(targets.maxMemoryMb).toBe(PRODUCTION_TARGETS.maxMemoryMb);
    });
    it("should allow custom target configuration", () => {
      const customTargets: Partial<PerformanceTargets> = {
        minFps: 45,
        targetFps: 120,
      };
      gate.setTargets(customTargets);
      const targets = gate.getTargets();
      expect(targets.minFps).toBe(45);
      expect(targets.targetFps).toBe(120);
      expect(targets.maxMemoryMb).toBe(PRODUCTION_TARGETS.maxMemoryMb);
    });
    it("should update targets dynamically", () => {
      const initialTargets = gate.getTargets();
      gate.setTargets({ minFps: 50 });
      const updatedTargets = gate.getTargets();
      expect(updatedTargets.minFps).toBe(50);
      expect(updatedTargets.targetFps).toBe(initialTargets.targetFps);
    });
  });
  describe("Performance Gate Evaluation", () => {
    it("should pass with good performance metrics", async () => {
      mockPerformanceMonitor.getMetrics.mockReturnValue({
        fps: 60,
        avgFps: 58,
        jankFrames: 1,
        memoryUsage: 100,
        jsHeapSize: 40,
        longTasks: 0,
        timestamp: Date.now(),
      });
      const result = await gate.evaluatePerformanceGate();
      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.metrics.fps.passed).toBe(true);
      expect(result.metrics.memory.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
    it("should fail with low FPS", async () => {
      mockPerformanceMonitor.getMetrics.mockReturnValue({
        fps: 25,
        avgFps: 28,
        jankFrames: 15,
        memoryUsage: 80,
        jsHeapSize: 35,
        longTasks: 2,
        timestamp: Date.now(),
      });
      const result = await gate.evaluatePerformanceGate();
      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(80);
      expect(result.metrics.fps.passed).toBe(false);
      expect(result.issues.some((issue) => issue.category === "fps")).toBe(
        true,
      );
    });
    it("should fail with high memory usage", async () => {
      mockPerformanceMonitor.getMetrics.mockReturnValue({
        fps: 55,
        avgFps: 52,
        jankFrames: 3,
        memoryUsage: 200,
        jsHeapSize: 60,
        longTasks: 1,
        timestamp: Date.now(),
      });
      const result = await gate.evaluatePerformanceGate();
      expect(result.passed).toBe(false);
      expect(result.metrics.memory.passed).toBe(false);
      expect(result.issues.some((issue) => issue.category === "memory")).toBe(
        true,
      );
    });
    it("should detect animation performance issues", async () => {
      gate.setBundleSize(500);
      const result = await gate.evaluatePerformanceGate();
      expect(result.passed).toBe(false);
      expect(result.metrics.bundle.passed).toBe(false);
      expect(result.issues.some((issue) => issue.category === "bundle")).toBe(
        true,
      );
    });
    it("should detect network performance issues", async () => {
      mockFetch.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { ok: true };
      });
      await globalThis.fetch("https://api.example.com/data");
      const result = await gate.evaluatePerformanceGate();
      expect(result.passed).toBe(false);
      expect(result.metrics.network.passed).toBe(false);
      expect(result.issues.some((issue) => issue.category === "network")).toBe(
        true,
      );
    });
    it("should provide comprehensive performance report", async () => {
      mockPerformanceMonitor.getMetrics.mockReturnValue({
        fps: 30,
        avgFps: 25,
        jankFrames: 10,
        memoryUsage: 180,
        jsHeapSize: 70,
        longTasks: 4,
        timestamp: Date.now(),
      });
      const result = await gate.evaluatePerformanceGate();
      const report = gate.generateReport(result);
      expect(report).toContain("# Performance Gate Report");
      expect(report).toContain("**Overall Status: ❌ FAILED**");
      expect(report).toContain("### FPS");
      expect(report).toContain("### Memory");
      expect(report).toContain("## Issues Found");
      expect(report).toContain("## General Recommendations");
    });
  });
});
