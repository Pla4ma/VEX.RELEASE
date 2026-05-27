import { createDebugger } from "../utils/debug";
import {
  PerformanceMonitor,
  type PerformanceMetrics,
} from "../utils/performance-monitor";
import { eventBus } from "../events";
const debug = createDebugger("performance-gate");
export interface PerformanceTargets {
  minFps: number;
  targetFps: number;
  maxMemoryMb: number;
  maxLongTasksPerSecond: number;
  maxBundleSizeKb: number;
  maxAnimationDurationMs: number;
  maxNetworkRequestMs: number;
}
export interface PerformanceGateResult {
  passed: boolean;
  score: number;
  metrics: {
    fps: { current: number; average: number; target: number; passed: boolean };
    memory: { current: number; limit: number; passed: boolean };
    animations: { averageDuration: number; limit: number; passed: boolean };
    network: { averageResponseTime: number; limit: number; passed: boolean };
    bundle: { size: number; limit: number; passed: boolean };
  };
  issues: PerformanceIssue[];
  recommendations: string[];
  timestamp: number;
}
export interface PerformanceIssue {
  id: string;
  category: "fps" | "memory" | "animation" | "network" | "bundle" | "general";
  severity: "critical" | "major" | "moderate" | "minor";
  message: string;
  measurement?: number;
  target?: number;
  recommendation: string;
}
export const PRODUCTION_TARGETS: PerformanceTargets = {
  minFps: 30,
  targetFps: 60,
  maxMemoryMb: 150,
  maxLongTasksPerSecond: 2,
  maxBundleSizeKb: 1024,
  maxAnimationDurationMs: 16.67,
  maxNetworkRequestMs: 3000,
};
export const DEVELOPMENT_TARGETS: PerformanceTargets = {
  ...PRODUCTION_TARGETS,
  maxMemoryMb: 200,
  maxLongTasksPerSecond: 5,
  maxBundleSizeKb: 2048,
};
export class PerformanceGate {
  private static instance: PerformanceGate;
  private targets: PerformanceTargets;
  private performanceMonitor: PerformanceMonitor;
  private networkMetrics: Array<{ duration: number; timestamp: number }> = [];
  private animationMetrics: Array<{ duration: number; timestamp: number }> = [];
  private bundleSize: number = 0;
  private constructor() {
    this.targets = __DEV__ ? DEVELOPMENT_TARGETS : PRODUCTION_TARGETS;
    this.performanceMonitor = new PerformanceMonitor();
    this.initializeMetricsCollection();
  }
  static getInstance(): PerformanceGate {
    if (!PerformanceGate.instance) {
      PerformanceGate.instance = new PerformanceGate();
    }
    return PerformanceGate.instance;
  }
  setTargets(targets: Partial<PerformanceTargets>): void {
    this.targets = { ...this.targets, ...targets };
    debug.info("Performance gate targets updated:", this.targets);
  }
  getTargets(): PerformanceTargets {
    return { ...this.targets };
  }
  private initializeMetricsCollection(): void {
    this.performanceMonitor.start();
    this.performanceMonitor.onJank((metrics) => {
      this.recordPerformanceMetrics("jank", metrics);
    });
    this.setupNetworkMonitoring();
    this.setupAnimationMonitoring();
    debug.info("Performance metrics collection initialized");
  }
  private setupNetworkMonitoring(): void {
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        this.networkMetrics.push({ duration, timestamp: Date.now() });
        if (this.networkMetrics.length > 100) {
          this.networkMetrics = this.networkMetrics.slice(-100);
        }
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.networkMetrics.push({ duration, timestamp: Date.now() });
        throw error;
      }
    };
  }
  private setupAnimationMonitoring(): void {
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      const start = performance.now();
      const wrappedCallback = (timestamp: number) => {
        const duration = performance.now() - start;
        this.animationMetrics.push({ duration, timestamp: Date.now() });
        if (this.animationMetrics.length > 50) {
          this.animationMetrics = this.animationMetrics.slice(-50);
        }
        return callback(timestamp);
      };
      return originalRequestAnimationFrame(wrappedCallback);
    };
  }
  private recordPerformanceMetrics(
    type: string,
    metrics: PerformanceMetrics,
  ): void {
    eventBus.publish("performance:metric", {
      type,
      metrics,
      timestamp: Date.now(),
    });
  }
  async evaluatePerformanceGate(): Promise<PerformanceGateResult> {
    debug.info("Evaluating performance gate...");
    const currentMetrics = this.performanceMonitor.getMetrics();
    const issues: PerformanceIssue[] = [];
    let score = 100;
    const fpsResult = this.evaluateFPS(currentMetrics);
    issues.push(...fpsResult.issues);
    score -= fpsResult.scorePenalty;
    const memoryResult = this.evaluateMemory(currentMetrics);
    issues.push(...memoryResult.issues);
    score -= memoryResult.scorePenalty;
    const animationResult = this.evaluateAnimations();
    issues.push(...animationResult.issues);
    score -= animationResult.scorePenalty;
    const networkResult = this.evaluateNetwork();
    issues.push(...networkResult.issues);
    score -= networkResult.scorePenalty;
    const bundleResult = this.evaluateBundle();
    issues.push(...bundleResult.issues);
    score -= bundleResult.scorePenalty;
    const result: PerformanceGateResult = {
      passed: score >= 80,
      score: Math.max(0, score),
      metrics: {
        fps: fpsResult,
        memory: memoryResult,
        animations: animationResult,
        network: networkResult,
        bundle: bundleResult,
      },
      issues,
      recommendations: this.generateRecommendations(issues),
      timestamp: Date.now(),
    };
    debug.info("Performance gate evaluation complete:", {
      passed: result.passed,
      score: result.score,
      issuesCount: issues.length,
    });
    return result;
  }
  private evaluateFPS(metrics: PerformanceMetrics): {
    current: number;
    average: number;
    target: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;
    const currentFps = metrics.fps;
    const avgFps = metrics.avgFps;
    const targetFps = this.targets.targetFps;
    const minFps = this.targets.minFps;
    if (currentFps < minFps) {
      issues.push({
        id: "fps-below-minimum",
        category: "fps",
        severity: "critical",
        message: `Current FPS (${currentFps}) is below minimum threshold (${minFps})`,
        measurement: currentFps,
        target: minFps,
        recommendation:
          "Optimize rendering pipeline, reduce complexity, or enable hardware acceleration",
      });
      scorePenalty += 30;
    }
    if (avgFps < targetFps * 0.9) {
      issues.push({
        id: "fps-below-target",
        category: "fps",
        severity: "major",
        message: `Average FPS (${avgFps}) is below target (${targetFps})`,
        measurement: avgFps,
        target: targetFps,
        recommendation:
          "Profile performance bottlenecks and optimize rendering code",
      });
      scorePenalty += 15;
    }
    return {
      current: currentFps,
      average: avgFps,
      target: targetFps,
      passed: currentFps >= minFps && avgFps >= targetFps * 0.9,
      issues,
      scorePenalty,
    };
  }
  private evaluateMemory(metrics: PerformanceMetrics): {
    current: number;
    limit: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;
    const currentMemory = metrics.memoryUsage;
    const maxMemory = this.targets.maxMemoryMb;
    if (currentMemory > maxMemory) {
      issues.push({
        id: "memory-above-limit",
        category: "memory",
        severity: "critical",
        message: `Memory usage (${currentMemory}MB) exceeds limit (${maxMemory}MB)`,
        measurement: currentMemory,
        target: maxMemory,
        recommendation:
          "Reduce memory usage by optimizing data structures and implementing memory pooling",
      });
      scorePenalty += 25;
    }
    return {
      current: currentMemory,
      limit: maxMemory,
      passed: currentMemory <= maxMemory,
      issues,
      scorePenalty,
    };
  }
  private evaluateAnimations(): {
    averageDuration: number;
    limit: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;
    if (this.animationMetrics.length === 0) {
      return {
        averageDuration: 0,
        limit: this.targets.maxAnimationDurationMs,
        passed: true,
        issues,
        scorePenalty,
      };
    }
    const avgDuration =
      this.animationMetrics.reduce((sum, m) => sum + m.duration, 0) /
      this.animationMetrics.length;
    const maxDuration = this.targets.maxAnimationDurationMs;
    if (avgDuration > maxDuration) {
      issues.push({
        id: "animation-too-slow",
        category: "animation",
        severity: "major",
        message: `Average animation duration (${avgDuration.toFixed(2)}ms) exceeds limit (${maxDuration}ms)`,
        measurement: avgDuration,
        target: maxDuration,
        recommendation:
          "Use CSS transforms instead of JavaScript animations, or reduce animation complexity",
      });
      scorePenalty += 10;
    }
    return {
      averageDuration: avgDuration,
      limit: maxDuration,
      passed: avgDuration <= maxDuration,
      issues,
      scorePenalty,
    };
  }
  private evaluateNetwork(): {
    averageResponseTime: number;
    limit: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;
    if (this.networkMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        limit: this.targets.maxNetworkRequestMs,
        passed: true,
        issues,
        scorePenalty,
      };
    }
    const avgResponseTime =
      this.networkMetrics.reduce((sum, m) => sum + m.duration, 0) /
      this.networkMetrics.length;
    const maxResponseTime = this.targets.maxNetworkRequestMs;
    if (avgResponseTime > maxResponseTime) {
      issues.push({
        id: "network-too-slow",
        category: "network",
        severity: "major",
        message: `Average network response time (${avgResponseTime.toFixed(2)}ms) exceeds limit (${maxResponseTime}ms)`,
        measurement: avgResponseTime,
        target: maxResponseTime,
        recommendation:
          "Implement request caching, optimize API calls, or use CDN for static assets",
      });
      scorePenalty += 10;
    }
    return {
      averageResponseTime: avgResponseTime,
      limit: maxResponseTime,
      passed: avgResponseTime <= maxResponseTime,
      issues,
      scorePenalty,
    };
  }
  private evaluateBundle(): {
    size: number;
    limit: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;
    const currentSize = this.bundleSize;
    const maxSize = this.targets.maxBundleSizeKb;
    if (currentSize > maxSize) {
      issues.push({
        id: "bundle-too-large",
        category: "bundle",
        severity: "critical",
        message: `Bundle size (${currentSize}KB) exceeds limit (${maxSize}KB)`,
        measurement: currentSize,
        target: maxSize,
        recommendation:
          "Implement code splitting, tree shaking, and remove unused dependencies",
      });
      scorePenalty += 20;
    }
    return {
      size: currentSize,
      limit: maxSize,
      passed: currentSize <= maxSize,
      issues,
      scorePenalty,
    };
  }
  private generateRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations: string[] = [];
    const categories = new Set(issues.map((issue) => issue.category));
    if (categories.has("fps") || categories.has("animation")) {
      recommendations.push(
        "Enable hardware acceleration and use optimized rendering techniques",
      );
    }
    if (categories.has("memory")) {
      recommendations.push(
        "Implement memory pooling and optimize data structures",
      );
    }
    if (categories.has("network")) {
      recommendations.push("Optimize API calls and implement request caching");
    }
    if (categories.has("bundle")) {
      recommendations.push("Use code splitting and remove unused dependencies");
    }
    issues.forEach((issue) => {
      if (!recommendations.includes(issue.recommendation)) {
        recommendations.push(issue.recommendation);
      }
    });
    return recommendations;
  }
  setBundleSize(size: number): void {
    this.bundleSize = size;
    debug.info(`Bundle size set to ${size}KB`);
  }
  getDiagnosticInfo(): {
    targets: PerformanceTargets;
    currentMetrics: PerformanceMetrics;
    isMonitoring: boolean;
  } {
    return {
      targets: this.targets,
      currentMetrics: this.performanceMonitor.getMetrics(),
      isMonitoring: this.performanceMonitor["isRunning"],
    };
  }
  generateReport(result: PerformanceGateResult): string {
    let report = "# Performance Gate Report\n\n";
    report += `**Overall Status: ${result.passed ? "✅ PASSED" : "❌ FAILED"}**\n`;
    report += `**Score: ${result.score}/100**\n\n`;
    report += "## Metrics\n\n";
    report += "### FPS\n";
    report += `- Current: ${result.metrics.fps.current}\n`;
    report += `- Average: ${result.metrics.fps.average}\n`;
    report += `- Target: ${result.metrics.fps.target}\n`;
    report += `- Status: ${result.metrics.fps.passed ? "✅ PASSED" : "❌ FAILED"}\n\n`;
    report += "### Memory\n";
    report += `- Current: ${result.metrics.memory.current}MB\n`;
    report += `- Limit: ${result.metrics.memory.limit}MB\n`;
    report += `- Status: ${result.metrics.memory.passed ? "✅ PASSED" : "❌ FAILED"}\n\n`;
    report += "### Animations\n";
    report += `- Average Duration: ${result.metrics.animations.averageDuration.toFixed(2)}ms\n`;
    report += `- Limit: ${result.metrics.animations.limit}ms\n`;
    report += `- Status: ${result.metrics.animations.passed ? "✅ PASSED" : "❌ FAILED"}\n\n`;
    report += "### Network\n";
    report += `- Average Response: ${result.metrics.network.averageResponseTime.toFixed(2)}ms\n`;
    report += `- Limit: ${result.metrics.network.limit}ms\n`;
    report += `- Status: ${result.metrics.network.passed ? "✅ PASSED" : "❌ FAILED"}\n\n`;
    report += "### Bundle\n";
    report += `- Size: ${result.metrics.bundle.size}KB\n`;
    report += `- Limit: ${result.metrics.bundle.limit}KB\n`;
    report += `- Status: ${result.metrics.bundle.passed ? "✅ PASSED" : "❌ FAILED"}\n\n`;
    if (result.issues.length > 0) {
      report += "## Issues Found\n\n";
      result.issues.forEach((issue) => {
        report += `### ${issue.category.toUpperCase()}: ${issue.message}\n`;
        report += `- **Severity:** ${issue.severity}\n`;
        report += `- **Recommendation:** ${issue.recommendation}\n\n`;
      });
    }
    if (result.recommendations.length > 0) {
      report += "## General Recommendations\n\n";
      result.recommendations.forEach((rec) => {
        report += `- ${rec}\n`;
      });
    }
    return report;
  }
  cleanup(): void {
    this.performanceMonitor.stop();
    this.networkMetrics = [];
    this.animationMetrics = [];
    debug.info("Performance gate cleaned up");
  }
}
export const performanceGate = PerformanceGate.getInstance();
