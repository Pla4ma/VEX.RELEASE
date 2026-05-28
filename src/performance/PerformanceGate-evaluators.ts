import type { PerformanceTargets, PerformanceIssue } from "./PerformanceGate-types";
import type { PerformanceMetrics } from "../utils/performance-monitor";

interface EvalMetrics { issues: PerformanceIssue[]; scorePenalty: number }
type EvalResult<T> = T & EvalMetrics;

function createIssue(
  id: string,
  category: PerformanceIssue["category"],
  severity: PerformanceIssue["severity"],
  message: string,
  recommendation: string,
  measurement?: number,
  target?: number,
): PerformanceIssue {
  return { id, category, severity, message, recommendation, measurement, target };
}

export function evaluateFPS(
  metrics: PerformanceMetrics,
  targets: PerformanceTargets,
): EvalResult<{ current: number; average: number; target: number; passed: boolean }> {
  const issues: PerformanceIssue[] = [];
  let scorePenalty = 0;
  const currentFps = metrics.fps;
  const avgFps = metrics.avgFps;
  const targetFps = targets.targetFps;
  const minFps = targets.minFps;
  if (currentFps < minFps) {
    issues.push(createIssue(
      "fps-below-minimum", "fps", "critical",
      `Current FPS (${currentFps}) is below minimum threshold (${minFps})`,
      "Optimize rendering pipeline, reduce complexity, or enable hardware acceleration",
      currentFps, minFps,
    ));
    scorePenalty += 30;
  }
  if (avgFps < targetFps * 0.9) {
    issues.push(createIssue(
      "fps-below-target", "fps", "major",
      `Average FPS (${avgFps}) is below target (${targetFps})`,
      "Profile performance bottlenecks and optimize rendering code",
      avgFps, targetFps,
    ));
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

export function evaluateMemory(
  metrics: PerformanceMetrics,
  targets: PerformanceTargets,
): EvalResult<{ current: number; limit: number; passed: boolean }> {
  const issues: PerformanceIssue[] = [];
  let scorePenalty = 0;
  const currentMemory = metrics.memoryUsage;
  const maxMemory = targets.maxMemoryMb;
  if (currentMemory > maxMemory) {
    issues.push(createIssue(
      "memory-above-limit", "memory", "critical",
      `Memory usage (${currentMemory}MB) exceeds limit (${maxMemory}MB)`,
      "Reduce memory usage by optimizing data structures and implementing memory pooling",
      currentMemory, maxMemory,
    ));
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

export function evaluateAnimations(
  animationMetrics: Array<{ duration: number; timestamp: number }>,
  targets: PerformanceTargets,
): EvalResult<{ averageDuration: number; limit: number; passed: boolean }> {
  const issues: PerformanceIssue[] = [];
  let scorePenalty = 0;
  if (animationMetrics.length === 0) {
    return {
      averageDuration: 0,
      limit: targets.maxAnimationDurationMs,
      passed: true,
      issues,
      scorePenalty,
    };
  }
  const avgDuration =
    animationMetrics.reduce((sum, m) => sum + m.duration, 0) /
    animationMetrics.length;
  const maxDuration = targets.maxAnimationDurationMs;
  if (avgDuration > maxDuration) {
    issues.push(createIssue(
      "animation-too-slow", "animation", "major",
      `Average animation duration (${avgDuration.toFixed(2)}ms) exceeds limit (${maxDuration}ms)`,
      "Use CSS transforms instead of JavaScript animations, or reduce animation complexity",
      avgDuration, maxDuration,
    ));
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

export function evaluateNetwork(
  networkMetrics: Array<{ duration: number; timestamp: number }>,
  targets: PerformanceTargets,
): EvalResult<{ averageResponseTime: number; limit: number; passed: boolean }> {
  const issues: PerformanceIssue[] = [];
  let scorePenalty = 0;
  if (networkMetrics.length === 0) {
    return {
      averageResponseTime: 0,
      limit: targets.maxNetworkRequestMs,
      passed: true,
      issues,
      scorePenalty,
    };
  }
  const avgResponseTime =
    networkMetrics.reduce((sum, m) => sum + m.duration, 0) /
    networkMetrics.length;
  const maxResponseTime = targets.maxNetworkRequestMs;
  if (avgResponseTime > maxResponseTime) {
    issues.push(createIssue(
      "network-too-slow", "network", "major",
      `Average network response time (${avgResponseTime.toFixed(2)}ms) exceeds limit (${maxResponseTime}ms)`,
      "Implement request caching, optimize API calls, or use CDN for static assets",
      avgResponseTime, maxResponseTime,
    ));
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

export function evaluateBundle(
  bundleSize: number,
  targets: PerformanceTargets,
): EvalResult<{ size: number; limit: number; passed: boolean }> {
  const issues: PerformanceIssue[] = [];
  let scorePenalty = 0;
  const maxSize = targets.maxBundleSizeKb;
  if (bundleSize > maxSize) {
    issues.push(createIssue(
      "bundle-too-large", "bundle", "critical",
      `Bundle size (${bundleSize}KB) exceeds limit (${maxSize}KB)`,
      "Implement code splitting, tree shaking, and remove unused dependencies",
      bundleSize, maxSize,
    ));
    scorePenalty += 20;
  }
  return {
    size: bundleSize,
    limit: maxSize,
    passed: bundleSize <= maxSize,
    issues,
    scorePenalty,
  };
}
