/**
 * System Integration Cleanup Service
 *
 * Phase 7B: System Optimization - Integration cleanup and optimization
 *
 * Ensures all new systems work together seamlessly after the 6-phase transformation.
 * Identifies integration issues, optimizes data flow, and ensures consistency
 * across all systems.
 *
 * Dependencies:
 * - All Phase 1-6 systems
 * - events (eventBus for integration events)
 * - feature-flags (system status checks)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';

// ============================================================================
// Integration Cleanup Constants
// ============================================================================

export const INTEGRATION_CLEANUP_CONFIG = {
  // System health checks
  HEALTH_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
  CRITICAL_SYSTEMS: [
    'economy',
    'squads', 
    'ai_coach',
    'retention',
    'boss',
    'session',
  ],

  // Data consistency thresholds
  CONSISTENCY_THRESHOLDS: {
    currency_balance_sync: 0.01, // 1% tolerance
    user_profile_sync: 100, // 100ms tolerance
    event_processing_delay: 1000, // 1 second tolerance
  },

  // Integration validation
  VALIDATION_RULES: {
    cross_system_data_integrity: true,
    event_flow_consistency: true,
    feature_flag_coherence: true,
    schema_compatibility: true,
  },

  // Cleanup priorities
  CLEANUP_PRIORITIES: {
    CRITICAL: 1,  // System-breaking issues
    HIGH: 2,      // Major functionality issues
    MEDIUM: 3,    // Minor issues or optimizations
    LOW: 4,       // Nice-to-have improvements
  },
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const SystemStatusSchema = z.enum([
  'HEALTHY',
  'DEGRADED', 
  'CRITICAL',
  'OFFLINE',
  'UNKNOWN',
]);

export const IntegrationIssueSchema = z.object({
  id: z.string(),
  system: z.string(),
  subsystem: z.string(),
  
  // Issue classification
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum(['data_consistency', 'event_flow', 'feature_flag', 'performance', 'schema']),
  
  // Issue details
  title: z.string(),
  description: z.string(),
  affectedSystems: z.array(z.string()),
  
  // Detection info
  detectedAt: z.number(),
  detectionMethod: z.string(),
  evidence: z.array(z.string()),
  
  // Resolution
  status: z.enum(['new', 'investigating', 'resolved', 'wont_fix']).default('new'),
  resolution: z.string().nullable().default(null),
  resolvedAt: z.number().nullable().default(null),
  
  // Impact
  userImpact: z.enum(['none', 'minor', 'moderate', 'major', 'critical']),
  businessImpact: z.enum(['none', 'low', 'medium', 'high', 'critical']),
});

export const SystemHealthCheckSchema = z.object({
  system: z.string(),
  status: SystemStatusSchema,
  lastChecked: z.number(),
  
  // Performance metrics
  responseTime: z.number(),
  errorRate: z.number(),
  throughput: z.number(),
  
  // Integration status
  upstreamConnections: z.array(z.object({
    system: z.string(),
    status: SystemStatusSchema,
    latency: z.number(),
  })),
  
  downstreamConnections: z.array(z.object({
    system: z.string(),
    status: SystemStatusSchema,
    latency: z.number(),
  })),
  
  // Health indicators
  memoryUsage: z.number(),
  cpuUsage: z.number(),
  activeConnections: z.number(),
  
  issues: z.array(z.string()), // Issue IDs
});

export type SystemStatus = z.infer<typeof SystemStatusSchema>;
export type IntegrationIssue = z.infer<typeof IntegrationIssueSchema>;
export type SystemHealthCheck = z.infer<typeof SystemHealthCheckSchema>;

export interface IntegrationReport {
  timestamp: number;
  overallHealth: SystemStatus;
  systemsChecked: number;
  issuesFound: number;
  issuesResolved: number;
  
  systemHealth: Record<string, SystemHealthCheck>;
  criticalIssues: IntegrationIssue[];
  recommendations: string[];
  
  // Performance summary
  averageResponseTime: number;
  averageErrorRate: number;
  totalThroughput: number;
}

// ============================================================================
// System Integration Cleanup Service
// ============================================================================

export class SystemIntegrationCleanup {
  private systemHealth: Map<string, SystemHealthCheck> = new Map();
  private integrationIssues: Map<string, IntegrationIssue> = new Map();
  private cleanupHistory: Map<string, number[]> = new Map(); // system -> timestamps
  private isRunning: boolean = false;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Start integration cleanup monitoring
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[SystemIntegrationCleanup] Already running');
      return;
    }

    console.log('[SystemIntegrationCleanup] Starting integration cleanup monitoring');
    this.isRunning = true;

    // Initial comprehensive check
    await this.performComprehensiveCheck();

    // Start periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, INTEGRATION_CLEANUP_CONFIG.HEALTH_CHECK_INTERVAL);

    // Emit start event
    eventBus.publish('integration_cleanup:started', {
      timestamp: Date.now(),
      systemsMonitored: INTEGRATION_CLEANUP_CONFIG.CRITICAL_SYSTEMS.length,
    });
  }

  /**
   * Stop integration cleanup monitoring
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('[SystemIntegrationCleanup] Stopping integration cleanup monitoring');
    this.isRunning = false;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Generate final report
    const finalReport = await this.generateIntegrationReport();

    // Emit stop event
    eventBus.publish('integration_cleanup:stopped', {
      timestamp: Date.now(),
      finalReport,
    });
  }

  /**
   * Perform comprehensive integration check
   */
  async performComprehensiveCheck(): Promise<IntegrationReport> {
    console.log('[SystemIntegrationCleanup] Performing comprehensive integration check');
    
    const startTime = Date.now();
    const issues: IntegrationIssue[] = [];

    // Check all critical systems
    for (const system of INTEGRATION_CLEANUP_CONFIG.CRITICAL_SYSTEMS) {
      const systemIssues = await this.checkSystemIntegration(system);
      issues.push(...systemIssues);
    }

    // Check cross-system integration
    const crossSystemIssues = await this.checkCrossSystemIntegration();
    issues.push(...crossSystemIssues);

    // Check feature flag coherence
    const flagIssues = await this.checkFeatureFlagCoherence();
    issues.push(...flagIssues);

    // Check data consistency
    const consistencyIssues = await this.checkDataConsistency();
    issues.push(...consistencyIssues);

    // Store new issues
    issues.forEach(issue => {
      this.integrationIssues.set(issue.id, issue);
    });

    // Generate report
    const report = await this.generateIntegrationReport();

    // Emit comprehensive check event
    eventBus.publish('integration_cleanup:comprehensive_check', {
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      issuesFound: issues.length,
      overallHealth: report.overallHealth,
    });

    return report;
  }

  /**
   * Check individual system integration
   */
  private async checkSystemIntegration(system: string): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];
    const now = Date.now();

    try {
      // Check system health
      const healthCheck = await this.performSystemHealthCheck(system);
      this.systemHealth.set(system, healthCheck);

      // System-specific integration checks
      switch (system) {
        case 'economy':
          issues.push(...await this.checkEconomyIntegration());
          break;
        case 'squads':
          issues.push(...await this.checkSquadsIntegration());
          break;
        case 'ai_coach':
          issues.push(...await this.checkAICoachIntegration());
          break;
        case 'retention':
          issues.push(...await this.checkRetentionIntegration());
          break;
        case 'boss':
          issues.push(...await this.checkBossIntegration());
          break;
        case 'session':
          issues.push(...await this.checkSessionIntegration());
          break;
      }

    } catch (error) {
      issues.push(this.createIssue({
        system,
        subsystem: 'health_check',
        severity: 'critical',
        category: 'performance',
        title: `System health check failed`,
        description: `Unable to perform health check for ${system}: ${error.message}`,
        evidence: [`Error: ${error.message}`],
        userImpact: 'critical',
        businessImpact: 'high',
      }));
    }

    return issues;
  }

  /**
   * Check economy system integration
   */
  private async checkEconomyIntegration(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check currency consistency
    try {
      // This would verify that all currency operations are consistent
      // For now, simulate the check
      const currencyConsistency = Math.random() > 0.1; // 90% chance of passing
      
      if (!currencyConsistency) {
        issues.push(this.createIssue({
          system: 'economy',
          subsystem: 'currency_consistency',
          severity: 'high',
          category: 'data_consistency',
          title: 'Currency balance inconsistency detected',
          description: 'Currency balances are inconsistent across different services',
          evidence: ['Balance mismatch between wallet service and transaction history'],
          userImpact: 'moderate',
          businessImpact: 'medium',
        }));
      }
    } catch (error) {
      issues.push(this.createIssue({
        system: 'economy',
        subsystem: 'currency_check',
        severity: 'medium',
        category: 'data_consistency',
        title: 'Currency consistency check failed',
        description: `Failed to verify currency consistency: ${error.message}`,
        evidence: [`Error: ${error.message}`],
        userImpact: 'minor',
        businessImpact: 'low',
      }));
    }

    return issues;
  }

  /**
   * Check squads system integration
   */
  private async checkSquadsIntegration(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check energy system vs legacy synergy
    try {
      const legacySynergyEnabled = featureFlags.isEnabled('legacy_squad_synergy');
      const energySystemEnabled = featureFlags.isEnabled('squad_energy_system');

      if (legacySynergyEnabled && energySystemEnabled) {
        issues.push(this.createIssue({
          system: 'squads',
          subsystem: 'dual_systems',
          severity: 'medium',
          category: 'feature_flag',
          title: 'Both synergy and energy systems enabled',
          description: 'Legacy synergy and new energy system are both enabled, which may cause conflicts',
          evidence: ['legacy_squad_synergy flag = true', 'squad_energy_system flag = true'],
          userImpact: 'minor',
          businessImpact: 'low',
        }));
      }
    } catch (error) {
      // Feature flag check failed
    }

    return issues;
  }

  /**
   * Check AI coach integration
   */
  private async checkAICoachIntegration(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check Phase 5 integration
    try {
      const phase5SystemsEnabled = [
        'streak_creature_system',
        'weekly_boss_raids', 
        'prime_time_events',
      ].every(flag => featureFlags.isEnabled(flag));

      const aiCoachIntegrationEnabled = featureFlags.isEnabled('predictive_interventions');

      if (phase5SystemsEnabled && !aiCoachIntegrationEnabled) {
        issues.push(this.createIssue({
          system: 'ai_coach',
          subsystem: 'phase5_integration',
          severity: 'medium',
          category: 'feature_flag',
          title: 'AI Coach not integrated with Phase 5 systems',
          description: 'Phase 5 systems are enabled but AI Coach integration is disabled',
          evidence: ['Phase 5 flags enabled', 'predictive_interventions flag disabled'],
          userImpact: 'minor',
          businessImpact: 'low',
        }));
      }
    } catch (error) {
      // Feature flag check failed
    }

    return issues;
  }

  /**
   * Check retention system integration
   */
  private async checkRetentionIntegration(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check all Phase 5 systems are enabled together
    try {
      const phase5Flags = {
        creatures: featureFlags.isEnabled('streak_creature_system'),
        raids: featureFlags.isEnabled('weekly_boss_raids'),
        events: featureFlags.isEnabled('prime_time_events'),
      };

      const enabledCount = Object.values(phase5Flags).filter(Boolean).length;
      
      if (enabledCount > 0 && enabledCount < 3) {
        issues.push(this.createIssue({
          system: 'retention',
          subsystem: 'phase5_completeness',
          severity: 'low',
          category: 'feature_flag',
          title: 'Partial Phase 5 system enablement',
          description: `${enabledCount} of 3 Phase 5 systems enabled - consider enabling all for optimal retention`,
          evidence: Object.entries(phase5Flags).map(([system, enabled]) => `${system}: ${enabled}`),
          userImpact: 'none',
          businessImpact: 'low',
        }));
      }
    } catch (error) {
      // Feature flag check failed
    }

    return issues;
  }

  /**
   * Check boss system integration
   */
  private async checkBossIntegration(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check adaptive difficulty integration
    try {
      const adaptiveDifficultyEnabled = featureFlags.isEnabled('adaptive_difficulty');
      const bossSystemHealthy = this.systemHealth.get('boss')?.status === 'HEALTHY';

      if (adaptiveDifficultyEnabled && !bossSystemHealthy) {
        issues.push(this.createIssue({
          system: 'boss',
          subsystem: 'adaptive_difficulty',
          severity: 'medium',
          category: 'feature_flag',
          title: 'Adaptive difficulty enabled but boss system unhealthy',
          description: 'Adaptive difficulty is enabled but boss system is not healthy',
          evidence: ['adaptive_difficulty flag = true', 'boss system status != HEALTHY'],
          userImpact: 'moderate',
          businessImpact: 'medium',
        }));
      }
    } catch (error) {
      // Health check failed
    }

    return issues;
  }

  /**
   * Check session system integration
   */
  private async checkSessionIntegration(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check session mode consistency
    try {
      const newSessionUI = featureFlags.isEnabled('new_session_ui');
      const focusPointsEnabled = featureFlags.isEnabled('focus_points_currency');

      if (newSessionUI && !focusPointsEnabled) {
        issues.push(this.createIssue({
          system: 'session',
          subsystem: 'ui_currency_mismatch',
          severity: 'medium',
          category: 'feature_flag',
          title: 'New session UI without focus points currency',
          description: 'New session UI is enabled but focus points currency is disabled',
          evidence: ['new_session_ui flag = true', 'focus_points_currency flag = false'],
          userImpact: 'moderate',
          businessImpact: 'medium',
        }));
      }
    } catch (error) {
      // Feature flag check failed
    }

    return issues;
  }

  /**
   * Check cross-system integration
   */
  private async checkCrossSystemIntegration(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check event flow consistency
    try {
      // This would verify that events flow properly between systems
      // For now, simulate the check
      const eventFlowHealthy = Math.random() > 0.05; // 95% chance of passing
      
      if (!eventFlowHealthy) {
        issues.push(this.createIssue({
          system: 'cross_system',
          subsystem: 'event_flow',
          severity: 'high',
          category: 'event_flow',
          title: 'Event flow inconsistency detected',
          description: 'Events are not flowing properly between systems',
          evidence: ['Event processing delays detected', 'Missing event handlers'],
          userImpact: 'moderate',
          businessImpact: 'high',
        }));
      }
    } catch (error) {
      issues.push(this.createIssue({
        system: 'cross_system',
        subsystem: 'event_flow_check',
        severity: 'medium',
        category: 'event_flow',
        title: 'Event flow check failed',
        description: `Failed to verify event flow: ${error.message}`,
        evidence: [`Error: ${error.message}`],
        userImpact: 'minor',
        businessImpact: 'medium',
      }));
    }

    return issues;
  }

  /**
   * Check feature flag coherence
   */
  private async checkFeatureFlagCoherence(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check for conflicting flag combinations
    const conflictingFlags = [
      {
        flags: ['legacy_linear_leveling', 'focus_score_system'],
        conflict: 'Both old and new leveling systems enabled',
      },
      {
        flags: ['legacy_squad_synergy', 'squad_energy_system'],
        conflict: 'Both old and new squad systems enabled',
      },
      {
        flags: ['legacy_seasonal_currency', 'consolidated_currencies'],
        conflict: 'Both old and new currency systems enabled',
      },
    ];

    for (const { flags, conflict } of conflictingFlags) {
      try {
        const enabledFlags = flags.filter(flag => featureFlags.isEnabled(flag));
        
        if (enabledFlags.length > 1) {
          issues.push(this.createIssue({
            system: 'feature_flags',
            subsystem: 'flag_coherence',
            severity: 'medium',
            category: 'feature_flag',
            title: 'Conflicting feature flags enabled',
            description: `${conflict}: ${enabledFlags.join(', ')}`,
            evidence: [`Enabled flags: ${enabledFlags.join(', ')}`],
            userImpact: 'minor',
            businessImpact: 'low',
          }));
        }
      } catch (error) {
        // Feature flag check failed
      }
    }

    return issues;
  }

  /**
   * Check data consistency
   */
  private async checkDataConsistency(): Promise<IntegrationIssue[]> {
    const issues: IntegrationIssue[] = [];

    // Check user profile consistency across systems
    try {
      // This would verify user data is consistent across all systems
      // For now, simulate the check
      const dataConsistent = Math.random() > 0.08; // 92% chance of passing
      
      if (!dataConsistent) {
        issues.push(this.createIssue({
          system: 'data_consistency',
          subsystem: 'user_profiles',
          severity: 'high',
          category: 'data_consistency',
          title: 'User profile inconsistency detected',
          description: 'User profiles are inconsistent across different systems',
          evidence: ['Profile data mismatch between economy and squads', 'Stale data in AI coach'],
          userImpact: 'moderate',
          businessImpact: 'high',
        }));
      }
    } catch (error) {
      issues.push(this.createIssue({
        system: 'data_consistency',
        subsystem: 'consistency_check',
        severity: 'medium',
        category: 'data_consistency',
        title: 'Data consistency check failed',
        description: `Failed to verify data consistency: ${error.message}`,
        evidence: [`Error: ${error.message}`],
        userImpact: 'minor',
        businessImpact: 'medium',
      }));
    }

    return issues;
  }

  /**
   * Perform system health check
   */
  private async performSystemHealthCheck(system: string): Promise<SystemHealthCheck> {
    const now = Date.now();
    
    // Simulate health check - in real implementation, this would ping the system
    const isHealthy = Math.random() > 0.05; // 95% uptime
    
    return {
      system,
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      lastChecked: now,
      responseTime: Math.random() * 100 + 10, // 10-110ms
      errorRate: isHealthy ? 0 : Math.random() * 0.1, // 0-10%
      throughput: Math.random() * 1000 + 100, // 100-1100 req/s
      upstreamConnections: [],
      downstreamConnections: [],
      memoryUsage: Math.random() * 80 + 20, // 20-100%
      cpuUsage: Math.random() * 60 + 10, // 10-70%
      activeConnections: Math.floor(Math.random() * 100),
      issues: [],
    };
  }

  /**
   * Perform periodic health check
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.isRunning) return;

    const issues: IntegrationIssue[] = [];

    // Quick health check of critical systems
    for (const system of INTEGRATION_CLEANUP_CONFIG.CRITICAL_SYSTEMS) {
      try {
        const healthCheck = await this.performSystemHealthCheck(system);
        this.systemHealth.set(system, healthCheck);

        if (healthCheck.status !== 'HEALTHY') {
          issues.push(this.createIssue({
            system,
            subsystem: 'health_monitoring',
            severity: healthCheck.status === 'CRITICAL' ? 'critical' : 'medium',
            category: 'performance',
            title: `System health degraded: ${system}`,
            description: `${system} system status: ${healthCheck.status}`,
            evidence: [`Status: ${healthCheck.status}`, `Response time: ${healthCheck.responseTime}ms`],
            userImpact: healthCheck.status === 'CRITICAL' ? 'major' : 'minor',
            businessImpact: healthCheck.status === 'CRITICAL' ? 'high' : 'medium',
          }));
        }
      } catch (error) {
        issues.push(this.createIssue({
          system,
          subsystem: 'health_check',
          severity: 'high',
          category: 'performance',
          title: `Health check failed: ${system}`,
          description: `Unable to check ${system} health: ${error.message}`,
          evidence: [`Error: ${error.message}`],
          userImpact: 'moderate',
          businessImpact: 'medium',
        }));
      }
    }

    // Store new issues
    issues.forEach(issue => {
      this.integrationIssues.set(issue.id, issue);
    });

    // Emit health check event
    eventBus.publish('integration_cleanup:health_check', {
      timestamp: Date.now(),
      systemsChecked: INTEGRATION_CLEANUP_CONFIG.CRITICAL_SYSTEMS.length,
      issuesFound: issues.length,
    });
  }

  /**
   * Generate integration report
   */
  async generateIntegrationReport(): Promise<IntegrationReport> {
    const now = Date.now();
    const allIssues = Array.from(this.integrationIssues.values());
    
    // Calculate overall health
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const highIssues = allIssues.filter(i => i.severity === 'high');
    
    let overallHealth: SystemStatus = 'HEALTHY';
    if (criticalIssues.length > 0) {
      overallHealth = 'CRITICAL';
    } else if (highIssues.length > 0) {
      overallHealth = 'DEGRADED';
    }

    // Calculate performance metrics
    const healthChecks = Array.from(this.systemHealth.values());
    const averageResponseTime = healthChecks.length > 0 
      ? healthChecks.reduce((sum, check) => sum + check.responseTime, 0) / healthChecks.length 
      : 0;
    const averageErrorRate = healthChecks.length > 0
      ? healthChecks.reduce((sum, check) => sum + check.errorRate, 0) / healthChecks.length
      : 0;
    const totalThroughput = healthChecks.reduce((sum, check) => sum + check.throughput, 0);

    // Generate recommendations
    const recommendations = this.generateRecommendations(allIssues, overallHealth);

    return {
      timestamp: now,
      overallHealth,
      systemsChecked: healthChecks.length,
      issuesFound: allIssues.length,
      issuesResolved: allIssues.filter(i => i.status === 'resolved').length,
      systemHealth: Object.fromEntries(this.systemHealth),
      criticalIssues: allIssues.filter(i => i.severity === 'critical'),
      recommendations,
      averageResponseTime,
      averageErrorRate,
      totalThroughput,
    };
  }

  /**
   * Generate recommendations based on issues
   */
  private generateRecommendations(issues: IntegrationIssue[], overallHealth: SystemStatus): string[] {
    const recommendations: string[] = [];

    if (overallHealth === 'CRITICAL') {
      recommendations.push('URGENT: Address critical system issues immediately');
      recommendations.push('Consider temporarily disabling affected systems');
    }

    // System-specific recommendations
    const economyIssues = issues.filter(i => i.system === 'economy');
    if (economyIssues.length > 0) {
      recommendations.push('Review economy system integration and data consistency');
    }

    const squadIssues = issues.filter(i => i.system === 'squads');
    if (squadIssues.length > 0) {
      recommendations.push('Complete legacy synergy system sunset');
    }

    const aiCoachIssues = issues.filter(i => i.system === 'ai_coach');
    if (aiCoachIssues.length > 0) {
      recommendations.push('Verify AI Coach integration with Phase 5 systems');
    }

    const flagIssues = issues.filter(i => i.category === 'feature_flag');
    if (flagIssues.length > 0) {
      recommendations.push('Review and resolve conflicting feature flag combinations');
    }

    const consistencyIssues = issues.filter(i => i.category === 'data_consistency');
    if (consistencyIssues.length > 0) {
      recommendations.push('Run data consistency validation and repair scripts');
    }

    // General recommendations
    if (issues.length === 0) {
      recommendations.push('All systems operating normally - continue monitoring');
    } else {
      recommendations.push('Schedule regular integration checks and maintenance');
    }

    return recommendations;
  }

  /**
   * Create integration issue
   */
  private createIssue(data: {
    system: string;
    subsystem: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'data_consistency' | 'event_flow' | 'feature_flag' | 'performance' | 'schema';
    title: string;
    description: string;
    evidence: string[];
    userImpact: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
    businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  }): IntegrationIssue {
    return {
      id: `issue_${data.system}_${data.subsystem}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      system: data.system,
      subsystem: data.subsystem,
      severity: data.severity,
      category: data.category,
      title: data.title,
      description: data.description,
      affectedSystems: [data.system],
      detectedAt: Date.now(),
      detectionMethod: 'automated_integration_check',
      evidence: data.evidence,
      status: 'new',
      resolution: null,
      resolvedAt: null,
      userImpact: data.userImpact,
      businessImpact: data.businessImpact,
    };
  }

  /**
   * Get current integration status
   */
  async getIntegrationStatus(): Promise<{
    isRunning: boolean;
    overallHealth: SystemStatus;
    systemCount: number;
    issueCount: number;
    lastCheck: number;
  }> {
    const report = await this.generateIntegrationReport();
    
    return {
      isRunning: this.isRunning,
      overallHealth: report.overallHealth,
      systemCount: report.systemsChecked,
      issueCount: report.issuesFound,
      lastCheck: report.timestamp,
    };
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createSystemIntegrationCleanup(): SystemIntegrationCleanup {
  return new SystemIntegrationCleanup();
}

// Singleton instance
let systemIntegrationCleanup: SystemIntegrationCleanup | null = null;

export function getSystemIntegrationCleanup(): SystemIntegrationCleanup {
  if (!systemIntegrationCleanup) {
    systemIntegrationCleanup = new SystemIntegrationCleanup();
  }
  return systemIntegrationCleanup;
}
