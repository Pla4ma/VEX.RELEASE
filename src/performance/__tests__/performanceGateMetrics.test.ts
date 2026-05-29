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
    it("should monitor network requests", async () => {
      gate.setTargets(PRODUCTION_TARGETS);
      gate.restartMetricsCollection();
      mockFetch.mockResolvedValue({ data: "test" });
      await globalThis.fetch("https://api.example.com/test");
      const diagnostics = gate.getDiagnosticInfo();
      expect(diagnostics.isMonitoring).toBe(true);
    });
    it("should provide diagnostic information", () => {
      const diagnostics = gate.getDiagnosticInfo();
      expect(diagnostics).toHaveProperty("targets");
      expect(diagnostics).toHaveProperty("currentMetrics");
      expect(diagnostics).toHaveProperty("isMonitoring");
      expect(diagnostics).toHaveProperty("activeAnimations");
      expect(diagnostics).toHaveProperty("registrySize");
    });
  });
  describe("Performance Thresholds", () => {
    it("should use production targets in production", () => {
      const productionGate = PerformanceGate.getInstance();
      const targets = productionGate.getTargets();
      expect(targets.minFps).toBe(30);
      expect(targets.maxMemoryMb).toBe(150);
    });
    it("should use development targets in development", () => {
      const devGate = PerformanceGate.getInstance();
      const targets = devGate.getTargets();
      expect(targets.minFps).toBe(30);
      expect(targets.maxMemoryMb).toBe(200);
    });
  });
  describe("Performance Recommendations", () => {
    it("should generate FPS-specific recommendations", async () => {
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
      expect(result.recommendations).toContain("Optimize rendering pipeline");
      expect(result.recommendations).toContain("Reduce complexity");
    });
    it("should generate memory-specific recommendations", async () => {
      mockPerformanceMonitor.getMetrics.mockReturnValue({
        fps: 55,
        avgFps: 52,
        jankFrames: 3,
        memoryUsage: 250,
        jsHeapSize: 80,
        longTasks: 1,
        timestamp: Date.now(),
      });
      const result = await gate.evaluatePerformanceGate();
      expect(result.recommendations).toContain("memory pooling");
      expect(result.recommendations).toContain("optimize data structures");
    });
    it("should generate network-specific recommendations", async () => {
      mockFetch.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { ok: true };
      });
      await globalThis.fetch("https://api.example.com/slow");
      const result = await gate.evaluatePerformanceGate();
      expect(result.recommendations).toContain("request caching");
      expect(result.recommendations).toContain("optimize API calls");
    });
  });
  describe("Error Handling", () => {
    it("should handle performance monitor errors gracefully", async () => {
      mockPerformanceMonitor.getMetrics.mockImplementation(() => {
        throw new Error("Performance monitor error");
      });
      const result = await gate.evaluatePerformanceGate();
      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(50);
      expect(result.issues.length).toBeGreaterThan(0);
    });
    it("should provide fallback metrics on error", async () => {
      mockPerformanceMonitor.getMetrics.mockImplementation(() => {
        throw new Error("Performance monitor error");
      });
      const diagnostics = gate.getDiagnosticInfo();
      expect(diagnostics.currentMetrics).toBeDefined();
      expect(diagnostics.currentMetrics.fps).toBe(0);
      expect(diagnostics.currentMetrics.memoryUsage).toBe(0);
    });
  });
  describe("Integration with Performance Monitor", () => {
    it("should integrate with existing performance monitoring", () => {
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
