import {
  defaultThresholds,
  type PerformanceThresholds,
  type PerformanceValidationResult,
} from "./types";

export const validateDiskUsage = (
  diskUsage: number,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (diskUsage < 0 || diskUsage > 100) {
    errors.push("Disk usage must be between 0 and 100 percent");
    return {
      isValid: false,
      errors,
      warnings,
      metrics: {
        responseTime: 0,
        throughput: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage,
        networkLatency: 0,
        errorRate: 0,
        availability: 0,
      },
      recommendations,
      performanceLevel: "poor",
    };
  }
  if (diskUsage <= thresholds.diskUsage.excellent) {
    performanceLevel = "excellent";
  } else if (diskUsage <= thresholds.diskUsage.good) {
    performanceLevel = "good";
  } else if (diskUsage <= thresholds.diskUsage.fair) {
    performanceLevel = "fair";
  } else {
    performanceLevel = "poor";
  }
  if (diskUsage > thresholds.diskUsage.poor) {
    errors.push(`Disk usage is critically high: ${diskUsage}%`);
    recommendations.push("Clean up unnecessary files and logs");
    recommendations.push("Add additional disk storage");
    recommendations.push("Implement data archiving strategies");
    recommendations.push("Review data retention policies");
  } else if (diskUsage > thresholds.diskUsage.fair) {
    warnings.push(`Disk usage is high: ${diskUsage}%`);
    recommendations.push("Monitor disk usage trends");
    recommendations.push("Plan for storage expansion");
    recommendations.push("Review data cleanup procedures");
  } else if (diskUsage > thresholds.diskUsage.good) {
    recommendations.push("Monitor disk utilization");
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      responseTime: 0,
      throughput: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage,
      networkLatency: 0,
      errorRate: 0,
      availability: 0,
    },
    recommendations,
    performanceLevel,
  };
};

export const validateNetworkLatency = (
  networkLatency: number,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (networkLatency < 0) {
    errors.push("Network latency cannot be negative");
    return {
      isValid: false,
      errors,
      warnings,
      metrics: {
        responseTime: 0,
        throughput: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkLatency,
        errorRate: 0,
        availability: 0,
      },
      recommendations,
      performanceLevel: "poor",
    };
  }
  if (networkLatency <= thresholds.networkLatency.excellent) {
    performanceLevel = "excellent";
  } else if (networkLatency <= thresholds.networkLatency.good) {
    performanceLevel = "good";
  } else if (networkLatency <= thresholds.networkLatency.fair) {
    performanceLevel = "fair";
  } else {
    performanceLevel = "poor";
  }
  if (networkLatency > thresholds.networkLatency.poor) {
    errors.push(`Network latency is critically high: ${networkLatency}ms`);
    recommendations.push("Check network infrastructure");
    recommendations.push("Optimize network routing");
    recommendations.push("Consider CDN implementation");
    recommendations.push("Review network configuration");
  } else if (networkLatency > thresholds.networkLatency.fair) {
    warnings.push(`Network latency is high: ${networkLatency}ms`);
    recommendations.push("Monitor network performance");
    recommendations.push("Consider network optimizations");
  } else if (networkLatency > thresholds.networkLatency.good) {
    recommendations.push("Monitor network latency trends");
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      responseTime: 0,
      throughput: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkLatency,
      errorRate: 0,
      availability: 0,
    },
    recommendations,
    performanceLevel,
  };
};
