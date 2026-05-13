

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