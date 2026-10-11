type MetricRecorder = (duration: number) => void;

export class PerformanceGateInstrumentation {
  private originalFetch: typeof global.fetch | null = null;
  private wrappedFetch: typeof global.fetch | null = null;
  private originalRequestAnimationFrame:
    | typeof global.requestAnimationFrame
    | null = null;
  private wrappedRequestAnimationFrame:
    | typeof global.requestAnimationFrame
    | null = null;

  install(
    recordNetworkMetric: MetricRecorder,
    recordAnimationMetric: MetricRecorder,
  ): void {
    if (this.originalFetch === null) {
      const originalFetch = global.fetch;
      const wrappedFetch: typeof global.fetch = async (...args) => {
        const startedAt = performance.now();
        try {
          const response = await originalFetch(...args);
          recordNetworkMetric(performance.now() - startedAt);
          return response;
        } catch (error) {
          recordNetworkMetric(performance.now() - startedAt);
          throw error;
        }
      };
      this.originalFetch = originalFetch;
      this.wrappedFetch = wrappedFetch;
      global.fetch = wrappedFetch;
    }

    if (this.originalRequestAnimationFrame === null) {
      const originalRequestAnimationFrame = global.requestAnimationFrame;
      const wrappedRequestAnimationFrame: typeof global.requestAnimationFrame =
        (callback) => {
          const startedAt = performance.now();
          return originalRequestAnimationFrame((timestamp) => {
            recordAnimationMetric(performance.now() - startedAt);
            return callback(timestamp);
          });
        };
      this.originalRequestAnimationFrame = originalRequestAnimationFrame;
      this.wrappedRequestAnimationFrame = wrappedRequestAnimationFrame;
      global.requestAnimationFrame = wrappedRequestAnimationFrame;
    }
  }

  cleanup(): void {
    if (
      this.originalFetch !== null &&
      this.wrappedFetch !== null &&
      global.fetch === this.wrappedFetch
    ) {
      global.fetch = this.originalFetch;
    }
    if (
      this.originalRequestAnimationFrame !== null &&
      this.wrappedRequestAnimationFrame !== null &&
      global.requestAnimationFrame === this.wrappedRequestAnimationFrame
    ) {
      global.requestAnimationFrame = this.originalRequestAnimationFrame;
    }
    this.originalFetch = null;
    this.wrappedFetch = null;
    this.originalRequestAnimationFrame = null;
    this.wrappedRequestAnimationFrame = null;
  }
}
