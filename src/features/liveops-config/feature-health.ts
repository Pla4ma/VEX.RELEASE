import type { FeatureKey } from './feature-access';

/**
 * Health status for a feature dependency or backend service.
 */
export type FeatureHealthStatus = 'healthy' | 'degraded' | 'unavailable';

/**
 * A health check that tests whether a feature's backend dependencies
 * are functioning correctly.
 */
export interface FeatureHealthCheck {
  /** Unique identifier for this health check */
  id: string;
  /** The feature this health check gates */
  feature: FeatureKey;
  /** Human-readable label for diagnostics */
  label: string;
  /** The dependency being checked (e.g. 'gemini', 'revenuecat', 'boss_template') */
  dependency: string;
  /** Execute the health check. Returns current status. */
  check: () => Promise<FeatureHealthStatus> | FeatureHealthStatus;
  /** How long to cache the result (ms). Default: 60000 (1 minute) */
  cacheMs?: number;
}

/**
 * Registry of all feature health checks.
 *
 * Health checks are polled periodically and cached.
 * When a health check returns 'unavailable', the gated feature
 * enters the 'degraded' state — unlocked but running in limited mode.
 *
 * Example failures:
 * - Content Study + Gemini unavailable → degraded
 * - Boss + boss template missing → degraded
 * - Shop + RevenueCat offerings fail → degraded
 * - AI Coach Advanced + quota exhausted → degraded
 */
class FeatureHealthRegistry {
  private checks = new Map<string, FeatureHealthCheck>();
  private cache = new Map<
    string,
    { status: FeatureHealthStatus; timestamp: number }
  >();

  register(check: FeatureHealthCheck): void {
    if (this.checks.has(check.id)) {
      return;
    }
    this.checks.set(check.id, check);
  }

  unregister(id: string): void {
    this.checks.delete(id);
  }

  /**
   * Returns the worst health status across all checks for a given feature.
   * 'healthy' means all dependencies are OK.
   * 'degraded' means at least one dependency is degraded.
   * 'unavailable' means at least one critical dependency is down.
   */
  async getFeatureHealth(feature: FeatureKey): Promise<FeatureHealthStatus> {
    const relevant = Array.from(this.checks.values()).filter(
      (c) => c.feature === feature,
    );

    if (relevant.length === 0) {
      return 'healthy';
    }

    let worst: FeatureHealthStatus = 'healthy';
    for (const check of relevant) {
      const status = await this.getCachedOrCheck(check);
      if (status === 'unavailable') {
        return 'unavailable';
      }
      if (status === 'degraded') {
        worst = 'degraded';
      }
    }
    return worst;
  }

  /**
   * Returns true if the feature should be marked as degraded
   * (unlocked but limited mode due to backend issues).
   */
  async shouldDegrade(feature: FeatureKey): Promise<boolean> {
    const status = await this.getFeatureHealth(feature);
    return status !== 'healthy';
  }

  /**
   * Returns all features that are currently unhealthy.
   */
  async getUnhealthyFeatures(): Promise<FeatureKey[]> {
    const results = new Set<FeatureKey>();
    for (const check of this.checks.values()) {
      const status = await this.getCachedOrCheck(check);
      if (status !== 'healthy') {
        results.add(check.feature);
      }
    }
    return Array.from(results);
  }

  /**
   * Returns unhealthy features, filtered by the provided set.
   * Only checks for features in the allowed set are executed.
   */
  async getUnhealthyFeaturesFiltered(
    allowedFeatures: ReadonlySet<FeatureKey>,
  ): Promise<FeatureKey[]> {
    const results = new Set<FeatureKey>();
    for (const check of this.checks.values()) {
      if (!allowedFeatures.has(check.feature)) {
        continue;
      }
      const status = await this.getCachedOrCheck(check);
      if (status !== 'healthy') {
        results.add(check.feature);
      }
    }
    return Array.from(results);
  }

  invalidateCache(feature?: FeatureKey): void {
    if (feature) {
      for (const [id, entry] of this.cache) {
        const check = this.checks.get(id);
        if (check?.feature === feature) {
          this.cache.delete(id);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getRegisteredIds(): string[] {
    return Array.from(this.checks.keys());
  }

  private async getCachedOrCheck(
    check: FeatureHealthCheck,
  ): Promise<FeatureHealthStatus> {
    const cached = this.cache.get(check.id);
    const cacheMs = check.cacheMs ?? 60000;
    if (cached && Date.now() - cached.timestamp < cacheMs) {
      return cached.status;
    }
    const status = await check.check();
    this.cache.set(check.id, { status, timestamp: Date.now() });
    return status;
  }
}

export const featureHealthRegistry = new FeatureHealthRegistry();
