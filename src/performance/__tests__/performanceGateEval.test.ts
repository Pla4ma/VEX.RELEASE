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
  DEVELOPMENT_TARGETS,
  type PerformanceTargets,
  type PerformanceGate,
} from "./performanceGateSetup";

describe("PerformanceGate", () => {
  let gate: PerformanceGate;
  beforeEach(() => {
    jest.clearAllMocks();
    gate = performanceGate;
    gate.setTargets(DEVELOPMENT_TARGETS);
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
      expect(targets.maxMemoryMb).toBe(DEVELOPMENT_TARGETS.maxMemoryMb);
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
      expect(targets.maxMemoryMb).toBe(DEVELOPMENT_TARGETS.maxMemoryMb);
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
    it("should evaluate FPS from internal monitor", async () => {
      const result = await gate.evaluatePerformanceGate();
      expect(result.metrics.fps).toBeDefined();
      expect(typeof result.metrics.fps.current).toBe("number");
    });
    it("should evaluate memory from internal monitor", async () => {
      const result = await gate.evaluatePerformanceGate();
      expect(result.metrics.memory).toBeDefined();
      expect(typeof result.metrics.memory.current).toBe("number");
      expect(result.metrics.memory.limit).toBe(DEVELOPMENT_TARGETS.maxMemoryMb);
    });
    it("should evaluate bundle size", async () => {
      gate.setBundleSize(500);
      const result = await gate.evaluatePerformanceGate();
      expect(result.metrics.bundle).toBeDefined();
      expect(result.metrics.bundle.size).toBe(500);
      expect(result.metrics.bundle.passed).toBe(true);
    });
    it("should evaluate network metrics", async () => {
      const result = await gate.evaluatePerformanceGate();
      expect(result.metrics.network).toBeDefined();
      expect(typeof result.metrics.network.averageResponseTime).toBe("number");
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
      expect(report).toContain("**Overall Status: ✅ PASSED**");
      expect(report).toContain("### FPS");
      expect(report).toContain("### Memory");
    });
  });
});
