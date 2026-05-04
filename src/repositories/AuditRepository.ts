/**
 * Audit Repository
 * 
 * Repository for audit trail management including audit logging,
 * compliance tracking, security monitoring, and audit reporting.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface AuditLog {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValue?: any;
  newValue?: any;
  changes: AuditChange[];
  metadata: AuditMetadata;
  timestamp: Date;
  severity: AuditSeverity;
  category: AuditCategory;
}

export enum AuditEntityType {
  USER = 'user',
  PRODUCT = 'product',
  ORDER = 'order',
  PAYMENT = 'payment',
  NOTIFICATION = 'notification',
  CACHE = 'cache',
  SYSTEM = 'system',
  CONFIGURATION = 'configuration',
  SECURITY = 'security',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS = 'access',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SYSTEM_CONFIG = 'system_config',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  PERFORMANCE = 'performance',
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
}

export interface AuditMetadata {
  source: string;
  requestId?: string;
  correlationId?: string;
  environment: 'development' | 'staging' | 'production';
  version?: string;
  tags: string[];
  additionalData?: Record<string, any>;
}

export interface AuditFilters {
  entityType?: AuditEntityType;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  severity?: AuditSeverity;
  category?: AuditCategory;
  timeRange?: {
    start: Date;
    end: Date;
  };
  ipAddress?: string;
  tags?: string[];
}

export interface AuditReport {
  id: string;
  name: string;
  description: string;
  filters: AuditFilters;
  groupBy?: string[];
  aggregations: AuditAggregation[];
  schedule?: AuditReportSchedule;
  recipients: string[];
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditAggregation {
  field: string;
  function: 'count' | 'sum' | 'average' | 'min' | 'max';
  alias?: string;
}

export interface AuditReportSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  timezone: string;
  time: string; // HH:mm format
}

export interface AuditStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEntityType, number>;
  eventsByAction: Record<AuditAction, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  eventsByCategory: Record<AuditCategory, number>;
  uniqueUsers: number;
  uniqueEntities: number;
  topUsers: Array<{ userId: string; count: number }>;
  topEntities: Array<{ entityType: AuditEntityType; entityId: string; count: number }>;
  criticalEvents: number;
  complianceScore: number;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: ComplianceType;
  conditions: ComplianceCondition[];
  actions: ComplianceAction[];
  isActive: boolean;
  severity: AuditSeverity;
  schedule?: ComplianceSchedule;
  createdAt: Date;
  updatedAt: Date;
}

export enum ComplianceType {
  DATA_RETENTION = 'data_retention',
  ACCESS_CONTROL = 'access_control',
  ENCRYPTION = 'encryption',
  AUDIT_TRAIL = 'audit_trail',
  PRIVACY = 'privacy',
  SECURITY = 'security',
}

export interface ComplianceCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface ComplianceAction {
  type: 'alert' | 'block' | 'log' | 'report' | 'notify';
  parameters: Record<string, any>;
}

export interface ComplianceSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  timezone: string;
  time: string;
}

export class AuditRepository extends BaseRepository<AuditLog> {
  constructor(
    dbConnection: DatabaseConnection,
    cacheManager: CacheManager,
    logger: Logger
  ) {
    super(dbConnection, cacheManager, logger, {
      useCache: true,
      cacheTTL: 300000, // 5 minutes
      enableLogging: true,
      retryAttempts: 3,
      timeout: 30000,
    });
  }

  // Log audit event
  async logEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const startTime = Date.now();

    try {
      const query = `
        INSERT INTO audit_logs (
          entity_type, entity_id, action, user_id, session_id, ip_address,
          user_agent, old_value, new_value, changes, metadata, timestamp,
          severity, category, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP
        ) RETURNING *
      `;

      const params = [
        event.entityType,
        event.entityId,
        event.action,
        event.userId,
        event.sessionId,
        event.ipAddress,
        event.userAgent,
        event.oldValue ? JSON.stringify(event.oldValue) : null,
        event.newValue ? JSON.stringify(event.newValue) : null,
        JSON.stringify(event.changes),
        JSON.stringify(event.metadata),
        new Date(),
        event.severity,
        event.category,
      ];

      const result = await this.dbConnection.query(query, params);
      const auditLog = this.mapRowToAuditLog(result.rows[0]);

      const executionTime = Date.now() - startTime;
      this.logOperation('logEvent', 'success', {
        entityType: event.entityType,
        entityId: event.entityId,
        action: event.action,
        userId: event.userId,
        executionTime,
      });

      // Check compliance rules
      await this.checkComplianceRules(auditLog);

      return auditLog;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('logEvent', 'error', {
        entityType: event.entityType,
        entityId: event.entityId,
        action: event.action,
        userId: event.userId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Query audit logs
  async queryAuditLogs(filters: AuditFilters, options: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<AuditLog[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('queryAuditLogs', '', { filters, options });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<AuditLog[]>(cacheKey);
        if (cached) {
          this.logOperation('queryAuditLogs', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      // Apply filters
      if (filters.entityType) {
        query += ` AND entity_type = $${paramIndex}`;
        params.push(filters.entityType);
        paramIndex++;
      }

      if (filters.entityId) {
        query += ` AND entity_id = $${paramIndex}`;
        params.push(filters.entityId);
        paramIndex++;
      }

      if (filters.action) {
        query += ` AND action = $${paramIndex}`;
        params.push(filters.action);
        paramIndex++;
      }

      if (filters.userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(filters.userId);
        paramIndex++;
      }

      if (filters.severity) {
        query += ` AND severity = $${paramIndex}`;
        params.push(filters.severity);
        paramIndex++;
      }

      if (filters.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(filters.category);
        paramIndex++;
      }

      if (filters.timeRange) {
        query += ` AND timestamp >= $${paramIndex} AND timestamp <= $${paramIndex + 1}`;
        params.push(filters.timeRange.start, filters.timeRange.end);
        paramIndex += 2;
      }

      if (filters.ipAddress) {
        query += ` AND ip_address = $${paramIndex}`;
        params.push(filters.ipAddress);
        paramIndex++;
      }

      if (filters.tags && filters.tags.length > 0) {
        query += ` AND metadata->'tags' ?| $${paramIndex}`;
        params.push(filters.tags);
        paramIndex++;
      }

      // Add sorting
      if (options.sortBy) {
        query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'DESC'}`;
      } else {
        query += ' ORDER BY timestamp DESC';
      }

      // Add pagination
      if (options.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;

        if (options.offset) {
          query += ` OFFSET $${paramIndex}`;
          params.push(options.offset);
          paramIndex++;
        }
      }

      const result = await this.dbConnection.query(query, params);
      const auditLogs = result.rows.map(row => this.mapRowToAuditLog(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, auditLogs, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('queryAuditLogs', 'success', {
        count: auditLogs.length,
        executionTime,
      });

      return auditLogs;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('queryAuditLogs', 'error', {
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get audit statistics
  async getAuditStatistics(filters?: AuditFilters): Promise<AuditStatistics> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getAuditStatistics', '', { filters });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<AuditStatistics>(cacheKey);
        if (cached) {
          this.logOperation('getAuditStatistics', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filters) {
        if (filters.timeRange) {
          whereClause += ` AND timestamp >= $${params.length + 1} AND timestamp <= $${params.length + 2}`;
          params.push(filters.timeRange.start, filters.timeRange.end);
        }

        if (filters.entityType) {
          whereClause += ` AND entity_type = $${params.length + 1}`;
          params.push(filters.entityType);
        }

        if (filters.userId) {
          whereClause += ` AND user_id = $${params.length + 1}`;
          params.push(filters.userId);
        }
      }

      // Get basic statistics
      const basicQuery = `
        SELECT 
          COUNT(*) as total_events,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT CONCAT(entity_type, ':', entity_id)) as unique_entities,
          COUNT(CASE WHEN severity = $1 THEN 1 END) as critical_events
        FROM audit_logs ${whereClause}
      `;

      const basicResult = await this.dbConnection.query(basicQuery, [
        AuditSeverity.CRITICAL,
        ...params,
      ]);

      const basicStats = basicResult.rows[0];

      // Get events by type
      const typeQuery = `
        SELECT entity_type, COUNT(*) as count 
        FROM audit_logs ${whereClause}
        GROUP BY entity_type
      `;

      const typeResult = await this.dbConnection.query(typeQuery, params);
      const eventsByType = typeResult.rows.reduce((acc, row) => {
        acc[row.entity_type] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<AuditEntityType, number>);

      // Get events by action
      const actionQuery = `
        SELECT action, COUNT(*) as count 
        FROM audit_logs ${whereClause}
        GROUP BY action
      `;

      const actionResult = await this.dbConnection.query(actionQuery, params);
      const eventsByAction = actionResult.rows.reduce((acc, row) => {
        acc[row.action] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<AuditAction, number>);

      // Get events by severity
      const severityQuery = `
        SELECT severity, COUNT(*) as count 
        FROM audit_logs ${whereClause}
        GROUP BY severity
      `;

      const severityResult = await this.dbConnection.query(severityQuery, params);
      const eventsBySeverity = severityResult.rows.reduce((acc, row) => {
        acc[row.severity] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<AuditSeverity, number>);

      // Get events by category
      const categoryQuery = `
        SELECT category, COUNT(*) as count 
        FROM audit_logs ${whereClause}
        GROUP BY category
      `;

      const categoryResult = await this.dbConnection.query(categoryQuery, params);
      const eventsByCategory = categoryResult.rows.reduce((acc, row) => {
        acc[row.category] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<AuditCategory, number>);

      // Get top users
      const topUsersQuery = `
        SELECT user_id, COUNT(*) as count 
        FROM audit_logs ${whereClause} AND user_id IS NOT NULL
        GROUP BY user_id 
        ORDER BY count DESC 
        LIMIT 10
      `;

      const topUsersResult = await this.dbConnection.query(topUsersQuery, params);
      const topUsers = topUsersResult.rows.map(row => ({
        userId: row.user_id,
        count: parseInt(row.count, 10),
      }));

      // Get top entities
      const topEntitiesQuery = `
        SELECT entity_type, entity_id, COUNT(*) as count 
        FROM audit_logs ${whereClause}
        GROUP BY entity_type, entity_id 
        ORDER BY count DESC 
        LIMIT 10
      `;

      const topEntitiesResult = await this.dbConnection.query(topEntitiesQuery, params);
      const topEntities = topEntitiesResult.rows.map(row => ({
        entityType: row.entity_type,
        entityId: row.entity_id,
        count: parseInt(row.count, 10),
      }));

      // Calculate compliance score (simplified)
      const totalEvents = parseInt(basicStats.total_events, 10);
      const criticalEvents = parseInt(basicStats.critical_events, 10);
      const complianceScore = totalEvents > 0 ? Math.max(0, 100 - (criticalEvents / totalEvents) * 100) : 100;

      const statistics: AuditStatistics = {
        totalEvents,
        eventsByType,
        eventsByAction,
        eventsBySeverity,
        eventsByCategory,
        uniqueUsers: parseInt(basicStats.unique_users, 10),
        uniqueEntities: parseInt(basicStats.unique_entities, 10),
        topUsers,
        topEntities,
        criticalEvents,
        complianceScore,
      };

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, statistics, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getAuditStatistics', 'success', { executionTime });

      return statistics;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getAuditStatistics', 'error', {
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get user activity
  async getUserActivity(userId: string, timeRange?: { start: Date; end: Date }): Promise<AuditLog[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getUserActivity', userId, { timeRange });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<AuditLog[]>(cacheKey);
        if (cached) {
          this.logOperation('getUserActivity', 'cache_hit', { userId, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      let query = 'SELECT * FROM audit_logs WHERE user_id = $1';
      const params: any[] = [userId];

      if (timeRange) {
        query += ' AND timestamp >= $2 AND timestamp <= $3';
        params.push(timeRange.start, timeRange.end);
      }

      query += ' ORDER BY timestamp DESC LIMIT 100';

      const result = await this.dbConnection.query(query, params);
      const activities = result.rows.map(row => this.mapRowToAuditLog(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, activities, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getUserActivity', 'success', {
        userId,
        count: activities.length,
        executionTime,
      });

      return activities;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getUserActivity', 'error', {
        userId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get entity history
  async getEntityHistory(entityType: AuditEntityType, entityId: string): Promise<AuditLog[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getEntityHistory', entityType, entityId);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<AuditLog[]>(cacheKey);
        if (cached) {
          this.logOperation('getEntityHistory', 'cache_hit', { entityType, entityId, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = `
        SELECT * FROM audit_logs 
        WHERE entity_type = $1 AND entity_id = $2 
        ORDER BY timestamp DESC
      `;

      const result = await this.dbConnection.query(query, [entityType, entityId]);
      const history = result.rows.map(row => this.mapRowToAuditLog(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, history, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getEntityHistory', 'success', {
        entityType,
        entityId,
        count: history.length,
        executionTime,
      });

      return history;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getEntityHistory', 'error', {
        entityType,
        entityId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Check compliance rules
  private async checkComplianceRules(auditLog: AuditLog): Promise<void> {
    try {
      // Get active compliance rules
      const rulesQuery = 'SELECT * FROM compliance_rules WHERE is_active = true';
      const rulesResult = await this.dbConnection.query(rulesQuery);
      const rules = rulesResult.rows.map(row => this.mapRowToComplianceRule(row));

      for (const rule of rules) {
        if (await this.evaluateComplianceRule(rule, auditLog)) {
          await this.executeComplianceActions(rule, auditLog);
        }
      }
    } catch (error) {
      this.logOperation('checkComplianceRules', 'error', {
        auditLogId: auditLog.id,
        error: (error as Error).message,
      });
    }
  }

  // Evaluate compliance rule
  private async evaluateComplianceRule(rule: ComplianceRule, auditLog: AuditLog): Promise<boolean> {
    for (const condition of rule.conditions) {
      const fieldValue = this.getFieldValue(auditLog, condition.field);
      
      let conditionMet = false;
      switch (condition.operator) {
        case 'equals':
          conditionMet = fieldValue === condition.value;
          break;
        case 'not_equals':
          conditionMet = fieldValue !== condition.value;
          break;
        case 'contains':
          conditionMet = typeof fieldValue === 'string' && fieldValue.includes(condition.value);
          break;
        case 'not_contains':
          conditionMet = typeof fieldValue === 'string' && !fieldValue.includes(condition.value);
          break;
        case 'greater_than':
          conditionMet = Number(fieldValue) > Number(condition.value);
          break;
        case 'less_than':
          conditionMet = Number(fieldValue) < Number(condition.value);
          break;
        case 'in':
          conditionMet = Array.isArray(condition.value) && condition.value.includes(fieldValue);
          break;
        case 'not_in':
          conditionMet = Array.isArray(condition.value) && !condition.value.includes(fieldValue);
          break;
      }

      if (!conditionMet) {
        return false;
      }
    }

    return true;
  }

  // Execute compliance actions
  private async executeComplianceActions(rule: ComplianceRule, auditLog: AuditLog): Promise<void> {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'alert':
            // Send alert notification
            await this.sendComplianceAlert(rule, auditLog, action.parameters);
            break;
          case 'log':
            // Log compliance event
            await this.logComplianceEvent(rule, auditLog, action.parameters);
            break;
          case 'notify':
            // Send notification
            await this.sendComplianceNotification(rule, auditLog, action.parameters);
            break;
        }
      } catch (error) {
        this.logOperation('executeComplianceActions', 'error', {
          ruleId: rule.id,
          actionType: action.type,
          error: (error as Error).message,
        });
      }
    }
  }

  // Helper methods for compliance actions
  private async sendComplianceAlert(rule: ComplianceRule, auditLog: AuditLog, parameters: Record<string, any>): Promise<void> {
    // Implementation would depend on notification system
    this.logOperation('sendComplianceAlert', 'success', {
      ruleId: rule.id,
      auditLogId: auditLog.id,
    });
  }

  private async logComplianceEvent(rule: ComplianceRule, auditLog: AuditLog, parameters: Record<string, any>): Promise<void> {
    // Log compliance event
    this.logOperation('logComplianceEvent', 'success', {
      ruleId: rule.id,
      auditLogId: auditLog.id,
    });
  }

  private async sendComplianceNotification(rule: ComplianceRule, auditLog: AuditLog, parameters: Record<string, any>): Promise<void> {
    // Send compliance notification
    this.logOperation('sendComplianceNotification', 'success', {
      ruleId: rule.id,
      auditLogId: auditLog.id,
    });
  }

  private getFieldValue(auditLog: AuditLog, field: string): any {
    const fieldPath = field.split('.');
    let value: any = auditLog;

    for (const path of fieldPath) {
      if (value && typeof value === 'object' && path in value) {
        value = value[path];
      } else {
        return undefined;
      }
    }

    return value;
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<AuditLog | null> {
    const query = 'SELECT * FROM audit_logs WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToAuditLog(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: AuditLog[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (options.filters) {
      if (options.filters.entityType) {
        query += ` AND entity_type = $${params.length + 1}`;
        params.push(options.filters.entityType);
      }

      if (options.filters.action) {
        query += ` AND action = $${params.length + 1}`;
        params.push(options.filters.action);
      }

      if (options.filters.userId) {
        query += ` AND user_id = $${params.length + 1}`;
        params.push(options.filters.userId);
      }
    }

    // Add sorting
    if (options.sortBy) {
      query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'DESC'}`;
    } else {
      query += ' ORDER BY timestamp DESC';
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
    const auditLogs = result.rows.map(row => this.mapRowToAuditLog(row));

    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
    const countResult = await this.dbConnection.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: auditLogs,
      totalCount,
      hasMore: options.offset ? options.offset + auditLogs.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<AuditLog>): Promise<AuditLog> {
    const auditLog = entity as Omit<AuditLog, 'id' | 'timestamp'>;
    
    const query = `
      INSERT INTO audit_logs (
        entity_type, entity_id, action, user_id, session_id, ip_address,
        user_agent, old_value, new_value, changes, metadata, timestamp,
        severity, category, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      auditLog.entityType,
      auditLog.entityId,
      auditLog.action,
      auditLog.userId,
      auditLog.sessionId,
      auditLog.ipAddress,
      auditLog.userAgent,
      auditLog.oldValue ? JSON.stringify(auditLog.oldValue) : null,
      auditLog.newValue ? JSON.stringify(auditLog.newValue) : null,
      JSON.stringify(auditLog.changes),
      JSON.stringify(auditLog.metadata),
      new Date(),
      auditLog.severity,
      auditLog.category,
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToAuditLog(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<AuditLog>): Promise<AuditLog | null> {
    // Audit logs are immutable
    throw new Error('Audit logs cannot be updated');
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    // Audit logs should not be deleted, only archived
    throw new Error('Audit logs cannot be deleted');
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.entityType) {
        query += ` AND entity_type = $${params.length + 1}`;
        params.push(filters.entityType);
      }

      if (filters.action) {
        query += ` AND action = $${params.length + 1}`;
        params.push(filters.action);
      }

      if (filters.userId) {
        query += ` AND user_id = $${params.length + 1}`;
        params.push(filters.userId);
      }
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM audit_logs WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<AuditLog>): Promise<void> {
    const auditLog = entity as Omit<AuditLog, 'id' | 'timestamp'>;

    if (!auditLog.entityType) {
      throw new Error('Entity type is required');
    }

    if (!auditLog.entityId) {
      throw new Error('Entity ID is required');
    }

    if (!auditLog.action) {
      throw new Error('Action is required');
    }

    if (!auditLog.severity) {
      throw new Error('Severity is required');
    }

    if (!auditLog.category) {
      throw new Error('Category is required');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getAuditStatistics();
  }

  // Helper methods
  private mapRowToAuditLog(row: any): AuditLog {
    return {
      id: row.id,
      entityType: row.entity_type as AuditEntityType,
      entityId: row.entity_id,
      action: row.action as AuditAction,
      userId: row.user_id,
      sessionId: row.session_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      oldValue: row.old_value ? JSON.parse(row.old_value) : undefined,
      newValue: row.new_value ? JSON.parse(row.new_value) : undefined,
      changes: row.changes ? JSON.parse(row.changes) : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      timestamp: new Date(row.timestamp),
      severity: row.severity as AuditSeverity,
      category: row.category as AuditCategory,
    };
  }

  private mapRowToComplianceRule(row: any): ComplianceRule {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type as ComplianceType,
      conditions: row.conditions ? JSON.parse(row.conditions) : [],
      actions: row.actions ? JSON.parse(row.actions) : [],
      isActive: row.is_active,
      severity: row.severity as AuditSeverity,
      schedule: row.schedule ? JSON.parse(row.schedule) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
