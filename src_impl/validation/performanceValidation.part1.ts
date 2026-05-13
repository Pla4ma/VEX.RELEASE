

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