/**
 * Performance Gate
 * 
 * Enforces performance targets for production readiness:
 * - FPS targets (60fps stable, 30fps minimum)
 * - Memory usage limits
 * - Animation performance
 * - Network request optimization
 * - Bundle size constraints
 */

import { createDebugger } from '../utils/debug';
import { PerformanceMonitor, measureExecutionTime, measureAsyncExecutionTime } from '../utils/performance-monitor';
import { eventBus } from '../events';
import type { EventChannels } from '../events/types';

const debug = createDebugger('performance-gate');

// ============================================================================
// Performance Targets and Thresholds
// ============================================================================

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

export const PRODUCTION_TARGETS: PerformanceTargets = {
  minFps: 30,
  targetFps: 60,
  maxMemoryMb: 150,
  maxLongTasksPerSecond: 2,
  maxBundleSizeKb: 1024, // 1MB
  maxAnimationDurationMs: 16.67, // 60fps
  maxNetworkRequestMs: 3000, // 3 seconds
};

export const DEVELOPMENT_TARGETS: PerformanceTargets = {
  ...PRODUCTION_TARGETS,
  maxMemoryMb: 200, // More lenient for development
  maxLongTasksPerSecond: 5,
  maxBundleSizeKb: 2048, // 2MB for development
};

// ============================================================================
// Performance Gate Class
// ============================================================================

export class PerformanceGate {
  private static instance: PerformanceGate;
  private targets: PerformanceTargets;
  private performanceMonitor: PerformanceMonitor;
  private networkMetrics: Array<{ duration: number; timestamp: number }> = [];
  private animationMetrics: Array<{ duration: number; timestamp: number }> = [];
  private bundleSize: number = 0;

  private constructor() {
    this.targets = __DEV__ ? DEVELOPMENT_TARGETS : PRODUCTION_TARGETS;
    this.performanceMonitor = new PerformanceMonitor();
    this.initializeMetricsCollection();
  }

  static getInstance(): PerformanceGate {
    if (!PerformanceGate.instance) {
      PerformanceGate.instance = new PerformanceGate();
    }
    return PerformanceGate.instance;
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  setTargets(targets: Partial<PerformanceTargets>): void {
    this.targets = { ...this.targets, ...targets };
    debug.info('Performance gate targets updated:', this.targets);
  }

  getTargets(): PerformanceTargets {
    return { ...this.targets };
  }

  // ============================================================================
  // Performance Metrics Collection
  // ============================================================================

  private initializeMetricsCollection(): void {
    // Start performance monitoring
    this.performanceMonitor.start();

    // Set up performance monitoring callbacks
    this.performanceMonitor.onJank((metrics) => {
      this.recordPerformanceMetrics('jank', metrics);
    });

    // Monitor network requests
    this.setupNetworkMonitoring();

    // Monitor animations
    this.setupAnimationMonitoring();

    debug.info('Performance metrics collection initialized');
  }

  private setupNetworkMonitoring(): void {
    // Override fetch to monitor network performance
    const originalFetch = global.fetch;
    
    global.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        this.networkMetrics.push({
          duration,
          timestamp: Date.now(),
        });

        // Keep only last 100 requests
        if (this.networkMetrics.length > 100) {
          this.networkMetrics = this.networkMetrics.slice(-100);
        }

        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.networkMetrics.push({
          duration,
          timestamp: Date.now(),
        });
        throw error;
      }
    };
  }

  private setupAnimationMonitoring(): void {
    // Monitor animation performance
    const originalRequestAnimationFrame = global.requestAnimationFrame;
    
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      const start = performance.now();
      
      const wrappedCallback = (timestamp: number) => {
        const duration = performance.now() - start;
        
        this.animationMetrics.push({
          duration,
          timestamp: Date.now(),
        });

        // Keep only last 50 animations
        if (this.animationMetrics.length > 50) {
          this.animationMetrics = this.animationMetrics.slice(-50);
        }

        return callback(timestamp);
      };

      return originalRequestAnimationFrame(wrappedCallback);
    };
  }

  private recordPerformanceMetrics(type: string, metrics: any): void {
    eventBus.publish('performance:metric', {
      type,
      metrics,
      timestamp: Date.now(),
    });
  }

  // ============================================================================
  // Performance Gate Evaluation
  // ============================================================================

  async evaluatePerformanceGate(): Promise<PerformanceGateResult> {
    debug.info('Evaluating performance gate...');

    const currentMetrics = this.performanceMonitor.getMetrics();
    const issues: PerformanceIssue[] = [];
    let score = 100;

    // FPS Evaluation
    const fpsResult = this.evaluateFPS(currentMetrics);
    issues.push(...fpsResult.issues);
    score -= fpsResult.scorePenalty;

    // Memory Evaluation
    const memoryResult = this.evaluateMemory(currentMetrics);
    issues.push(...memoryResult.issues);
    score -= memoryResult.scorePenalty;

    // Animation Evaluation
    const animationResult = this.evaluateAnimations();
    issues.push(...animationResult.issues);
    score -= animationResult.scorePenalty;

    // Network Evaluation
    const networkResult = this.evaluateNetwork();
    issues.push(...networkResult.issues);
    score -= networkResult.scorePenalty;

    // Bundle Evaluation
    const bundleResult = this.evaluateBundle();
    issues.push(...bundleResult.issues);
    score -= bundleResult.scorePenalty;

    const result: PerformanceGateResult = {
      passed: score >= 80, // 80% or higher passes
      score: Math.max(0, score),
      metrics: {
        fps: fpsResult,
        memory: memoryResult,
        animations: animationResult,
        network: networkResult,
        bundle: bundleResult,
      },
      issues,
      recommendations: this.generateRecommendations(issues),
      timestamp: Date.now(),
    };

    debug.info('Performance gate evaluation complete:', {
      passed: result.passed,
      score: result.score,
      issuesCount: issues.length,
    });

    return result;
  }

  private evaluateFPS(metrics: any): {
    current: number;
    average: number;
    target: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;

    const currentFps = metrics.fps || 0;
    const avgFps = metrics.avgFps || 0;
    const targetFps = this.targets.targetFps;
    const minFps = this.targets.minFps;

    // Check FPS below minimum
    if (currentFps < minFps) {
      issues.push({
        id: 'fps-below-minimum',
        category: 'fps',
        severity: 'critical',
        message: `Current FPS (${currentFps}) is below minimum threshold (${minFps})`,
        measurement: currentFps,
        target: minFps,
        recommendation: 'Optimize rendering pipeline, reduce complexity, or enable hardware acceleration',
      });
      scorePenalty += 30;
    }

    // Check FPS below target
    if (avgFps < targetFps * 0.9) { // Within 90% of target
      issues.push({
        id: 'fps-below-target',
        category: 'fps',
        severity: 'major',
        message: `Average FPS (${avgFps}) is below target (${targetFps})`,
        measurement: avgFps,
        target: targetFps,
        recommendation: 'Profile performance bottlenecks and optimize rendering code',
      });
      scorePenalty += 15;
    }

    return {
      current: currentFps,
      average: avgFps,
      target: targetFps,
      passed: currentFps >= minFps && avgFps >= targetFps * 0.9,
      issues,
      scorePenalty,
    };
  }

  private evaluateMemory(metrics: any): {
    current: number;
    limit: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;

    const currentMemory = metrics.memoryUsage || 0;
    const maxMemory = this.targets.maxMemoryMb;

    // Check memory usage
    if (currentMemory > maxMemory) {
      issues.push({
        id: 'memory-above-limit',
        category: 'memory',
        severity: 'critical',
        message: `Memory usage (${currentMemory}MB) exceeds limit (${maxMemory}MB)`,
        measurement: currentMemory,
        target: maxMemory,
        recommendation: 'Reduce memory usage by optimizing data structures and implementing memory pooling',
      });
      scorePenalty += 25;
    }

    return {
      current: currentMemory,
      limit: maxMemory,
      passed: currentMemory <= maxMemory,
      issues,
      scorePenalty,
    };
  }

  private evaluateAnimations(): {
    averageDuration: number;
    limit: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;

    if (this.animationMetrics.length === 0) {
      return {
        averageDuration: 0,
        limit: this.targets.maxAnimationDurationMs,
        passed: true,
        issues,
        scorePenalty,
      };
    }

    const avgDuration = this.animationMetrics.reduce((sum, m) => sum + m.duration, 0) / this.animationMetrics.length;
    const maxDuration = this.targets.maxAnimationDurationMs;

    // Check animation duration
    if (avgDuration > maxDuration) {
      issues.push({
        id: 'animation-too-slow',
        category: 'animation',
        severity: 'major',
        message: `Average animation duration (${avgDuration.toFixed(2)}ms) exceeds limit (${maxDuration}ms)`,
        measurement: avgDuration,
        target: maxDuration,
        recommendation: 'Use CSS transforms instead of JavaScript animations, or reduce animation complexity',
      });
      scorePenalty += 10;
    }

    return {
      averageDuration: avgDuration,
      limit: maxDuration,
      passed: avgDuration <= maxDuration,
      issues,
      scorePenalty,
    };
  }

  private evaluateNetwork(): {
    averageResponseTime: number;
    limit: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;

    if (this.networkMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        limit: this.targets.maxNetworkRequestMs,
        passed: true,
        issues,
        scorePenalty,
      };
    }

    const avgResponseTime = this.networkMetrics.reduce((sum, m) => sum + m.duration, 0) / this.networkMetrics.length;
    const maxResponseTime = this.targets.maxNetworkRequestMs;

    // Check network response time
    if (avgResponseTime > maxResponseTime) {
      issues.push({
        id: 'network-too-slow',
        category: 'network',
        severity: 'major',
        message: `Average network response time (${avgResponseTime.toFixed(2)}ms) exceeds limit (${maxResponseTime}ms)`,
        measurement: avgResponseTime,
        target: maxResponseTime,
        recommendation: 'Implement request caching, optimize API calls, or use CDN for static assets',
      });
      scorePenalty += 10;
    }

    return {
      averageResponseTime: avgResponseTime,
      limit: maxResponseTime,
      passed: avgResponseTime <= maxResponseTime,
      issues,
      scorePenalty,
    };
  }

  private evaluateBundle(): {
    size: number;
    limit: number;
    passed: boolean;
    issues: PerformanceIssue[];
    scorePenalty: number;
  } {
    const issues: PerformanceIssue[] = [];
    let scorePenalty = 0;

    const currentSize = this.bundleSize;
    const maxSize = this.targets.maxBundleSizeKb;

    // Check bundle size
    if (currentSize > maxSize) {
      issues.push({
        id: 'bundle-too-large',
        category: 'bundle',
        severity: 'critical',
        message: `Bundle size (${currentSize}KB) exceeds limit (${maxSize}KB)`,
        measurement: currentSize,
        target: maxSize,
        recommendation: 'Implement code splitting, tree shaking, and remove unused dependencies',
      });
      scorePenalty += 20;
    }

    return {
      size: currentSize,
      limit: maxSize,
      passed: currentSize <= maxSize,
      issues,
      scorePenalty,
    };
  }

  private generateRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations: string[] = [];
    const categories = new Set(issues.map(issue => issue.category));

    // General recommendations
    if (categories.has('fps') || categories.has('animation')) {
      recommendations.push('Enable hardware acceleration and use optimized rendering techniques');
    }

    if (categories.has('memory')) {
      recommendations.push('Implement memory pooling and optimize data structures');
    }

    if (categories.has('network')) {
      recommendations.push('Optimize API calls and implement request caching');
    }

    if (categories.has('bundle')) {
      recommendations.push('Use code splitting and remove unused dependencies');
    }

    // Specific recommendations from issues
    issues.forEach(issue => {
      if (!recommendations.includes(issue.recommendation)) {
        recommendations.push(issue.recommendation);
      }
    });

    return recommendations;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  setBundleSize(size: number): void {
    this.bundleSize = size;
    debug.info(`Bundle size set to ${size}KB`);
  }

  getDiagnosticInfo(): {
    targets: PerformanceTargets;
    currentMetrics: any;
    isMonitoring: boolean;
  } {
    return {
      targets: this.targets,
      currentMetrics: this.performanceMonitor.getMetrics(),
      isMonitoring: this.performanceMonitor.isRunning,
    };
  }

  generateReport(result: PerformanceGateResult): string {
    let report = `# Performance Gate Report\n\n`;
    report += `**Overall Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}**\n`;
    report += `**Score: ${result.score}/100**\n\n`;

    report += `## Metrics\n\n`;
    
    report += `### FPS\n`;
    report += `- Current: ${result.metrics.fps.current}\n`;
    report += `- Average: ${result.metrics.fps.average}\n`;
    report += `- Target: ${result.metrics.fps.target}\n`;
    report += `- Status: ${result.metrics.fps.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    report += `### Memory\n`;
    report += `- Current: ${result.metrics.memory.current}MB\n`;
    report += `- Limit: ${result.metrics.memory.limit}MB\n`;
    report += `- Status: ${result.metrics.memory.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    report += `### Animations\n`;
    report += `- Average Duration: ${result.metrics.animations.averageDuration.toFixed(2)}ms\n`;
    report += `- Limit: ${result.metrics.animations.limit}ms\n`;
    report += `- Status: ${result.metrics.animations.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    report += `### Network\n`;
    report += `- Average Response: ${result.metrics.network.averageResponseTime.toFixed(2)}ms\n`;
    report += `- Limit: ${result.metrics.network.limit}ms\n`;
    report += `- Status: ${result.metrics.network.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    report += `### Bundle\n`;
    report += `- Size: ${result.metrics.bundle.size}KB\n`;
    report += `- Limit: ${result.metrics.bundle.limit}KB\n`;
    report += `- Status: ${result.metrics.bundle.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    if (result.issues.length > 0) {
      report += `## Issues Found\n\n`;
      result.issues.forEach(issue => {
        report += `### ${issue.category.toUpperCase()}: ${issue.message}\n`;
        report += `- **Severity:** ${issue.severity}\n`;
        report += `- **Recommendation:** ${issue.recommendation}\n\n`;
      });
    }

    if (result.recommendations.length > 0) {
      report += `## General Recommendations\n\n`;
      result.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    return report;
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  cleanup(): void {
    this.performanceMonitor.stop();
    this.networkMetrics = [];
    this.animationMetrics = [];
    debug.info('Performance gate cleaned up');
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const performanceGate = PerformanceGate.getInstance();