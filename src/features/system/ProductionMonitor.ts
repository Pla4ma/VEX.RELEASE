/**
 * Production Monitor
 *
 * Phase 8E: Post-Production Optimization - Production monitoring and scaling preparation
 *
 * Implements comprehensive monitoring, alerting, and scaling preparation for production deployment.
 * Ensures system reliability, performance tracking, and operational readiness.
 */

import { z } from 'zod';
import { eventBus } from '../../events';

// ============================================================================
// Production Monitoring Constants
// ============================================================================

export const PRODUCTION_MONITORING_CONFIG = {
  // Monitoring targets
  MONITORING_TARGETS: {
    UPTIME: 99.9,           // 99.9% uptime target
    RESPONSE_TIME: 200,     // 200ms average response time
    ERROR_RATE: 0.01,       // 1% error rate max
    THROUGHPUT: 1000,       // 1000 requests/second
    MEMORY_USAGE: 80,       // 80% memory usage max
    CPU_USAGE: 70,          // 70% CPU usage max
  },

  // Alert thresholds
  ALERT_THRESHOLDS: {
    CRITICAL: {
      uptime: 99.0,
      responseTime: 500,
      errorRate: 0.05,
      memoryUsage: 90,
      cpuUsage: 85,
    },
    WARNING: {
      uptime: 99.5,
      responseTime: 300,
      errorRate: 0.02,
      memoryUsage: 80,
      cpuUsage: 70,
    },
  },

  // Scaling triggers
  SCALING_TRIGGERS: {
    CPU_HIGH: 80,           // Scale up at 80% CPU
    MEMORY_HIGH: 85,        // Scale up at 85% memory
    RESPONSE_TIME_HIGH: 400, // Scale up at 400ms response time
    THROUGHPUT_HIGH: 800,    // Scale up at 800 req/s
  },

  // Monitoring intervals
  MONITORING_INTERVALS: {
    METRICS: 60000,         // 1 minute
    HEALTH_CHECKS: 30000,   // 30 seconds
    PERFORMANCE: 120000,    // 2 minutes
    SCALING: 300000,        // 5 minutes
  },
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const AlertLevelSchema = z.enum(['info', 'warning', 'critical', 'emergency']);
export const SystemStatusSchema = z.enum(['healthy', 'degraded', 'critical', 'down']);
export const ScalingActionSchema = z.enum(['scale_up', 'scale_down', 'scale_out', 'scale_in']);

export const SystemMetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  threshold: z.number(),
  status: z.enum(['normal', 'warning', 'critical']),
  timestamp: z.number(),
});

export const AlertSchema = z.object({
  id: z.string(),
  level: AlertLevelSchema,
  system: z.string(),
  metric: z.string(),
  message: z.string(),
  value: z.number(),
  threshold: z.number(),
  timestamp: z.number(),
  acknowledged: z.boolean().default(false),
  resolved: z.boolean().default(false),
  resolvedAt: z.number().nullable().default(null),
});

export const ScalingEventSchema = z.object({
  id: z.string(),
  action: ScalingActionSchema,
  trigger: z.string(),
  currentValue: z.number(),
  threshold: z.number(),
  timestamp: z.number(),
  completed: z.boolean().default(false),
  completedAt: z.number().nullable().default(null),
});

export interface ProductionHealth {
  overallStatus: SystemStatus;
  systems: Record<string, {
    status: SystemStatus;
    metrics: SystemMetricSchema[];
    lastCheck: number;
    uptime: number;
  }>;
  activeAlerts: AlertSchema[];
  recentScaling: ScalingEventSchema[];
}

export interface ScalingPlan {
  currentCapacity: {
    instances: number;
    cpu: number;
    memory: number;
    throughput: number;
  };
  projectedLoad: {
    users: number;
    requests: number;
    data: number;
  };
  recommendations: Array<{
    action: ScalingActionSchema;
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedTime: string;
    resources: string[];
  }>;
}

// ============================================================================
// Production Monitor Service
// ============================================================================

export class ProductionMonitor {
  private systemHealth: Map<string, any> = new Map();
  private activeAlerts: Map<string, AlertSchema> = new Map();
  private scalingHistory: Map<string, ScalingEventSchema> = new Map();
  private isMonitoring: boolean = false;
  private monitoringIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  /**
   * Start production monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('[ProductionMonitor] Monitoring already active');
      return;
    }

    console.log('[ProductionMonitor] Starting comprehensive production monitoring');
    this.isMonitoring = true;

    // Start monitoring intervals
    this.startMetricsCollection();
    this.startHealthChecks();
    this.startPerformanceMonitoring();
    this.startScalingMonitoring();

    // Initial health assessment
    await this.performHealthAssessment();

    // Emit monitoring start event
    eventBus.publish('production_monitor:started', {
      timestamp: Date.now(),
      monitoringIntervals: Object.keys(PRODUCTION_MONITORING_CONFIG.MONITORING_INTERVALS),
    });
  }

  /**
   * Stop production monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) return;

    console.log('[ProductionMonitor] Stopping production monitoring');
    this.isMonitoring = false;

    // Clear all intervals
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals.clear();

    // Generate final report
    const finalReport = await this.generateProductionReport();

    // Emit monitoring stop event
    eventBus.publish('production_monitor:stopped', {
      timestamp: Date.now(),
      finalReport,
    });
  }

  /**
   * Get current production health
   */
  async getProductionHealth(): Promise<ProductionHealth> {
    const systems = await this.collectSystemMetrics();
    const activeAlerts = Array.from(this.activeAlerts.values());
    const recentScaling = Array.from(this.scalingHistory.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(systems, activeAlerts);

    return {
      overallStatus,
      systems,
      activeAlerts,
      recentScaling,
    };
  }

  /**
   * Generate scaling plan
   */
  async generateScalingPlan(): Promise<ScalingPlan> {
    const currentMetrics = await this.collectSystemMetrics();
    const currentLoad = await this.getCurrentLoad();
    const projectedLoad = await this.getProjectedLoad();

    const currentCapacity = {
      instances: 5, // Would get from actual infrastructure
      cpu: currentMetrics.api?.cpu || 0,
      memory: currentMetrics.api?.memory || 0,
      throughput: currentMetrics.api?.throughput || 0,
    };

    const recommendations = this.generateScalingRecommendations(currentCapacity, currentLoad, projectedLoad);

    return {
      currentCapacity,
      projectedLoad,
      recommendations,
    };
  }

  /**
   * Trigger manual scaling action
   */
  async triggerScaling(action: ScalingActionSchema, reason: string): Promise<ScalingEventSchema> {
    const scalingId = `scaling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scalingEvent: ScalingEventSchema = {
      id: scalingId,
      action,
      trigger: 'manual',
      currentValue: 0,
      threshold: 0,
      timestamp: Date.now(),
      completed: false,
    };

    this.scalingHistory.set(scalingId, scalingEvent);

    // Simulate scaling action
    setTimeout(() => {
      scalingEvent.completed = true;
      scalingEvent.completedAt = Date.now();
      this.scalingHistory.set(scalingId, scalingEvent);

      eventBus.publish('production_monitor:scaling_completed', {
        scalingId,
        action,
        completedAt: scalingEvent.completedAt,
      });
    }, 30000); // 30 seconds scaling time

    // Emit scaling trigger event
    eventBus.publish('production_monitor:scaling_triggered', {
      scalingId,
      action,
      reason,
    });

    return scalingEvent;
  }

  // ============================================================================
  // Private Monitoring Methods
  // ============================================================================

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    const interval = setInterval(async () => {
      if (!this.isMonitoring) return;
      await this.collectMetrics();
    }, PRODUCTION_MONITORING_CONFIG.MONITORING_INTERVALS.METRICS);

    this.monitoringIntervals.set('metrics', interval);
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    const interval = setInterval(async () => {
      if (!this.isMonitoring) return;
      await this.performHealthChecks();
    }, PRODUCTION_MONITORING_CONFIG.MONITORING_INTERVALS.HEALTH_CHECKS);

    this.monitoringIntervals.set('health', interval);
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    const interval = setInterval(async () => {
      if (!this.isMonitoring) return;
      await this.monitorPerformance();
    }, PRODUCTION_MONITORING_CONFIG.MONITORING_INTERVALS.PERFORMANCE);

    this.monitoringIntervals.set('performance', interval);
  }

  /**
   * Start scaling monitoring
   */
  private startScalingMonitoring(): void {
    const interval = setInterval(async () => {
      if (!this.isMonitoring) return;
      await this.checkScalingTriggers();
    }, PRODUCTION_MONITORING_CONFIG.MONITORING_INTERVALS.SCALING);

    this.monitoringIntervals.set('scaling', interval);
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    const metrics = await this.collectSystemMetrics();
    
    // Check for alerts
    Object.entries(metrics).forEach(([system, systemMetrics]) => {
      systemMetrics.metrics.forEach(metric => {
        if (metric.status === 'warning' || metric.status === 'critical') {
          this.createAlert(system, metric);
        }
      });
    });

    // Store metrics
    this.systemHealth.set('current', metrics);
  }

  /**
   * Collect system metrics from all systems
   */
  private async collectSystemMetrics(): Promise<Record<string, any>> {
    // Simulate metrics collection (in real implementation, this would query actual systems)
    const mockMetrics = {
      api: {
        status: 'healthy',
        metrics: [
          { name: 'response_time', value: 150, unit: 'ms', threshold: 200, status: 'normal', timestamp: Date.now() },
          { name: 'error_rate', value: 0.005, unit: '%', threshold: 0.01, status: 'normal', timestamp: Date.now() },
          { name: 'cpu_usage', value: 45, unit: '%', threshold: 70, status: 'normal', timestamp: Date.now() },
          { name: 'memory_usage', value: 65, unit: '%', threshold: 80, status: 'normal', timestamp: Date.now() },
          { name: 'throughput', value: 850, unit: 'req/s', threshold: 1000, status: 'normal', timestamp: Date.now() },
        ],
        lastCheck: Date.now(),
        uptime: 99.95,
      },
      database: {
        status: 'healthy',
        metrics: [
          { name: 'connection_pool', value: 75, unit: '%', threshold: 80, status: 'normal', timestamp: Date.now() },
          { name: 'query_time', value: 25, unit: 'ms', threshold: 100, status: 'normal', timestamp: Date.now() },
          { name: 'connections', value: 45, unit: 'count', threshold: 100, status: 'normal', timestamp: Date.now() },
        ],
        lastCheck: Date.now(),
        uptime: 99.99,
      },
      cache: {
        status: 'healthy',
        metrics: [
          { name: 'hit_rate', value: 95, unit: '%', threshold: 90, status: 'normal', timestamp: Date.now() },
          { name: 'memory_usage', value: 70, unit: '%', threshold: 80, status: 'normal', timestamp: Date.now() },
        ],
        lastCheck: Date.now(),
        uptime: 99.98,
      },
      ai_coach: {
        status: 'degraded',
        metrics: [
          { name: 'response_time', value: 350, unit: 'ms', threshold: 200, status: 'warning', timestamp: Date.now() },
          { name: 'prediction_accuracy', value: 85, unit: '%', threshold: 90, status: 'warning', timestamp: Date.now() },
        ],
        lastCheck: Date.now(),
        uptime: 99.8,
      },
    };

    return mockMetrics;
  }

  /**
   * Perform health checks
   */
  private async performHealthChecks(): Promise<void> {
    const systems = await this.collectSystemMetrics();
    
    Object.entries(systems).forEach(([systemName, systemData]) => {
      if (systemData.status !== 'healthy') {
        this.createAlert(systemName, {
          name: 'health_check',
          value: 0,
          unit: 'status',
          threshold: 1,
          status: systemData.status === 'critical' ? 'critical' : 'warning',
          timestamp: Date.now(),
        });
      }
    });
  }

  /**
   * Monitor performance
   */
  private async monitorPerformance(): Promise<void> {
    const metrics = await this.collectSystemMetrics();
    
    // Check performance degradation
    Object.entries(metrics).forEach(([system, systemData]) => {
      systemData.metrics.forEach(metric => {
        if (metric.name === 'response_time' && metric.value > PRODUCTION_MONITORING_CONFIG.MONITORING_TARGETS.RESPONSE_TIME) {
          this.createAlert(system, metric);
        }
      });
    });
  }

  /**
   * Check scaling triggers
   */
  private async checkScalingTriggers(): Promise<void> {
    const metrics = await this.collectSystemMetrics();
    const apiMetrics = metrics.api;

    if (!apiMetrics) return;

    // Check scaling triggers
    const triggers = [
      { metric: 'cpu_usage', threshold: PRODUCTION_MONITORING_CONFIG.SCALING_TRIGGERS.CPU_HIGH },
      { metric: 'memory_usage', threshold: PRODUCTION_MONITORING_CONFIG.SCALING_TRIGGERS.MEMORY_HIGH },
      { metric: 'response_time', threshold: PRODUCTION_MONITORING_CONFIG.SCALING_TRIGGERS.RESPONSE_TIME_HIGH },
      { metric: 'throughput', threshold: PRODUCTION_MONITORING_CONFIG.SCALING_TRIGGERS.THROUGHPUT_HIGH },
    ];

    triggers.forEach(trigger => {
      const metric = apiMetrics.metrics.find(m => m.name === trigger.metric);
      if (metric && metric.value > trigger.threshold) {
        this.triggerAutoScaling('scale_up', `High ${trigger.metric}: ${metric.value}${metric.unit}`);
      }
    });
  }

  /**
   * Trigger automatic scaling
   */
  private async triggerAutoScaling(action: ScalingActionSchema, reason: string): Promise<void> {
    const scalingId = `auto_scaling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scalingEvent: ScalingEventSchema = {
      id: scalingId,
      action,
      trigger: 'automatic',
      currentValue: 0,
      threshold: 0,
      timestamp: Date.now(),
      completed: false,
    };

    this.scalingHistory.set(scalingId, scalingEvent);

    // Emit auto-scaling event
    eventBus.publish('production_monitor:auto_scaling_triggered', {
      scalingId,
      action,
      reason,
    });
  }

  /**
   * Create alert
   */
  private createAlert(system: string, metric: SystemMetricSchema): void {
    const alertId = `alert_${system}_${metric.name}_${Date.now()}`;
    
    const alert: AlertSchema = {
      id: alertId,
      level: metric.status === 'critical' ? 'critical' : 'warning',
      system,
      metric: metric.name,
      message: `${system} ${metric.name} is ${metric.value}${metric.unit} (threshold: ${metric.threshold}${metric.unit})`,
      value: metric.value,
      threshold: metric.threshold,
      timestamp: Date.now(),
    };

    this.activeAlerts.set(alertId, alert);

    // Emit alert event
    eventBus.publish('production_monitor:alert_created', {
      alertId,
      level: alert.level,
      system,
      metric: metric.name,
    });
  }

  /**
   * Perform health assessment
   */
  private async performHealthAssessment(): Promise<void> {
    const health = await this.getProductionHealth();
    
    // Create summary alert for critical issues
    if (health.overallStatus === 'critical') {
      this.createAlert('system', {
        name: 'overall_health',
        value: 0,
        unit: 'status',
        threshold: 1,
        status: 'critical',
        timestamp: Date.now(),
      });
    }

    console.log(`[ProductionMonitor] Health assessment complete: ${health.overallStatus}`);
  }

  /**
   * Calculate overall system status
   */
  private calculateOverallStatus(systems: Record<string, any>, alerts: AlertSchema[]): SystemStatus {
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    const warningAlerts = alerts.filter(a => a.level === 'warning');
    
    const criticalSystems = Object.values(systems).filter(s => s.status === 'critical').length;
    const degradedSystems = Object.values(systems).filter(s => s.status === 'degraded').length;

    if (criticalAlerts.length > 0 || criticalSystems > 0) return 'critical';
    if (warningAlerts.length > 0 || degradedSystems > 0) return 'degraded';
    return 'healthy';
  }

  /**
   * Get current load
   */
  private async getCurrentLoad(): Promise<any> {
    // Simulate current load metrics
    return {
      users: 5000,
      requests: 850,
      data: 2.5, // GB
    };
  }

  /**
   * Get projected load
   */
  private async getProjectedLoad(): Promise<any> {
    // Simulate projected load (would use analytics and trends)
    return {
      users: 7500,
      requests: 1200,
      data: 3.8, // GB
    };
  }

  /**
   * Generate scaling recommendations
   */
  private generateScalingRecommendations(currentCapacity: any, currentLoad: any, projectedLoad: any): Array<{
    action: ScalingActionSchema;
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedTime: string;
    resources: string[];
  }> {
    const recommendations = [];

    // Check if scaling is needed based on projected load
    const loadIncrease = projectedLoad.requests / currentCapacity.throughput;
    
    if (loadIncrease > 0.8) {
      recommendations.push({
        action: 'scale_up',
        reason: `Projected load increase of ${Math.round((loadIncrease - 1) * 100)}% exceeds capacity`,
        priority: 'high',
        estimatedTime: '5-10 minutes',
        resources: ['CPU', 'Memory', 'Load Balancer'],
      });
    }

    // Check for over-provisioning
    if (currentCapacity.cpu < 30 && currentCapacity.memory < 40) {
      recommendations.push({
        action: 'scale_down',
        reason: 'System underutilized - opportunity to reduce costs',
        priority: 'low',
        estimatedTime: '2-5 minutes',
        resources: ['CPU', 'Memory'],
      });
    }

    return recommendations;
  }

  /**
   * Generate production report
   */
  private async generateProductionReport(): Promise<any> {
    const health = await this.getProductionHealth();
    const scalingPlan = await this.generateScalingPlan();

    return {
      timestamp: Date.now(),
      health,
      scalingPlan,
      summary: {
        totalAlerts: health.activeAlerts.length,
        criticalAlerts: health.activeAlerts.filter(a => a.level === 'critical').length,
        systemStatus: health.overallStatus,
        uptime: Object.values(health.systems).reduce((sum, s) => sum + s.uptime, 0) / Object.keys(health.systems).length,
      },
    };
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): {
    isMonitoring: boolean;
    activeIntervals: number;
    activeAlerts: number;
    lastHealthCheck: number;
    systemStatus: SystemStatus;
  } {
    const health = this.systemHealth.get('current');
    const lastHealthCheck = health ? Object.values(health).reduce((latest: number, system: any) => 
      Math.max(latest, system.lastCheck), 0) : 0;

    return {
      isMonitoring: this.isMonitoring,
      activeIntervals: this.monitoringIntervals.size,
      activeAlerts: this.activeAlerts.size,
      lastHealthCheck,
      systemStatus: this.calculateOverallStatus(health || {}, Array.from(this.activeAlerts.values())),
    };
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createProductionMonitor(): ProductionMonitor {
  return new ProductionMonitor();
}

// Singleton instance
let productionMonitor: ProductionMonitor | null = null;

export function getProductionMonitor(): ProductionMonitor {
  if (!productionMonitor) {
    productionMonitor = new ProductionMonitor();
  }
  return productionMonitor;
}
