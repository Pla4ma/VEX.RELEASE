import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import {
  PerformanceGate,
  performanceGate,
  PRODUCTION_TARGETS,
  DEVELOPMENT_TARGETS,
  mockPerformanceMonitor,
  mockFetch,
  mockRequestAnimationFrame,
} from "./performanceGateSetup";

describe("PerformanceGate", () => {
  let gate: PerformanceGate;
  beforeEach(() => {
    jest.clearAllMocks();
    gate = performanceGate;
    mockFetch.mockClear();
    mockRequestAnimationFrame.mockClear();
    // Explicitly reset getMetrics to default since restoreMocks doesn't
    // fully track mocks injected via Object.defineProperty
    mockPerformanceMonitor.getMetrics.mockReset();
    mockPerformanceMonitor.getMetrics.mockReturnValue({
      fps: 60,
      avgFps: 58,
      jankFrames: 2,
      memoryUsage: 120,
      jsHeapSize: 50,
      longTasks: 1,
      timestamp: Date.now(),
    });
  });
  afterEach(() => {
    gate.cleanup();
  });
  describe("Performance Metrics Collection", () => {
    it("should collect FPS metrics correctly", () => {
      gate.setTargets(PRODUCTION_TARGETS);
      gate.restartMetricsCollection();
      const frameCallback = mockRequestAnimationFrame.mock.calls[0]?.[0];
      if (frameCallback) {
        frameCallback(performance.now());
        frameCallback(performance.now() + 16);
        frameCallback(performance.now() + 33);
      }
      const metrics = gate.getDiagnosticInfo().currentMetrics;
      expect(metrics.fps).toBeGreaterThan(50);
      expect(metrics.jankFrames).toBeLessThan(5);
    });
    it("should track memory usage", () => {
      gate.setTargets(PRODUCTION_TARGETS);
      gate.restartMetricsCollection();
      const metrics = gate.getDiagnosticInfo().currentMetrics;
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.jsHeapSize).toBe("number");
    });
    it("should monitor network requests", () => {
      gate.setTargets(PRODUCTION_TARGETS);
      gate.restartMetricsCollection();
      const diagnostics = gate.getDiagnosticInfo();
      expect(diagnostics.isMonitoring).toBe(true);
    });
    it("should provide diagnostic information", () => {
      const diagnostics = gate.getDiagnosticInfo();
      expect(diagnostics).toHaveProperty("targets");
      expect(diagnostics).toHaveProperty("currentMetrics");
      expect(diagnostics).toHaveProperty("isMonitoring");
    });
  });
  describe("Performance Thresholds", () => {
    it("should use production targets in production", () => {
      const productionGate = PerformanceGate.getInstance();
      productionGate.setTargets(PRODUCTION_TARGETS);
      const targets = productionGate.getTargets();
      expect(targets.minFps).toBe(30);
      expect(targets.maxMemoryMb).toBe(150);
    });
    it("should use development targets in development", () => {
      const devGate = PerformanceGate.getInstance();
      devGate.setTargets(DEVELOPMENT_TARGETS);
      const targets = devGate.getTargets();
      expect(targets.minFps).toBe(30);
      expect(targets.maxMemoryMb).toBe(200);
    });
  });
  describe("Performance Recommendations", () => {
    it("should generate FPS-specific recommendations", async () => {
      gate.setTargets(PRODUCTION_TARGETS);
      mockPerformanceMonitor.getMetrics.mockReturnValue({
        fps: 20,
        avgFps: 18,
        jankFrames: 25,
        memoryUsage: 100,
        jsHeapSize: 40,
        longTasks: 2,
        timestamp: Date.now(),
      });
      const result = await gate.evaluatePerformanceGate();
      expect(result.recommendations).toContain(
        "Optimize rendering pipeline, reduce complexity, or enable hardware acceleration"
      );
      expect(result.recommendations).toContain(
        "Profile performance bottlenecks and optimize rendering code"
      );
    });
    it("should generate memory-specific recommendations", async () => {
      gate.setTargets(PRODUCTION_TARGETS);
      mockPerformanceMonitor.getMetrics.mockReturnValue({
        fps: 55,
        avgFps: 55,
        jankFrames: 3,
        memoryUsage: 250,
        jsHeapSize: 80,
        longTasks: 1,
        timestamp: Date.now(),
      });
      const result = await gate.evaluatePerformanceGate();
      expect(result.recommendations).toContain(
        "Implement memory pooling and optimize data structures"
      );
      expect(result.recommendations).toContain(
        "Reduce memory usage by optimizing data structures and implementing memory pooling"
      );
    });
    it("should include network evaluation in gate results", async () => {
      gate.setTargets(PRODUCTION_TARGETS);
      const result = await gate.evaluatePerformanceGate();
      expect(result.metrics.network).toBeDefined();
      expect(typeof result.metrics.network.averageResponseTime).toBe("number");
      expect(typeof result.metrics.network.limit).toBe("number");
      expect(typeof result.metrics.network.passed).toBe("boolean");
    });
  });
  describe("Error Handling", () => {
    it("should propagate performance monitor errors", async () => {
      mockPerformanceMonitor.getMetrics.mockImplementation(() => {
        throw new Error("Performance monitor error");
      });
      await expect(gate.evaluatePerformanceGate()).rejects.toThrow(
        "Performance monitor error"
      );
    });
    it("should propagate errors from diagnostics", () => {
      mockPerformanceMonitor.getMetrics.mockImplementation(() => {
        throw new Error("Performance monitor error");
      });
      expect(() => gate.getDiagnosticInfo()).toThrow(
        "Performance monitor error"
      );
    });
  });
  describe("Integration with Performance Monitor", () => {
    it("should integrate with existing performance monitoring", () => {
      gate.restartMetricsCollection();
      const diagnostics = gate.getDiagnosticInfo();
      expect(diagnostics.isMonitoring).toBe(true);
      expect(diagnostics.targets).toBeDefined();
      expect(diagnostics.currentMetrics).toBeDefined();
    });
    it("should cleanup resources properly", () => {
      gate.restartMetricsCollection();
      gate.cleanup();
      const diagnostics = gate.getDiagnosticInfo();
      expect(diagnostics.isMonitoring).toBe(false);
    });
  });
});
