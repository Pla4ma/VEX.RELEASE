export interface PerformanceTargets {
  minFps: number;
  targetFps: number;
  maxMemoryMb: number;
  maxLongTasksPerSecond: number;
  maxBundleSizeKb: number;
  maxAnimationDurationMs: number;
  maxNetworkRequestMs: number;
}

export interface PerformanceGateResult {
  passed: boolean;
  score: number;
  metrics: {
    fps: { current: number; average: number; target: number; passed: boolean };
    memory: { current: number; limit: number; passed: boolean };
    animations: { averageDuration: number; limit: number; passed: boolean };
    network: { averageResponseTime: number; limit: number; passed: boolean };
    bundle: { size: number; limit: number; passed: boolean };
  };
  issues: PerformanceIssue[];
  recommendations: string[];
  timestamp: number;
}

export interface PerformanceIssue {
  id: string;
  category: "fps" | "memory" | "animation" | "network" | "bundle" | "general";
  severity: "critical" | "major" | "moderate" | "minor";
  message: string;
  measurement?: number;
  target?: number;
  recommendation: string;
}
