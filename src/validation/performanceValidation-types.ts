export interface PerformanceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metrics: PerformanceMetrics;
  recommendations: string[];
  performanceLevel: "excellent" | "good" | "fair" | "poor";
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
  networkLatency: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  errorRate: { excellent: number; good: number; fair: number; poor: number };
  availability: { excellent: number; good: number; fair: number; poor: number };
}
