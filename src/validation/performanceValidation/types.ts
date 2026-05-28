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
