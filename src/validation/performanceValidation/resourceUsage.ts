import {
  defaultThresholds,
  type PerformanceThresholds,
  type PerformanceValidationResult,
} from "./types";

export const validateCPUUsage = (
  cpuUsage: number,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (cpuUsage < 0 || cpuUsage > 100) {
    errors.push("CPU usage must be between 0 and 100 percent");
    return {
      isValid: false,
      errors,
      warnings,
      metrics: {
        responseTime: 0,
        throughput: 0,
        cpuUsage,
        memoryUsage: 0,
        diskUsage: 0,
        networkLatency: 0,
        errorRate: 0,
        availability: 0,
      },
      recommendations,
      performanceLevel: "poor",
    };
  }
  if (cpuUsage <= thresholds.cpuUsage.excellent) {
    performanceLevel = "excellent";
  } else if (cpuUsage <= thresholds.cpuUsage.good) {
    performanceLevel = "good";
  } else if (cpuUsage <= thresholds.cpuUsage.fair) {
    performanceLevel = "fair";
  } else {
    performanceLevel = "poor";
  }
  if (cpuUsage > thresholds.cpuUsage.poor) {
    errors.push(`CPU usage is critically high: ${cpuUsage}%`);
    recommendations.push("Scale vertically by adding CPU resources");
    recommendations.push("Optimize CPU-intensive operations");
    recommendations.push("Implement load balancing to distribute load");
    recommendations.push("Review code for CPU bottlenecks");
  } else if (cpuUsage > thresholds.cpuUsage.fair) {
    warnings.push(`CPU usage is high: ${cpuUsage}%`);
    recommendations.push("Monitor CPU trends");
    recommendations.push("Consider performance optimizations");
    recommendations.push("Review application efficiency");
  } else if (cpuUsage > thresholds.cpuUsage.good) {
    recommendations.push("Monitor CPU utilization patterns");
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      responseTime: 0,
      throughput: 0,
      cpuUsage,
      memoryUsage: 0,
      diskUsage: 0,
      networkLatency: 0,
      errorRate: 0,
      availability: 0,
    },
    recommendations,
    performanceLevel,
  };
};

export const validateMemoryUsage = (
  memoryUsage: number,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (memoryUsage < 0 || memoryUsage > 100) {
    errors.push("Memory usage must be between 0 and 100 percent");
    return {
      isValid: false,
      errors,
      warnings,
      metrics: {
        responseTime: 0,
        throughput: 0,
        cpuUsage: 0,
        memoryUsage,
        diskUsage: 0,
        networkLatency: 0,
        errorRate: 0,
        availability: 0,
      },
      recommendations,
      performanceLevel: "poor",
    };
  }
  if (memoryUsage <= thresholds.memoryUsage.excellent) {
    performanceLevel = "excellent";
  } else if (memoryUsage <= thresholds.memoryUsage.good) {
    performanceLevel = "good";
  } else if (memoryUsage <= thresholds.memoryUsage.fair) {
    performanceLevel = "fair";
  } else {
    performanceLevel = "poor";
  }
  if (memoryUsage > thresholds.memoryUsage.poor) {
    errors.push(`Memory usage is critically high: ${memoryUsage}%`);
    recommendations.push("Increase available memory");
    recommendations.push("Optimize memory usage in application code");
    recommendations.push("Check for memory leaks");
    recommendations.push("Implement memory caching strategies");
  } else if (memoryUsage > thresholds.memoryUsage.fair) {
    warnings.push(`Memory usage is high: ${memoryUsage}%`);
    recommendations.push("Monitor memory trends");
    recommendations.push("Review memory allocation patterns");
    recommendations.push("Consider memory optimization");
  } else if (memoryUsage > thresholds.memoryUsage.good) {
    recommendations.push("Monitor memory utilization");
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      responseTime: 0,
      throughput: 0,
      cpuUsage: 0,
      memoryUsage,
      diskUsage: 0,
      networkLatency: 0,
      errorRate: 0,
      availability: 0,
    },
    recommendations,
    performanceLevel,
  };
};
