import { validateAvailability, validateErrorRate } from "./reliability";
import { validateCPUUsage, validateMemoryUsage } from "./resourceUsage";
import { validateResponseTime, validateThroughput } from "./responseThroughput";
import { validateDiskUsage, validateNetworkLatency } from "./systemHealth";
import {
  defaultThresholds,
  type PerformanceMetrics,
  type PerformanceThresholds,
  type PerformanceValidationResult,
} from "./types";

export const validatePerformance = (
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allRecommendations: string[] = [];
  const performanceLevels: ("excellent" | "good" | "fair" | "poor")[] = [];
  const responseTimeResult = validateResponseTime(
    metrics.responseTime,
    thresholds,
  );
  allErrors.push(...responseTimeResult.errors);
  allWarnings.push(...responseTimeResult.warnings);
  allRecommendations.push(...responseTimeResult.recommendations);
  performanceLevels.push(responseTimeResult.performanceLevel);
  const throughputResult = validateThroughput(metrics.throughput, thresholds);
  allErrors.push(...throughputResult.errors);
  allWarnings.push(...throughputResult.warnings);
  allRecommendations.push(...throughputResult.recommendations);
  performanceLevels.push(throughputResult.performanceLevel);
  const cpuResult = validateCPUUsage(metrics.cpuUsage, thresholds);
  allErrors.push(...cpuResult.errors);
  allWarnings.push(...cpuResult.warnings);
  allRecommendations.push(...cpuResult.recommendations);
  performanceLevels.push(cpuResult.performanceLevel);
  const memoryResult = validateMemoryUsage(metrics.memoryUsage, thresholds);
  allErrors.push(...memoryResult.errors);
  allWarnings.push(...memoryResult.warnings);
  allRecommendations.push(...memoryResult.recommendations);
  performanceLevels.push(memoryResult.performanceLevel);
  const diskResult = validateDiskUsage(metrics.diskUsage, thresholds);
  allErrors.push(...diskResult.errors);
  allWarnings.push(...diskResult.warnings);
  allRecommendations.push(...diskResult.recommendations);
  performanceLevels.push(diskResult.performanceLevel);
  const networkResult = validateNetworkLatency(
    metrics.networkLatency,
    thresholds,
  );
  allErrors.push(...networkResult.errors);
  allWarnings.push(...networkResult.warnings);
  allRecommendations.push(...networkResult.recommendations);
  performanceLevels.push(networkResult.performanceLevel);
  const errorRateResult = validateErrorRate(metrics.errorRate, thresholds);
  allErrors.push(...errorRateResult.errors);
  allWarnings.push(...errorRateResult.warnings);
  allRecommendations.push(...errorRateResult.recommendations);
  performanceLevels.push(errorRateResult.performanceLevel);
  const availabilityResult = validateAvailability(
    metrics.availability,
    thresholds,
  );
  allErrors.push(...availabilityResult.errors);
  allWarnings.push(...availabilityResult.warnings);
  allRecommendations.push(...availabilityResult.recommendations);
  performanceLevels.push(availabilityResult.performanceLevel);
  const levelCounts = {
    excellent: performanceLevels.filter((level) => level === "excellent")
      .length,
    good: performanceLevels.filter((level) => level === "good").length,
    fair: performanceLevels.filter((level) => level === "fair").length,
    poor: performanceLevels.filter((level) => level === "poor").length,
  };
  let overallLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (levelCounts.poor > 0) {
    overallLevel = "poor";
  } else if (levelCounts.fair > 2) {
    overallLevel = "fair";
  } else if (levelCounts.fair > 0 || levelCounts.good < 4) {
    overallLevel = "good";
  }
  if (
    metrics.cpuUsage > 80 &&
    metrics.responseTime > thresholds.responseTime.fair
  ) {
    allRecommendations.push(
      "High CPU usage may be causing slow response times",
    );
  }
  if (
    metrics.memoryUsage > 80 &&
    metrics.errorRate > thresholds.errorRate.fair
  ) {
    allRecommendations.push(
      "High memory usage may be causing increased error rates",
    );
  }
  if (
    metrics.diskUsage > 90 &&
    metrics.availability < thresholds.availability.good
  ) {
    allRecommendations.push(
      "Low disk space may be affecting system availability",
    );
  }
  const uniqueRecommendations = Array.from(new Set(allRecommendations));
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    metrics,
    recommendations: uniqueRecommendations,
    performanceLevel: overallLevel,
  };
};
