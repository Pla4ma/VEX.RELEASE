import { createDebugger } from "./debug";
import { eventBus } from "../events";


export class PerformanceMonitor {
  private isRunning = false;
  private frameCount = 0;
  private lastFrameTime = 0;
  private jankFrameCount = 0;
  private longTaskCount = 0;
  private fpsHistory: number[] = [];
  private rafId: number | null = null;
  private thresholds: PerformanceThresholds;
  private onJankCallback?: (metrics: PerformanceMetrics) => void;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.isRunning) {return;}

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.monitorFrame();

    debug.info('Performance monitoring started');
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    debug.info('Performance monitoring stopped');
  }

  /**
   * Set jank detection callback
   */
  onJank(callback: (metrics: PerformanceMetrics) => void): void {
    this.onJankCallback = callback;
  }

  /**
   * Record a long task (manual tracking)
   */
  recordLongTask(duration: number): void {
    if (duration > 50) { // Over 50ms is considered long
      this.longTaskCount++;

      eventBus.publish('analytics:track', {
        event: 'performance_long_task',
        properties: { duration },
      });
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    const avgFps = this.fpsHistory.length > 0
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
      : 0;

    return {
      fps: this.fpsHistory[this.fpsHistory.length - 1] || 0,
      avgFps: Math.round(avgFps),
      jankFrames: this.jankFrameCount,
      memoryUsage: this.getMemoryUsage(),
      jsHeapSize: this.getJsHeapSize(),
      longTasks: this.longTaskCount,
      timestamp: Date.now(),
    };
  }

  /**
   * Check if performance is degraded
   */
  isDegraded(): boolean {
    const metrics = this.getMetrics();
    return (
      metrics.fps < this.thresholds.minFps ||
      metrics.jankFrames > this.thresholds.maxJankFrames ||
      metrics.memoryUsage > this.thresholds.maxMemoryMb ||
      metrics.longTasks > this.thresholds.maxLongTasks
    );
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private monitorFrame = (): void => {
    if (!this.isRunning) {return;}

    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Calculate FPS
    const fps = Math.round(1000 / delta);
    this.fpsHistory.push(fps);

    // Keep last 60 frames
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    // Detect jank (frame took too long)
    if (delta > 16.67) { // Over 16.67ms = under 60fps
      this.jankFrameCount++;

      // Report significant jank
      if (delta > 100) { // Over 100ms is severe jank
        this.reportJank(fps, delta);
      }
    }

    this.frameCount++;
    this.rafId = requestAnimationFrame(this.monitorFrame);
  };

  private reportJank(fps: number, delta: number): void {
    const metrics = this.getMetrics();

    debug.warn('Jank detected', { fps, delta: Math.round(delta) });

    eventBus.publish('analytics:track', {
      event: 'performance_jank',
      properties: {
        fps,
        frameDuration: Math.round(delta),
        memory: metrics.memoryUsage,
      },
    });

    if (this.onJankCallback) {
      this.onJankCallback(metrics);
    }
  }

  private getMemoryUsage(): number {
    const memory = (performance as PerformanceWithMemory).memory;
    if (memory) {
      return Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  private getJsHeapSize(): number {
    const memory = (performance as PerformanceWithMemory).memory;
    if (memory) {
      return Math.round(memory.totalJSHeapSize / 1024 / 1024);
    }
    return 0;
  }
}