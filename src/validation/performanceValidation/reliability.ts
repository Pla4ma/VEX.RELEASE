import {
  defaultThresholds,
  type PerformanceThresholds,
  type PerformanceValidationResult,
} from "./types";

export const validateErrorRate = (
  errorRate: number,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (errorRate < 0 || errorRate > 100) {
    errors.push("Error rate must be between 0 and 100 percent");
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
        networkLatency: 0,
        errorRate,
        availability: 0,
      },
      recommendations,
      performanceLevel: "poor",
    };
  }
  if (errorRate <= thresholds.errorRate.excellent) {
    performanceLevel = "excellent";
  } else if (errorRate <= thresholds.errorRate.good) {
    performanceLevel = "good";
  } else if (errorRate <= thresholds.errorRate.fair) {
    performanceLevel = "fair";
  } else {
    performanceLevel = "poor";
  }
  if (errorRate > thresholds.errorRate.poor) {
    errors.push(`Error rate is critically high: ${errorRate}%`);
    recommendations.push("Investigate root cause of errors");
    recommendations.push("Review application logs for error patterns");
    recommendations.push("Implement better error handling");
    recommendations.push("Consider system stability improvements");
  } else if (errorRate > thresholds.errorRate.fair) {
    warnings.push(`Error rate is high: ${errorRate}%`);
    recommendations.push("Monitor error trends");
    recommendations.push("Review error handling procedures");
  } else if (errorRate > thresholds.errorRate.good) {
    recommendations.push("Monitor error rate patterns");
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
      networkLatency: 0,
      errorRate,
      availability: 0,
    },
    recommendations,
    performanceLevel,
  };
};

export const validateAvailability = (
  availability: number,
  thresholds: PerformanceThresholds = defaultThresholds,
): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: "excellent" | "good" | "fair" | "poor" = "excellent";
  if (availability < 0 || availability > 100) {
    errors.push("Availability must be between 0 and 100 percent");
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
        networkLatency: 0,
        errorRate: 0,
        availability,
      },
      recommendations,
      performanceLevel: "poor",
    };
  }
  if (availability >= thresholds.availability.excellent) {
    performanceLevel = "excellent";
  } else if (availability >= thresholds.availability.good) {
    performanceLevel = "good";
  } else if (availability >= thresholds.availability.fair) {
    performanceLevel = "fair";
  } else {
    performanceLevel = "poor";
  }
  if (availability < thresholds.availability.poor) {
    errors.push(`Availability is critically low: ${availability}%`);
    recommendations.push("Implement high availability architecture");
    recommendations.push("Add redundancy and failover mechanisms");
    recommendations.push("Review system reliability procedures");
    recommendations.push("Consider disaster recovery planning");
  } else if (availability < thresholds.availability.fair) {
    warnings.push(`Availability is low: ${availability}%`);
    recommendations.push("Monitor uptime trends");
    recommendations.push("Review system reliability");
  } else if (availability < thresholds.availability.good) {
    recommendations.push("Monitor availability metrics");
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
      networkLatency: 0,
      errorRate: 0,
      availability,
    },
    recommendations,
    performanceLevel,
  };
};
