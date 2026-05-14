/**
 * Performance Validation Layer
 *
 * Comprehensive validation for performance metrics, resource usage,
 * response times, and system efficiency with optimization recommendations.
 */

export interface PerformanceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metrics: PerformanceMetrics;
  recommendations: string[];
  performanceLevel: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  errorRate: number;
  availability: number;
  cacheHitRate?: number;
  databaseConnections?: number;
  queueLength?: number;
}

export interface PerformanceThresholds {
  responseTime: { excellent: number; good: number; fair: number; poor: number };
  throughput: { excellent: number; good: number; fair: number; poor: number };
  cpuUsage: { excellent: number; good: number; fair: number; poor: number };
  memoryUsage: { excellent: number; good: number; fair: number; poor: number };
  diskUsage: { excellent: number; good: number; fair: number; poor: number };
  networkLatency: { excellent: number; good: number; fair: number; poor: number };
  errorRate: { excellent: number; good: number; fair: number; poor: number };
  availability: { excellent: number; good: number; fair: number; poor: number };
}

// Default performance thresholds
export const defaultThresholds: PerformanceThresholds = {
  responseTime: { excellent: 100, good: 300, fair: 1000, poor: 3000 },
  throughput: { excellent: 1000, good: 500, fair: 100, poor: 50 },
  cpuUsage: { excellent: 50, good: 70, fair: 85, poor: 95 },
  memoryUsage: { excellent: 60, good: 75, fair: 85, poor: 95 },
  diskUsage: { excellent: 70, good: 80, fair: 90, poor: 95 },
  networkLatency: { excellent: 50, good: 100, fair: 200, poor: 500 },
  errorRate: { excellent: 0.1, good: 1, fair: 5, poor: 10 },
  availability: { excellent: 99.9, good: 99.5, fair: 99, poor: 95 },
};

// Response time validation
export const validateResponseTime = (responseTime: number, thresholds: PerformanceThresholds = defaultThresholds): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (responseTime < 0) {
    errors.push('Response time cannot be negative');
    return {
      isValid: false,
      errors,
      warnings,
      metrics: { responseTime, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate: 0, availability: 0 },
      recommendations,
      performanceLevel: 'poor',
    };
  }

  // Determine performance level
  if (responseTime <= thresholds.responseTime.excellent) {
    performanceLevel = 'excellent';
  } else if (responseTime <= thresholds.responseTime.good) {
    performanceLevel = 'good';
  } else if (responseTime <= thresholds.responseTime.fair) {
    performanceLevel = 'fair';
  } else {
    performanceLevel = 'poor';
  }

  // Generate recommendations based on performance
  if (responseTime > thresholds.responseTime.poor) {
    errors.push(`Response time is critically slow: ${responseTime}ms`);
    recommendations.push('Investigate database query performance');
    recommendations.push('Check for memory leaks or resource bottlenecks');
    recommendations.push('Consider implementing caching strategies');
    recommendations.push('Review code for inefficient algorithms');
  } else if (responseTime > thresholds.responseTime.fair) {
    warnings.push(`Response time is slow: ${responseTime}ms`);
    recommendations.push('Optimize database queries');
    recommendations.push('Consider adding response caching');
    recommendations.push('Review application performance bottlenecks');
  } else if (responseTime > thresholds.responseTime.good) {
    recommendations.push('Monitor response time trends');
    recommendations.push('Consider performance optimizations for future scaling');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: { responseTime, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate: 0, availability: 0 },
    recommendations,
    performanceLevel,
  };
};

// Throughput validation
export const validateThroughput = (throughput: number, thresholds: PerformanceThresholds = defaultThresholds): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (throughput < 0) {
    errors.push('Throughput cannot be negative');
    return {
      isValid: false,
      errors,
      warnings,
      metrics: { responseTime: 0, throughput, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate: 0, availability: 0 },
      recommendations,
      performanceLevel: 'poor',
    };
  }

  // Determine performance level
  if (throughput >= thresholds.throughput.excellent) {
    performanceLevel = 'excellent';
  } else if (throughput >= thresholds.throughput.good) {
    performanceLevel = 'good';
  } else if (throughput >= thresholds.throughput.fair) {
    performanceLevel = 'fair';
  } else {
    performanceLevel = 'poor';
  }

  // Generate recommendations
  if (throughput < thresholds.throughput.poor) {
    errors.push(`Throughput is critically low: ${throughput} requests/second`);
    recommendations.push('Scale horizontally by adding more instances');
    recommendations.push('Optimize application code for better performance');
    recommendations.push('Check for resource bottlenecks (CPU, memory, I/O)');
    recommendations.push('Consider load balancing improvements');
  } else if (throughput < thresholds.throughput.fair) {
    warnings.push(`Throughput is low: ${throughput} requests/second`);
    recommendations.push('Monitor resource utilization');
    recommendations.push('Consider performance tuning');
    recommendations.push('Review system capacity planning');
  } else if (throughput < thresholds.throughput.good) {
    recommendations.push('Monitor throughput trends');
    recommendations.push('Plan for capacity scaling');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: { responseTime: 0, throughput, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate: 0, availability: 0 },
    recommendations,
    performanceLevel,
  };
};

// CPU usage validation
export const validateCPUUsage = (cpuUsage: number, thresholds: PerformanceThresholds = defaultThresholds): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (cpuUsage < 0 || cpuUsage > 100) {
    errors.push('CPU usage must be between 0 and 100 percent');
    return {
      isValid: false,
      errors,
      warnings,
      metrics: { responseTime: 0, throughput: 0, cpuUsage, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate: 0, availability: 0 },
      recommendations,
      performanceLevel: 'poor',
    };
  }

  // Determine performance level
  if (cpuUsage <= thresholds.cpuUsage.excellent) {
    performanceLevel = 'excellent';
  } else if (cpuUsage <= thresholds.cpuUsage.good) {
    performanceLevel = 'good';
  } else if (cpuUsage <= thresholds.cpuUsage.fair) {
    performanceLevel = 'fair';
  } else {
    performanceLevel = 'poor';
  }

  // Generate recommendations
  if (cpuUsage > thresholds.cpuUsage.poor) {
    errors.push(`CPU usage is critically high: ${cpuUsage}%`);
    recommendations.push('Scale vertically by adding CPU resources');
    recommendations.push('Optimize CPU-intensive operations');
    recommendations.push('Implement load balancing to distribute load');
    recommendations.push('Review code for CPU bottlenecks');
  } else if (cpuUsage > thresholds.cpuUsage.fair) {
    warnings.push(`CPU usage is high: ${cpuUsage}%`);
    recommendations.push('Monitor CPU trends');
    recommendations.push('Consider performance optimizations');
    recommendations.push('Review application efficiency');
  } else if (cpuUsage > thresholds.cpuUsage.good) {
    recommendations.push('Monitor CPU utilization patterns');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: { responseTime: 0, throughput: 0, cpuUsage, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate: 0, availability: 0 },
    recommendations,
    performanceLevel,
  };
};

// Memory usage validation
export const validateMemoryUsage = (memoryUsage: number, thresholds: PerformanceThresholds = defaultThresholds): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (memoryUsage < 0 || memoryUsage > 100) {
    errors.push('Memory usage must be between 0 and 100 percent');
    return {
      isValid: false,
      errors,
      warnings,
      metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage, diskUsage: 0, networkLatency: 0, errorRate: 0, availability: 0 },
      recommendations,
      performanceLevel: 'poor',
    };
  }

  // Determine performance level
  if (memoryUsage <= thresholds.memoryUsage.excellent) {
    performanceLevel = 'excellent';
  } else if (memoryUsage <= thresholds.memoryUsage.good) {
    performanceLevel = 'good';
  } else if (memoryUsage <= thresholds.memoryUsage.fair) {
    performanceLevel = 'fair';
  } else {
    performanceLevel = 'poor';
  }

  // Generate recommendations
  if (memoryUsage > thresholds.memoryUsage.poor) {
    errors.push(`Memory usage is critically high: ${memoryUsage}%`);
    recommendations.push('Increase available memory');
    recommendations.push('Optimize memory usage in application code');
    recommendations.push('Check for memory leaks');
    recommendations.push('Implement memory caching strategies');
  } else if (memoryUsage > thresholds.memoryUsage.fair) {
    warnings.push(`Memory usage is high: ${memoryUsage}%`);
    recommendations.push('Monitor memory trends');
    recommendations.push('Review memory allocation patterns');
    recommendations.push('Consider memory optimization');
  } else if (memoryUsage > thresholds.memoryUsage.good) {
    recommendations.push('Monitor memory utilization');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage, diskUsage: 0, networkLatency: 0, errorRate: 0, availability: 0 },
    recommendations,
    performanceLevel,
  };
};

// Disk usage validation
export const validateDiskUsage = (diskUsage: number, thresholds: PerformanceThresholds = defaultThresholds): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (diskUsage < 0 || diskUsage > 100) {
    errors.push('Disk usage must be between 0 and 100 percent');
    return {
      isValid: false,
      errors,
      warnings,
      metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage, networkLatency: 0, errorRate: 0, availability: 0 },
      recommendations,
      performanceLevel: 'poor',
    };
  }

  // Determine performance level
  if (diskUsage <= thresholds.diskUsage.excellent) {
    performanceLevel = 'excellent';
  } else if (diskUsage <= thresholds.diskUsage.good) {
    performanceLevel = 'good';
  } else if (diskUsage <= thresholds.diskUsage.fair) {
    performanceLevel = 'fair';
  } else {
    performanceLevel = 'poor';
  }

  // Generate recommendations
  if (diskUsage > thresholds.diskUsage.poor) {
    errors.push(`Disk usage is critically high: ${diskUsage}%`);
    recommendations.push('Clean up unnecessary files and logs');
    recommendations.push('Add additional disk storage');
    recommendations.push('Implement data archiving strategies');
    recommendations.push('Review data retention policies');
  } else if (diskUsage > thresholds.diskUsage.fair) {
    warnings.push(`Disk usage is high: ${diskUsage}%`);
    recommendations.push('Monitor disk usage trends');
    recommendations.push('Plan for storage expansion');
    recommendations.push('Review data cleanup procedures');
  } else if (diskUsage > thresholds.diskUsage.good) {
    recommendations.push('Monitor disk utilization');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage, networkLatency: 0, errorRate: 0, availability: 0 },
    recommendations,
    performanceLevel,
  };
};

// Network latency validation
export const validateNetworkLatency = (networkLatency: number, thresholds: PerformanceThresholds = defaultThresholds): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (networkLatency < 0) {
    errors.push('Network latency cannot be negative');
    return {
      isValid: false,
      errors,
      warnings,
      metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency, errorRate: 0, availability: 0 },
      recommendations,
      performanceLevel: 'poor',
    };
  }

  // Determine performance level
  if (networkLatency <= thresholds.networkLatency.excellent) {
    performanceLevel = 'excellent';
  } else if (networkLatency <= thresholds.networkLatency.good) {
    performanceLevel = 'good';
  } else if (networkLatency <= thresholds.networkLatency.fair) {
    performanceLevel = 'fair';
  } else {
    performanceLevel = 'poor';
  }

  // Generate recommendations
  if (networkLatency > thresholds.networkLatency.poor) {
    errors.push(`Network latency is critically high: ${networkLatency}ms`);
    recommendations.push('Check network infrastructure');
    recommendations.push('Optimize network routing');
    recommendations.push('Consider CDN implementation');
    recommendations.push('Review network configuration');
  } else if (networkLatency > thresholds.networkLatency.fair) {
    warnings.push(`Network latency is high: ${networkLatency}ms`);
    recommendations.push('Monitor network performance');
    recommendations.push('Consider network optimizations');
  } else if (networkLatency > thresholds.networkLatency.good) {
    recommendations.push('Monitor network latency trends');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency, errorRate: 0, availability: 0 },
    recommendations,
    performanceLevel,
  };
};

// Error rate validation
export const validateErrorRate = (errorRate: number, thresholds: PerformanceThresholds = defaultThresholds): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (errorRate < 0 || errorRate > 100) {
    errors.push('Error rate must be between 0 and 100 percent');
    return {
      isValid: false,
      errors,
      warnings,
      metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate, availability: 0 },
      recommendations,
      performanceLevel: 'poor',
    };
  }

  // Determine performance level
  if (errorRate <= thresholds.errorRate.excellent) {
    performanceLevel = 'excellent';
  } else if (errorRate <= thresholds.errorRate.good) {
    performanceLevel = 'good';
  } else if (errorRate <= thresholds.errorRate.fair) {
    performanceLevel = 'fair';
  } else {
    performanceLevel = 'poor';
  }

  // Generate recommendations
  if (errorRate > thresholds.errorRate.poor) {
    errors.push(`Error rate is critically high: ${errorRate}%`);
    recommendations.push('Investigate root cause of errors');
    recommendations.push('Review application logs for error patterns');
    recommendations.push('Implement better error handling');
    recommendations.push('Consider system stability improvements');
  } else if (errorRate > thresholds.errorRate.fair) {
    warnings.push(`Error rate is high: ${errorRate}%`);
    recommendations.push('Monitor error trends');
    recommendations.push('Review error handling procedures');
  } else if (errorRate > thresholds.errorRate.good) {
    recommendations.push('Monitor error rate patterns');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate, availability: 0 },
    recommendations,
    performanceLevel,
  };
};

// Availability validation
export const validateAvailability = (availability: number, thresholds: PerformanceThresholds = defaultThresholds): PerformanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (availability < 0 || availability > 100) {
    errors.push('Availability must be between 0 and 100 percent');
    return {
      isValid: false,
      errors,
      warnings,
      metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate: 0, availability },
      recommendations,
      performanceLevel: 'poor',
    };
  }

  // Determine performance level
  if (availability >= thresholds.availability.excellent) {
    performanceLevel = 'excellent';
  } else if (availability >= thresholds.availability.good) {
    performanceLevel = 'good';
  } else if (availability >= thresholds.availability.fair) {
    performanceLevel = 'fair';
  } else {
    performanceLevel = 'poor';
  }

  // Generate recommendations
  if (availability < thresholds.availability.poor) {
    errors.push(`Availability is critically low: ${availability}%`);
    recommendations.push('Implement high availability architecture');
    recommendations.push('Add redundancy and failover mechanisms');
    recommendations.push('Review system reliability procedures');
    recommendations.push('Consider disaster recovery planning');
  } else if (availability < thresholds.availability.fair) {
    warnings.push(`Availability is low: ${availability}%`);
    recommendations.push('Monitor uptime trends');
    recommendations.push('Review system reliability');
  } else if (availability < thresholds.availability.good) {
    recommendations.push('Monitor availability metrics');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metrics: { responseTime: 0, throughput: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0, errorRate: 0, availability },
    recommendations,
    performanceLevel,
  };
};

// Comprehensive performance validation
export const validatePerformance = (
  metrics: PerformanceMetrics,
  thresholds: PerformanceThresholds = defaultThresholds
): PerformanceValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allRecommendations: string[] = [];
  const performanceLevels: ('excellent' | 'good' | 'fair' | 'poor')[] = [];

  // Validate each metric
  const responseTimeResult = validateResponseTime(metrics.responseTime, thresholds);
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

  const networkResult = validateNetworkLatency(metrics.networkLatency, thresholds);
  allErrors.push(...networkResult.errors);
  allWarnings.push(...networkResult.warnings);
  allRecommendations.push(...networkResult.recommendations);
  performanceLevels.push(networkResult.performanceLevel);

  const errorRateResult = validateErrorRate(metrics.errorRate, thresholds);
  allErrors.push(...errorRateResult.errors);
  allWarnings.push(...errorRateResult.warnings);
  allRecommendations.push(...errorRateResult.recommendations);
  performanceLevels.push(errorRateResult.performanceLevel);

  const availabilityResult = validateAvailability(metrics.availability, thresholds);
  allErrors.push(...availabilityResult.errors);
  allWarnings.push(...availabilityResult.warnings);
  allRecommendations.push(...availabilityResult.recommendations);
  performanceLevels.push(availabilityResult.performanceLevel);

  // Determine overall performance level
  const levelCounts = {
    excellent: performanceLevels.filter(level => level === 'excellent').length,
    good: performanceLevels.filter(level => level === 'good').length,
    fair: performanceLevels.filter(level => level === 'fair').length,
    poor: performanceLevels.filter(level => level === 'poor').length,
  };

  let overallLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';

  if (levelCounts.poor > 0) {
    overallLevel = 'poor';
  } else if (levelCounts.fair > 2) {
    overallLevel = 'fair';
  } else if (levelCounts.fair > 0 || levelCounts.good < 4) {
    overallLevel = 'good';
  }

  // Additional cross-metric recommendations
  if (metrics.cpuUsage > 80 && metrics.responseTime > thresholds.responseTime.fair) {
    allRecommendations.push('High CPU usage may be causing slow response times');
  }

  if (metrics.memoryUsage > 80 && metrics.errorRate > thresholds.errorRate.fair) {
    allRecommendations.push('High memory usage may be causing increased error rates');
  }

  if (metrics.diskUsage > 90 && metrics.availability < thresholds.availability.good) {
    allRecommendations.push('Low disk space may be affecting system availability');
  }

  // Remove duplicate recommendations
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
