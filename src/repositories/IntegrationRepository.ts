/**
 * Integration Repository
 *
 * Repository for third-party integration management including API integrations,
 * webhook management, synchronization, and integration monitoring.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  provider: string;
  version: string;
  status: IntegrationStatus;
  configuration: IntegrationConfiguration;
  credentials: IntegrationCredentials;
  webhooks: WebhookConfig[];
  syncSettings: SyncSettings;
  monitoring: MonitoringConfig;
  metadata: IntegrationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum IntegrationType {
  PAYMENT = 'payment',
  EMAIL = 'email',
  SMS = 'sms',
  ANALYTICS = 'analytics',
  CRM = 'crm',
  ERP = 'erp',
  STORAGE = 'storage',
  AI = 'ai',
  SOCIAL = 'social',
  CALENDAR = 'calendar',
  PROJECT_MANAGEMENT = 'project_management',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
  DISABLED = 'disabled',
  SUSPENDED = 'suspended',
}

export interface IntegrationConfiguration {
  baseUrl?: string;
  apiVersion?: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  rateLimit: RateLimit;
  headers?: Record<string, string>;
  customSettings?: Record<string, any>;
}

export interface RateLimit {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

export interface IntegrationCredentials {
  type: CredentialType;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  publicKey?: string;
  privateKey?: string;
  certificate?: string;
  expiresAt?: Date;
  isEncrypted: boolean;
}

export enum CredentialType {
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  BASIC_AUTH = 'basic_auth',
  BEARER_TOKEN = 'bearer_token',
  CERTIFICATE = 'certificate',
  CUSTOM = 'custom',
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  retryPolicy: RetryPolicy;
  headers?: Record<string, string>;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
}

export interface SyncSettings {
  enabled: boolean;
  direction: SyncDirection;
  frequency: SyncFrequency;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  mappings: FieldMapping[];
  filters?: SyncFilter[];
}

export enum SyncDirection {
  IMPORT = 'import',
  EXPORT = 'export',
  BIDIRECTIONAL = 'bidirectional',
}

export enum SyncFrequency {
  REAL_TIME = 'real_time',
  EVERY_5_MINUTES = 'every_5_minutes',
  EVERY_15_MINUTES = 'every_15_minutes',
  EVERY_30_MINUTES = 'every_30_minutes',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: FieldTransformation;
}

export interface FieldTransformation {
  type: 'format' | 'calculate' | 'lookup' | 'custom';
  parameters: Record<string, any>;
}

export interface SyncFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface MonitoringConfig {
  enabled: boolean;
  healthCheckInterval: number;
  alertThresholds: AlertThresholds;
  notifications: NotificationConfig[];
}

export interface AlertThresholds {
  errorRate: number;
  responseTime: number;
  failureCount: number;
  queueSize: number;
}

export interface NotificationConfig {
  type: 'email' | 'sms' | 'webhook' | 'slack';
  recipients: string[];
  conditions: string[];
}

export interface IntegrationMetadata {
  description?: string;
  documentation?: string;
  supportContact?: string;
  tags: string[];
  dependencies: string[];
  versionHistory: VersionEntry[];
  complianceInfo?: ComplianceInfo;
}

export interface VersionEntry {
  version: string;
  deployedAt: Date;
  changes: string[];
}

export interface ComplianceInfo {
  dataResidency: string[];
  certifications: string[];
  privacyPolicy: string;
  gdprCompliant: boolean;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  type: LogType;
  level: LogLevel;
  message: string;
  details?: Record<string, any>;
  requestId?: string;
  userId?: string;
  timestamp: Date;
  duration?: number;
  success: boolean;
}

export enum LogType {
  API_CALL = 'api_call',
  WEBHOOK = 'webhook',
  SYNC = 'sync',
  ERROR = 'error',
  HEALTH_CHECK = 'health_check',
  AUTHENTICATION = 'authentication',
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface IntegrationFilters {
  type?: IntegrationType;
  provider?: string;
  status?: IntegrationStatus;
  isActive?: boolean;
  tags?: string[];
  search?: string;
}

export interface IntegrationCreateData {
  name: string;
  type: IntegrationType;
  provider: string;
  version: string;
  configuration: IntegrationConfiguration;
  credentials: IntegrationCredentials;
  webhooks?: WebhookConfig[];
  syncSettings?: SyncSettings;
  monitoring?: MonitoringConfig;
  metadata?: Partial<IntegrationMetadata>;
}

export interface IntegrationUpdateData {
  name?: string;
  status?: IntegrationStatus;
  configuration?: Partial<IntegrationConfiguration>;
  credentials?: IntegrationCredentials;
  webhooks?: WebhookConfig[];
  syncSettings?: Partial<SyncSettings>;
  monitoring?: Partial<MonitoringConfig>;
  metadata?: Partial<IntegrationMetadata>;
}

export class IntegrationRepository extends BaseRepository<Integration> {
  constructor(
    dbConnection: DatabaseConnection,
    cacheManager: CacheManager,
    logger: Logger
  ) {
    super(dbConnection, cacheManager, logger, {
      useCache: true,
      cacheTTL: 600000, // 10 minutes
      enableLogging: true,
      retryAttempts: 3,
      timeout: 30000,
    });
  }

  // Get integrations by type
  async getByType(type: IntegrationType): Promise<Integration[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getByType', type);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Integration[]>(cacheKey);
        if (cached) {
          this.logOperation('getByType', 'cache_hit', { type, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM integrations WHERE type = $1 ORDER BY name ASC';
      const result = await this.dbConnection.query(query, [type]);
      const integrations = result.rows.map(row => this.mapRowToIntegration(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, integrations, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getByType', 'success', { type, count: integrations.length, executionTime });

      return integrations;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getByType', 'error', { type, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get active integrations
  async getActiveIntegrations(): Promise<Integration[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getActiveIntegrations');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Integration[]>(cacheKey);
        if (cached) {
          this.logOperation('getActiveIntegrations', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM integrations WHERE status = $1 ORDER BY name ASC';
      const result = await this.dbConnection.query(query, [IntegrationStatus.ACTIVE]);
      const integrations = result.rows.map(row => this.mapRowToIntegration(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, integrations, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getActiveIntegrations', 'success', { count: integrations.length, executionTime });

      return integrations;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getActiveIntegrations', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Test integration connection
  async testConnection(integrationId: string): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
    details?: Record<string, any>;
  }> {
    const startTime = Date.now();

    try {
      const integration = await this.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Simulate connection test
      const testResult = await this.performConnectionTest(integration);

      // Log the test
      await this.logIntegrationEvent(integrationId, LogType.HEALTH_CHECK, LogLevel.INFO,
        testResult.success ? 'Connection test successful' : 'Connection test failed',
        { responseTime: testResult.responseTime, error: testResult.error },
        testResult.success
      );

      const executionTime = Date.now() - startTime;
      this.logOperation('testConnection', 'success', {
        integrationId,
        success: testResult.success,
        responseTime: testResult.responseTime,
        executionTime,
      });

      return testResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('testConnection', 'error', {
        integrationId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Enable/disable integration
  async updateStatus(integrationId: string, status: IntegrationStatus, reason?: string): Promise<Integration> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE integrations 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await this.dbConnection.query(query, [status, integrationId]);

      if (result.rows.length === 0) {
        throw new Error('Integration not found');
      }

      const integration = this.mapRowToIntegration(result.rows[0]);

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', integrationId));
        await this.clearCachePattern('getByType');
        await this.clearCachePattern('getActiveIntegrations');
      }

      // Log status change
      await this.logIntegrationEvent(integrationId, LogType.API_CALL, LogLevel.INFO,
        `Integration status changed to ${status}`, { reason }, true);

      const executionTime = Date.now() - startTime;
      this.logOperation('updateStatus', 'success', {
        integrationId,
        status,
        executionTime,
      });

      return integration;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updateStatus', 'error', {
        integrationId,
        status,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Sync integration data
  async triggerSync(integrationId: string, options?: {
    force?: boolean;
    direction?: SyncDirection;
  }): Promise<{
    success: boolean;
    recordsProcessed: number;
    errors: string[];
    duration: number;
  }> {
    const startTime = Date.now();

    try {
      const integration = await this.findById(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      if (!integration.syncSettings.enabled && !options?.force) {
        throw new Error('Sync is not enabled for this integration');
      }

      // Simulate sync process
      const syncResult = await this.performSync(integration, options);

      // Update sync settings
      if (integration.syncSettings.enabled) {
        await this.updateSyncSettings(integrationId, {
          lastSyncAt: new Date(),
          nextSyncAt: this.calculateNextSync(integration.syncSettings.frequency),
        });
      }

      // Log sync event
      await this.logIntegrationEvent(integrationId, LogType.SYNC, LogLevel.INFO,
        `Sync completed - ${syncResult.recordsProcessed} records processed`,
        { recordsProcessed: syncResult.recordsProcessed, errors: syncResult.errors.length },
        syncResult.success
      );

      const executionTime = Date.now() - startTime;
      this.logOperation('triggerSync', 'success', {
        integrationId,
        recordsProcessed: syncResult.recordsProcessed,
        success: syncResult.success,
        executionTime,
      });

      return syncResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('triggerSync', 'error', {
        integrationId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get integration logs
  async getLogs(integrationId: string, options: {
    limit?: number;
    offset?: number;
    level?: LogLevel;
    type?: LogType;
    timeRange?: { start: Date; end: Date };
  } = {}): Promise<IntegrationLog[]> {
    const startTime = Date.now();

    try {
      let query = 'SELECT * FROM integration_logs WHERE integration_id = $1';
      const params: any[] = [integrationId];
      let paramIndex = 2;

      if (options.level) {
        query += ` AND level = $${paramIndex}`;
        params.push(options.level);
        paramIndex++;
      }

      if (options.type) {
        query += ` AND type = $${paramIndex}`;
        params.push(options.type);
        paramIndex++;
      }

      if (options.timeRange) {
        query += ` AND timestamp >= $${paramIndex} AND timestamp <= $${paramIndex + 1}`;
        params.push(options.timeRange.start, options.timeRange.end);
        paramIndex += 2;
      }

      query += ' ORDER BY timestamp DESC';

      if (options.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;

        if (options.offset) {
          query += ` OFFSET $${paramIndex}`;
          params.push(options.offset);
        }
      }

      const result = await this.dbConnection.query(query, params);
      const logs = result.rows.map(row => this.mapRowToLog(row));

      const executionTime = Date.now() - startTime;
      this.logOperation('getLogs', 'success', {
        integrationId,
        count: logs.length,
        executionTime,
      });

      return logs;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getLogs', 'error', {
        integrationId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get integration statistics
  async getIntegrationStats(): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    integrationsByType: Record<IntegrationType, number>;
    integrationsByProvider: Record<string, number>;
    recentErrors: number;
    averageResponseTime: number;
    syncSuccessRate: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getIntegrationStats');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) {
          this.logOperation('getIntegrationStats', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Get basic statistics
      const basicQuery = `
        SELECT 
          COUNT(*) as total_integrations,
          COUNT(CASE WHEN status = $1 THEN 1 END) as active_integrations
        FROM integrations
      `;

      const basicResult = await this.dbConnection.query(basicQuery, [IntegrationStatus.ACTIVE]);
      const basicStats = basicResult.rows[0];

      // Get integrations by type
      const typeQuery = 'SELECT type, COUNT(*) as count FROM integrations GROUP BY type';
      const typeResult = await this.dbConnection.query(typeQuery);
      const integrationsByType = typeResult.rows.reduce((acc: any, row: any) => {
        acc[row.type] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<IntegrationType, number>);

      // Get integrations by provider
      const providerQuery = 'SELECT provider, COUNT(*) as count FROM integrations GROUP BY provider';
      const providerResult = await this.dbConnection.query(providerQuery);
      const integrationsByProvider = providerResult.rows.reduce((acc: any, row: any) => {
        acc[row.provider] = parseInt(row.count, 10);
        return acc;
      }, {});

      // Get recent errors
      const errorQuery = `
        SELECT COUNT(*) as count 
        FROM integration_logs 
        WHERE level = $2 AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      `;
      const errorResult = await this.dbConnection.query(errorQuery, [IntegrationStatus.ERROR, LogLevel.ERROR]);
      const recentErrors = parseInt(errorResult.rows[0].count, 10);

      // Get average response time
      const responseTimeQuery = `
        SELECT COALESCE(AVG(duration), 0) as avg_response_time 
        FROM integration_logs 
        WHERE type = $1 AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours' AND duration IS NOT NULL
      `;
      const responseTimeResult = await this.dbConnection.query(responseTimeQuery, [LogType.API_CALL]);
      const averageResponseTime = parseFloat(responseTimeResult.rows[0].avg_response_time);

      // Get sync success rate
      const syncQuery = `
        SELECT 
          COUNT(CASE WHEN success = true THEN 1 END) * 100.0 / COUNT(*) as success_rate
        FROM integration_logs 
        WHERE type = $1 AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      `;
      const syncResult = await this.dbConnection.query(syncQuery, [LogType.SYNC]);
      const syncSuccessRate = parseFloat(syncResult.rows[0].success_rate || '0');

      const stats = {
        totalIntegrations: parseInt(basicStats.total_integrations, 10),
        activeIntegrations: parseInt(basicStats.active_integrations, 10),
        integrationsByType,
        integrationsByProvider,
        recentErrors,
        averageResponseTime,
        syncSuccessRate,
      };

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, stats, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getIntegrationStats', 'success', { executionTime });

      return stats;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getIntegrationStats', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Helper methods
  private async performConnectionTest(integration: Integration): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
    details?: Record<string, any>;
  }> {
    // Simulate connection test
    const startTime = Date.now();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

      const responseTime = Date.now() - startTime;
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        return {
          success: true,
          responseTime,
          details: { status: 'connected', version: integration.version },
        };
      } else {
        return {
          success: false,
          responseTime,
          error: 'Connection timeout',
        };
      }
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: (error as Error).message,
      };
    }
  }

  private async performSync(integration: Integration, options?: any): Promise<{
    success: boolean;
    recordsProcessed: number;
    errors: string[];
    duration: number;
  }> {
    // Simulate sync process
    const startTime = Date.now();
    const recordsProcessed = Math.floor(Math.random() * 1000) + 100;
    const errors = Math.random() > 0.8 ? ['Record 42: Invalid data format'] : [];
    const success = errors.length === 0;

    return {
      success,
      recordsProcessed,
      errors,
      duration: Date.now() - startTime,
    };
  }

  private async updateSyncSettings(integrationId: string, updates: Partial<SyncSettings>): Promise<void> {
    const query = `
      UPDATE integrations 
      SET sync_settings = jsonb_set(sync_settings, '{lastSyncAt}', $1),
          sync_settings = jsonb_set(sync_settings, '{nextSyncAt}', $2),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;

    await this.dbConnection.query(query, [
      updates.lastSyncAt ? updates.lastSyncAt.toISOString() : null,
      updates.nextSyncAt ? updates.nextSyncAt.toISOString() : null,
      integrationId,
    ]);
  }

  private calculateNextSync(frequency: SyncFrequency): Date {
    const now = new Date();

    switch (frequency) {
      case SyncFrequency.REAL_TIME:
        return new Date(now.getTime() + 60000); // 1 minute
      case SyncFrequency.EVERY_5_MINUTES:
        return new Date(now.getTime() + 5 * 60000);
      case SyncFrequency.EVERY_15_MINUTES:
        return new Date(now.getTime() + 15 * 60000);
      case SyncFrequency.EVERY_30_MINUTES:
        return new Date(now.getTime() + 30 * 60000);
      case SyncFrequency.HOURLY:
        return new Date(now.getTime() + 60 * 60000);
      case SyncFrequency.DAILY:
        return new Date(now.getTime() + 24 * 60 * 60000);
      case SyncFrequency.WEEKLY:
        return new Date(now.getTime() + 7 * 24 * 60 * 60000);
      case SyncFrequency.MONTHLY:
        return new Date(now.getTime() + 30 * 24 * 60 * 60000);
      default:
        return new Date(now.getTime() + 60 * 60000);
    }
  }

  private async logIntegrationEvent(
    integrationId: string,
    type: LogType,
    level: LogLevel,
    message: string,
    details?: Record<string, any>,
    success?: boolean
  ): Promise<void> {
    const query = `
      INSERT INTO integration_logs (
        integration_id, type, level, message, details, timestamp, duration, success
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7)
    `;

    await this.dbConnection.query(query, [
      integrationId,
      type,
      level,
      message,
      JSON.stringify(details || {}),
      details?.responseTime || null,
      success !== undefined ? success : true,
    ]);
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<Integration | null> {
    const query = 'SELECT * FROM integrations WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToIntegration(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: Integration[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM integrations WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (options.filters) {
      if (options.filters.type) {
        query += ` AND type = $${params.length + 1}`;
        params.push(options.filters.type);
      }

      if (options.filters.provider) {
        query += ` AND provider = $${params.length + 1}`;
        params.push(options.filters.provider);
      }

      if (options.filters.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(options.filters.status);
      }

      if (options.filters.search) {
        query += ` AND (name ILIKE $${params.length + 1} OR provider ILIKE $${params.length + 1})`;
        params.push(`%${options.filters.search}%`);
      }
    }

    // Add sorting
    if (options.sortBy) {
      query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`;
    } else {
      query += ' ORDER BY name ASC';
    }

    // Add pagination
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);

      if (options.offset) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(options.offset);
      }
    }

    const result = await this.dbConnection.query(query, params);
    const integrations = result.rows.map(row => this.mapRowToIntegration(row));

    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM integrations WHERE 1=1';
    const countResult = await this.dbConnection.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: integrations,
      totalCount,
      hasMore: options.offset ? options.offset + integrations.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<Integration>): Promise<Integration> {
    const integrationData = entity as IntegrationCreateData;

    const query = `
      INSERT INTO integrations (
        name, type, provider, version, status, configuration, credentials,
        webhooks, sync_settings, monitoring, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      integrationData.name,
      integrationData.type,
      integrationData.provider,
      integrationData.version,
      IntegrationStatus.PENDING,
      JSON.stringify(integrationData.configuration),
      JSON.stringify(integrationData.credentials),
      JSON.stringify(integrationData.webhooks || []),
      JSON.stringify(integrationData.syncSettings || { enabled: false, direction: SyncDirection.IMPORT }),
      JSON.stringify(integrationData.monitoring || { enabled: false, healthCheckInterval: 300000 }),
      JSON.stringify({
        tags: [],
        dependencies: [],
        versionHistory: [],
        ...integrationData.metadata,
      }),
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToIntegration(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<Integration>): Promise<Integration | null> {
    const updateData = updates as IntegrationUpdateData;

    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.name !== undefined) {
      setClause.push(`name = $${paramIndex}`);
      params.push(updateData.name);
      paramIndex++;
    }

    if (updateData.status !== undefined) {
      setClause.push(`status = $${paramIndex}`);
      params.push(updateData.status);
      paramIndex++;
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `
      UPDATE integrations 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToIntegration(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'DELETE FROM integrations WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM integrations WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.type) {
        query += ` AND type = $${params.length + 1}`;
        params.push(filters.type);
      }

      if (filters.provider) {
        query += ` AND provider = $${params.length + 1}`;
        params.push(filters.provider);
      }

      if (filters.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(filters.status);
      }
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM integrations WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<Integration>): Promise<void> {
    const integrationData = entity as IntegrationCreateData;

    if (!integrationData.name) {
      throw new Error('Integration name is required');
    }

    if (!integrationData.type) {
      throw new Error('Integration type is required');
    }

    if (!integrationData.provider) {
      throw new Error('Integration provider is required');
    }

    if (!integrationData.version) {
      throw new Error('Integration version is required');
    }

    if (!integrationData.configuration) {
      throw new Error('Integration configuration is required');
    }

    if (!integrationData.credentials) {
      throw new Error('Integration credentials are required');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getIntegrationStats();
  }

  // Helper methods for mapping
  private mapRowToIntegration(row: any): Integration {
    return {
      id: row.id,
      name: row.name,
      type: row.type as IntegrationType,
      provider: row.provider,
      version: row.version,
      status: row.status as IntegrationStatus,
      configuration: row.configuration ? JSON.parse(row.configuration) : {},
      credentials: row.credentials ? JSON.parse(row.credentials) : {},
      webhooks: row.webhooks ? JSON.parse(row.webhooks) : [],
      syncSettings: row.sync_settings ? JSON.parse(row.sync_settings) : {},
      monitoring: row.monitoring ? JSON.parse(row.monitoring) : {},
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToLog(row: any): IntegrationLog {
    return {
      id: row.id,
      integrationId: row.integration_id,
      type: row.type as LogType,
      level: row.level as LogLevel,
      message: row.message,
      details: row.details ? JSON.parse(row.details) : {},
      requestId: row.request_id,
      userId: row.user_id,
      timestamp: new Date(row.timestamp),
      duration: row.duration ? parseFloat(row.duration) : undefined,
      success: row.success,
    };
  }
}
