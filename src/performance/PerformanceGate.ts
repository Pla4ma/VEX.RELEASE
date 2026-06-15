import { createDebugger } from '../utils/debug';
import { PerformanceMonitor, type PerformanceMetrics } from '../utils/performance-monitor';
import { eventBus } from '../events/EventBus';
import {
  type PerformanceTargets, type PerformanceGateResult, type PerformanceIssue,
  PRODUCTION_TARGETS, DEVELOPMENT_TARGETS,
} from './PerformanceGate-types';
import {
  evaluateFPS, evaluateMemory, evaluateAnimations, evaluateNetwork, evaluateBundle,
} from './PerformanceGate-evaluators';
import { generateRecommendations, generateReport as buildReport } from './PerformanceGate-report';

const debug = createDebugger('performance-gate');

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

  setTargets(targets: Partial<PerformanceTargets>): void {
    this.targets = { ...this.targets, ...targets };
    debug.info('Performance gate targets updated:', this.targets);
  }

  getTargets(): PerformanceTargets {
    return { ...this.targets };
  }

  restartMetricsCollection(): void {
    this.initializeMetricsCollection();
  }

  private initializeMetricsCollection(): void {
    this.performanceMonitor.start();
    this.performanceMonitor.onJank((metrics) => {
      this.recordPerformanceMetrics('jank', metrics);
    });
    this.setupNetworkMonitoring();
    this.setupAnimationMonitoring();
    debug.info('Performance metrics collection initialized');
  }

  private setupNetworkMonitoring(): void {
    const originalFetch = global.fetch;
    global.fetch = async (
      ...args: Parameters<typeof fetch>
    ): Promise<Response> => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        this.networkMetrics.push({ duration, timestamp: Date.now() });
        if (this.networkMetrics.length > 100) {
          this.networkMetrics = this.networkMetrics.slice(-100);
        }
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.networkMetrics.push({ duration, timestamp: Date.now() });
        throw error;
      }
    };
  }

  private setupAnimationMonitoring(): void {
    const originalRAF = global.requestAnimationFrame;
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      const start = performance.now();
      const wrappedCallback = (timestamp: number) => {
        const duration = performance.now() - start;
        this.animationMetrics.push({ duration, timestamp: Date.now() });
        if (this.animationMetrics.length > 50) {
          this.animationMetrics = this.animationMetrics.slice(-50);
        }
        return callback(timestamp);
      };
      return originalRAF(wrappedCallback);
    };
  }

  private recordPerformanceMetrics(
    type: string,
    metrics: PerformanceMetrics,
  ): void {
    eventBus.publish('performance:metric', { type, metrics, timestamp: Date.now() });
  }

  async evaluatePerformanceGate(): Promise<PerformanceGateResult> {
    debug.info('Evaluating performance gate...');
    const currentMetrics = this.performanceMonitor.getMetrics();
    const issues: PerformanceIssue[] = [];
    let score = 100;

    const fpsResult = evaluateFPS(currentMetrics, this.targets);
    issues.push(...fpsResult.issues);
    score -= fpsResult.scorePenalty;

    const memoryResult = evaluateMemory(currentMetrics, this.targets);
    issues.push(...memoryResult.issues);
    score -= memoryResult.scorePenalty;

    const animResult = evaluateAnimations(this.animationMetrics, this.targets);
    issues.push(...animResult.issues);
    score -= animResult.scorePenalty;

    const netResult = evaluateNetwork(this.networkMetrics, this.targets);
    issues.push(...netResult.issues);
    score -= netResult.scorePenalty;

    const bundleResult = evaluateBundle(this.bundleSize, this.targets);
    issues.push(...bundleResult.issues);
    score -= bundleResult.scorePenalty;

    const result: PerformanceGateResult = {
      passed: score >= 80,
      score: Math.max(0, score),
      metrics: {
        fps: fpsResult,
        memory: memoryResult,
        animations: animResult,
        network: netResult,
        bundle: bundleResult,
      },
      issues,
      recommendations: generateRecommendations(issues),
      timestamp: Date.now(),
    };
    debug.info('Performance gate evaluation complete:', {
      passed: result.passed,
      score: result.score,
      issuesCount: issues.length,
    });
    return result;
  }

  setBundleSize(size: number): void {
    this.bundleSize = size;
    debug.info(`Bundle size set to ${size}KB`);
  }

  getDiagnosticInfo(): {
    targets: PerformanceTargets;
    currentMetrics: PerformanceMetrics;
    isMonitoring: boolean;
  } {
    return {
      targets: this.targets,
      currentMetrics: this.performanceMonitor.getMetrics(),
      isMonitoring: this.performanceMonitor.isRunning,
    };
  }

  generateReport(result: PerformanceGateResult): string {
    return buildReport(result);
  }

  cleanup(): void {
    this.performanceMonitor.stop();
    this.networkMetrics = [];
    this.animationMetrics = [];
    debug.info('Performance gate cleaned up');
  }
}

export const performanceGate = PerformanceGate.getInstance();

export {
  type PerformanceTargets,
  type PerformanceGateResult,
  type PerformanceIssue,
  PRODUCTION_TARGETS,
  DEVELOPMENT_TARGETS,
} from './PerformanceGate-types';
