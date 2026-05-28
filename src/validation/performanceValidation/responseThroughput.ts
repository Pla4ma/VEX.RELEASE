import {
  defaultThresholds,
  type PerformanceThresholds,
  type PerformanceValidationResult,
} from "./types";

export const validateResponseTime = (
  responseTime: number,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (responseTime < 0) {
    errors.push("Response time cannot be negative");
    return {
      isValid: false,
      errors,
      warnings,
      metrics: {
        responseTime,
        throughput: 0,
        cpuUsage: 0,
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
  if (responseTime <= thresholds.responseTime.excellent) {
    performanceLevel = "excellent";
  } else if (responseTime <= thresholds.responseTime.good) {
    performanceLevel = "good";
  } else if (responseTime <= thresholds.responseTime.fair) {
    performanceLevel = "fair";
  } else {
    performanceLevel = "poor";
  }
  if (responseTime > thresholds.responseTime.poor) {
    errors.push(`Response time is critically slow: ${responseTime}ms`);
    recommendations.push("Investigate database query performance");
    recommendations.push("Check for memory leaks or resource bottlenecks");
    recommendations.push("Consider implementing caching strategies");
    recommendations.push("Review code for inefficient algorithms");
  } else if (responseTime > thresholds.responseTime.fair) {
    warnings.push(`Response time is slow: ${responseTime}ms`);
    recommendations.push("Optimize database queries");
    recommendations.push("Consider adding response caching");
    recommendations.push("Review application performance bottlenecks");
  } else if (responseTime > thresholds.responseTime.good) {
    recommendations.push("Monitor response time trends");
    recommendations.push(
      "Consider performance optimizations for future scaling",
    );
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      responseTime,
      throughput: 0,
      cpuUsage: 0,
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

export const validateThroughput = (
  throughput: number,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (throughput < 0) {
    errors.push("Throughput cannot be negative");
    return {
      isValid: false,
      errors,
      warnings,
      metrics: {
        responseTime: 0,
        throughput,
        cpuUsage: 0,
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
  if (throughput >= thresholds.throughput.excellent) {
    performanceLevel = "excellent";
  } else if (throughput >= thresholds.throughput.good) {
    performanceLevel = "good";
  } else if (throughput >= thresholds.throughput.fair) {
    performanceLevel = "fair";
  } else {
    performanceLevel = "poor";
  }
  if (throughput < thresholds.throughput.poor) {
    errors.push(`Throughput is critically low: ${throughput} requests/second`);
    recommendations.push("Scale horizontally by adding more instances");
    recommendations.push("Optimize application code for better performance");
    recommendations.push("Check for resource bottlenecks (CPU, memory, I/O)");
    recommendations.push("Consider load balancing improvements");
  } else if (throughput < thresholds.throughput.fair) {
    warnings.push(`Throughput is low: ${throughput} requests/second`);
    recommendations.push("Monitor resource utilization");
    recommendations.push("Consider performance tuning");
    recommendations.push("Review system capacity planning");
  } else if (throughput < thresholds.throughput.good) {
    recommendations.push("Monitor throughput trends");
    recommendations.push("Plan for capacity scaling");
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      responseTime: 0,
      throughput,
      cpuUsage: 0,
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
