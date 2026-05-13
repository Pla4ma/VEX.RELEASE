export interface PerformanceTargets {
    /** Minimum FPS for smooth experience */
    minFps: number;
    /** Target FPS for optimal experience */
    targetFps: number;
    /** Maximum memory usage in MB */
    maxMemoryMb: number;
    /** Maximum long tasks per second */
    maxLongTasksPerSecond: number;
    /** Maximum bundle size in KB */
    maxBundleSizeKb: number;
    /** Maximum animation duration in ms */
    maxAnimationDurationMs: number;
    /** Maximum network request time in ms */
    maxNetworkRequestMs: number;
}

export interface PerformanceGateResult {
    /** Overall pass/fail status */
    passed: boolean;
    /** Overall score (0-100) */
    score: number;
    /** Detailed metrics */
    metrics: {
        fps: {
          current: number;
          average: number;
          target: number;
          passed: boolean;
        };
        memory: {
          current: number;
          limit: number;
          passed: boolean;
        };
        animations: {
          averageDuration: number;
          limit: number;
          passed: boolean;
        };
        network: {
          averageResponseTime: number;
          limit: number;
          passed: boolean;
        };
        bundle: {
          size: number;
          limit: number;
          passed: boolean;
        };
        };
    /** Issues found */
    issues: PerformanceIssue[];
    /** Recommendations for improvement */
    recommendations: string[];
    /** Timestamp of the gate check */
    timestamp: number;
}

export interface PerformanceIssue {
    id: string;
    category: 'fps' | 'memory' | 'animation' | 'network' | 'bundle' | 'general';
    severity: 'critical' | 'major' | 'moderate' | 'minor';
    message: string;
    measurement?: number;
    target?: number;
    recommendation: string;
}
