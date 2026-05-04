/**
 * Performance Optimizer
 * 
 * Optimizes combat system performance for memory and CPU usage.
 * Includes frame rate limiting, object pooling, and memory management.
 */

import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:v2:performance');

// ============================================================================
// Types
// ============================================================================

export interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  updateTime: number;
  activeObjects: number;
  pooledObjects: number;
}

export interface PerformanceConfig {
  targetFrameRate: number;
  maxMemoryUsage: number;
  enableObjectPooling: boolean;
  enableFrameSkipping: boolean;
  maxUpdateInterval: number;
  garbageCollectionInterval: number;
}

// ============================================================================
// Object Pool
// ============================================================================

export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize: number = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool = [];
  }

  size(): number {
    return this.pool.length;
  }
}

// ============================================================================
// Frame Rate Limiter
// ============================================================================

export class FrameRateLimiter {
  private targetFPS: number;
  private frameInterval: number;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  private currentFPS: number = 0;

  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
  }

  shouldUpdate(): boolean {
    const now = performance.now();
    
    if (now - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = now;
      this.frameCount++;
      
      // Update FPS counter every second
      if (now - this.fpsUpdateTime >= 1000) {
        this.currentFPS = this.frameCount;
        this.frameCount = 0;
        this.fpsUpdateTime = now;
      }
      
      return true;
    }
    
    return false;
  }

  getCurrentFPS(): number {
    return this.currentFPS;
  }

  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }
}

// ============================================================================
// Memory Manager
// ============================================================================

export class MemoryManager {
  private memoryThreshold: number;
  private gcInterval: number;
  private lastGC: number = 0;
  private memoryUsage: number = 0;

  constructor(memoryThreshold: number = 50 * 1024 * 1024, gcInterval: number = 30000) {
    this.memoryThreshold = memoryThreshold;
    this.gcInterval = gcInterval;
  }

  updateMemoryUsage(): void {
    // In a real implementation, this would use performance.memory or native APIs
    // For now, we'll simulate memory tracking
    this.memoryUsage = Math.random() * 100 * 1024 * 1024; // Random between 0-100MB
  }

  shouldGarbageCollect(): boolean {
    const now = Date.now();
    return (now - this.lastGC >= this.gcInterval) || (this.memoryUsage > this.memoryThreshold);
  }

  performGarbageCollection(): void {
    this.lastGC = Date.now();
    
    // Force garbage collection if available
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
    
    debug.info('Garbage collection performed');
  }

  getMemoryUsage(): number {
    return this.memoryUsage;
  }

  getMemoryUsageMB(): number {
    return this.memoryUsage / (1024 * 1024);
  }
}

// ============================================================================
// Performance Optimizer
// ============================================================================

export class PerformanceOptimizer {
  private config: PerformanceConfig;
  private frameRateLimiter: FrameRateLimiter;
  private memoryManager: MemoryManager;
  private objectPools: Map<string, ObjectPool<any>> = new Map();
  private metrics: PerformanceMetrics;
  private lastUpdateTime: number = 0;
  private updateCount: number = 0;

  // Public getters for private properties
  public getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  public getUpdateCount(): number {
    return this.updateCount;
  }

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      targetFrameRate: 60,
      maxMemoryUsage: 50 * 1024 * 1024,
      enableObjectPooling: true,
      enableFrameSkipping: true,
      maxUpdateInterval: 16, // 60 FPS
      garbageCollectionInterval: 30000,
      ...config,
    };

    this.frameRateLimiter = new FrameRateLimiter(this.config.targetFrameRate);
    this.memoryManager = new MemoryManager(this.config.maxMemoryUsage, this.config.garbageCollectionInterval);

    this.metrics = {
      frameRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      renderTime: 0,
      updateTime: 0,
      activeObjects: 0,
      pooledObjects: 0,
    };

    debug.info('PerformanceOptimizer initialized');
  }

  // ============================================================================
  // Update Loop
  // ============================================================================

  shouldUpdate(): boolean {
    if (!this.config.enableFrameSkipping) {
      return true;
    }

    return this.frameRateLimiter.shouldUpdate();
  }

  update(timestamp: number): void {
    const startTime = performance.now();
    
    // Update frame rate
    this.metrics.frameRate = this.frameRateLimiter.getCurrentFPS();
    
    // Update memory usage
    this.memoryManager.updateMemoryUsage();
    this.metrics.memoryUsage = this.memoryManager.getMemoryUsage();
    
    // Check if garbage collection is needed
    if (this.memoryManager.shouldGarbageCollect()) {
      this.memoryManager.performGarbageCollection();
    }
    
    // Update metrics
    this.metrics.updateTime = performance.now() - startTime;
    this.metrics.pooledObjects = this.getTotalPooledObjects();
    
    this.lastUpdateTime = timestamp;
    this.updateCount++;
  }

  // ============================================================================
  // Object Pooling
  // ============================================================================

  createObjectPool<T>(
    name: string,
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize: number = 100
  ): ObjectPool<T> {
    if (!this.config.enableObjectPooling) {
      throw new Error('Object pooling is disabled');
    }

    const pool = new ObjectPool(createFn, resetFn, maxSize);
    this.objectPools.set(name, pool);
    
    debug.info('Object pool created: %s', name);
    return pool;
  }

  getObjectPool<T>(name: string): ObjectPool<T> | undefined {
    return this.objectPools.get(name);
  }

  clearObjectPool(name: string): void {
    const pool = this.objectPools.get(name);
    if (pool) {
      pool.clear();
    }
  }

  clearAllObjectPools(): void {
    for (const pool of this.objectPools.values()) {
      pool.clear();
    }
  }

  private getTotalPooledObjects(): number {
    let total = 0;
    for (const pool of this.objectPools.values()) {
      total += pool.size();
    }
    return total;
  }

  // ============================================================================
  // Performance Monitoring
  // ============================================================================

  getPerformanceReport(): {
    status: 'GOOD' | 'WARNING' | 'CRITICAL';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check frame rate
    if (this.metrics.frameRate < 30) {
      issues.push(`Low frame rate: ${this.metrics.frameRate.toFixed(1)} FPS`);
      recommendations.push('Reduce visual effects or lower target frame rate');
    }
    
    // Check memory usage
    if (this.metrics.memoryUsage > this.config.maxMemoryUsage * 0.8) {
      issues.push(`High memory usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(1)} MB`);
      recommendations.push('Clear object pools or reduce cache sizes');
    }
    
    // Check update time
    if (this.metrics.updateTime > this.config.maxUpdateInterval) {
      issues.push(`Slow update time: ${this.metrics.updateTime.toFixed(1)} ms`);
      recommendations.push('Optimize update logic or reduce update frequency');
    }
    
    let status: 'GOOD' | 'WARNING' | 'CRITICAL' = 'GOOD';
    if (issues.length >= 3) {
      status = 'CRITICAL';
    } else if (issues.length > 0) {
      status = 'WARNING';
    }
    
    return { status, issues, recommendations };
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.targetFrameRate) {
      this.frameRateLimiter.setTargetFPS(newConfig.targetFrameRate);
    }
    
    if (newConfig.maxMemoryUsage) {
      this.memoryManager = new MemoryManager(newConfig.maxMemoryUsage, this.config.garbageCollectionInterval);
    }
    
    debug.info('Performance config updated');
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  // ============================================================================
  // Debug and Diagnostics
  // ============================================================================

  enableDebugMode(): void {
    debug.info('Performance debug mode enabled');
    
    // Log metrics every 5 seconds
    setInterval(() => {
      const report = this.getPerformanceReport();
      debug.info('Performance Status: %s', report.status);
      if (report.issues.length > 0) {
        debug.warn('Performance Issues: %o', report.issues);
      }
    }, 5000);
  }

  exportMetrics(): string {
    const metrics = this.getMetrics();
    const report = this.getPerformanceReport();
    
    return JSON.stringify({
      timestamp: Date.now(),
      metrics,
      report,
      config: this.config,
      objectPools: Array.from(this.objectPools.entries()).map(([name, pool]) => ({
        name,
        size: pool.size(),
      })),
    }, null, 2);
  }
}

// ============================================================================
// Combat-Specific Optimizations
// ============================================================================

export class CombatPerformanceOptimizer extends PerformanceOptimizer {
  private combatObjectPools: {
    combatActions: ObjectPool<CombatAction>;
    animations: ObjectPool<Animation>;
    particles: ObjectPool<Particle>;
  };

  constructor() {
    super({
      targetFrameRate: 60,
      maxMemoryUsage: 30 * 1024 * 1024, // 30MB for combat
      enableObjectPooling: true,
      enableFrameSkipping: true,
      maxUpdateInterval: 16,
      garbageCollectionInterval: 20000, // More frequent GC for combat
    });

    // Initialize combat-specific object pools
    this.combatObjectPools = {
      combatActions: this.createObjectPool(
        'combatActions',
        () => ({ type: 'ABILITY', timestamp: 0, data: {} }),
        (action) => { action.timestamp = 0; },
        50
      ),
      animations: this.createObjectPool(
        'animations',
        () => ({ id: '', type: 'DAMAGE', duration: 0, startTime: 0 }),
        (animation) => { animation.startTime = 0; },
        20
      ),
      particles: this.createObjectPool(
        'particles',
        () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '' }),
        (particle) => { particle.life = 0; },
        100
      ),
    };
  }

  // ============================================================================
  // Combat-Specific Methods
  // ============================================================================

  optimizeCombatUpdate(sessionData: any): void {
    // Skip updates if frame rate is too low
    if (this.metrics.frameRate < 30 && this.config.enableFrameSkipping) {
      return;
    }

    // Limit combat action processing
    const maxActionsPerFrame = 10;
    // Process only the most recent actions
    // This would be implemented based on actual combat system
  }

  optimizeRendering(renderData: any): any {
    // Reduce particle effects if performance is poor
    if (this.getMetrics().frameRate < 45) {
      // Reduce particle count
      return this.reduceParticleEffects(renderData);
    }

    return renderData;
  }

  private reduceParticleEffects(renderData: any): any {
    // Implementation would reduce particle count based on performance
    return renderData;
  }

  // ============================================================================
  // Combat Metrics
  // ============================================================================

  getCombatMetrics(): {
    performance: PerformanceMetrics;
    combat: {
      actionsProcessed: number;
      particlesActive: number;
      animationsActive: number;
      optimizationLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    };
  } {
    const performance = this.getMetrics();
    
    let optimizationLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (performance.frameRate < 30) {
      optimizationLevel = 'LOW';
    } else if (performance.frameRate < 45) {
      optimizationLevel = 'MEDIUM';
    }

    return {
      performance,
      combat: {
        actionsProcessed: this.getUpdateCount(),
        particlesActive: this.combatObjectPools.particles.size(),
        animationsActive: this.combatObjectPools.animations.size(),
        optimizationLevel,
      },
    };
  }
}

// ============================================================================
// Types
// ============================================================================

interface CombatAction {
  type: string;
  timestamp: number;
  data: any;
}

interface Animation {
  id: string;
  type: string;
  duration: number;
  startTime: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
