

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