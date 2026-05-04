/**
 * Analytics Repository
 * 
 * Repository for analytics data management including metrics collection,
 * event tracking, reporting, and analytics aggregation.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  eventName: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp: Date;
  source: AnalyticsSource;
  metadata: AnalyticsEventMetadata;
}

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  BUSINESS_EVENT = 'business_event',
  ERROR_EVENT = 'error_event',
  PERFORMANCE_EVENT = 'performance_event',
}

export enum AnalyticsSource {
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
  SERVER = 'server',
  BACKGROUND = 'background',
}

export interface AnalyticsEventMetadata {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  url?: string;
  platform?: string;
  version?: string;
  environment: 'development' | 'staging' | 'production';
}

export interface AnalyticsMetric {
  id: string;
  name: string;
  type: MetricType;
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: Date;
  metadata: AnalyticsMetricMetadata;
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer',
}

export interface AnalyticsMetricMetadata {
  source: string;
  interval?: string;
  aggregation?: MetricAggregation;
  dimensions?: string[];
}

export enum MetricAggregation {
  SUM = 'sum',
  AVERAGE = 'average',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
  PERCENTILE = 'percentile',
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  query: AnalyticsQuery;
  schedule?: ReportSchedule;
  recipients: string[];
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReportType {
  DASHBOARD = 'dashboard',
  SUMMARY = 'summary',
  TREND = 'trend',
  FUNNEL = 'funnel',
  COHORT = 'cohort',
  RETENTION = 'retention',
}

export interface AnalyticsQuery {
  eventType?: AnalyticsEventType;
  eventName?: string;
  filters: AnalyticsFilter[];
  groupBy?: string[];
  aggregations: AnalyticsAggregation[];
  timeRange: TimeRange;
  limit?: number;
}

export interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface AnalyticsAggregation {
  field: string;
  function: MetricAggregation;
  alias?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface ReportSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  timezone: string;
  time: string; // HH:mm format
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters?: AnalyticsFilter[];
  timeRange: TimeRange;
  isPublic: boolean;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  query: AnalyticsQuery;
  visualization: WidgetVisualization;
  position: WidgetPosition;
  size: WidgetSize;
}

export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  METRIC = 'metric',
  FUNNEL = 'funnel',
  MAP = 'map',
  HEATMAP = 'heatmap',
}

export interface WidgetVisualization {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'gauge';
  colors?: string[];
  showLegend?: boolean;
  showAxes?: boolean;
  showGrid?: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
}

export interface AnalyticsFilters {
  eventType?: AnalyticsEventType;
  eventName?: string;
  userId?: string;
  source?: AnalyticsSource;
  timeRange?: TimeRange;
  properties?: Record<string, any>;
}

export class AnalyticsRepository extends BaseRepository<AnalyticsEvent> {
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

  // Track event
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const startTime = Date.now();

    try {
      const query = `
        INSERT INTO analytics_events (
          event_type, event_name, user_id, session_id, properties, 
          timestamp, source, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `;

      await this.dbConnection.query(query, [
        event.eventType,
        event.eventName,
        event.userId,
        event.sessionId,
        JSON.stringify(event.properties),
        new Date(),
        event.source,
        JSON.stringify(event.metadata),
      ]);

      const executionTime = Date.now() - startTime;
      this.logOperation('trackEvent', 'success', { 
        eventType: event.eventType, 
        eventName: event.eventName, 
        userId: event.userId,
        executionTime 
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('trackEvent', 'error', { 
        eventType: event.eventType, 
        eventName: event.eventName, 
        userId: event.userId,
        error: error.message, 
        executionTime 
      });
      throw error;
    }
  }

  // Record metric
  async recordMetric(metric: Omit<AnalyticsMetric, 'id' | 'timestamp'>): Promise<void> {
    const startTime = Date.now();

    try {
      const query = `
        INSERT INTO analytics_metrics (
          name, type, value, unit, tags, timestamp, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `;

      await this.dbConnection.query(query, [
        metric.name,
        metric.type,
        metric.value,
        metric.unit,
        JSON.stringify(metric.tags),
        new Date(),
        JSON.stringify(metric.metadata),
      ]);

      const executionTime = Date.now() - startTime;
      this.logOperation('recordMetric', 'success', { 
        metricName: metric.name, 
        metricType: metric.type, 
        value: metric.value,
        executionTime 
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('recordMetric', 'error', { 
        metricName: metric.name, 
        metricType: metric.type, 
        value: metric.value,
        error: error.message, 
        executionTime 
      });
      throw error;
    }
  }

  // Query events
  async queryEvents(query: AnalyticsQuery): Promise<any[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('queryEvents', '', { query });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any[]>(cacheKey);
        if (cached) {
          this.logOperation('queryEvents', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Build SQL query from AnalyticsQuery
      const { sqlQuery, params } = this.buildEventQuery(query);
      const result = await this.dbConnection.query(sqlQuery, params);
      
      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, result.rows, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('queryEvents', 'success', { 
        eventType: query.eventType, 
        eventName: query.eventName,
        count: result.rows.length,
        executionTime 
      });

      return result.rows;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('queryEvents', 'error', { 
        eventType: query.eventType, 
        eventName: query.eventName,
        error: error.message, 
        executionTime 
      });
      throw error;
    }
  }

  // Get metrics
  async getMetrics(filters: {
    name?: string;
    type?: MetricType;
    tags?: Record<string, string>;
    timeRange?: TimeRange;
  }): Promise<AnalyticsMetric[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getMetrics', '', { filters });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<AnalyticsMetric[]>(cacheKey);
        if (cached) {
          this.logOperation('getMetrics', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      let query = 'SELECT * FROM analytics_metrics WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.name) {
        query += ` AND name = $${paramIndex}`;
        params.push(filters.name);
        paramIndex++;
      }

      if (filters.type) {
        query += ` AND type = $${paramIndex}`;
        params.push(filters.type);
        paramIndex++;
      }

      if (filters.timeRange) {
        query += ` AND timestamp >= $${paramIndex} AND timestamp <= $${paramIndex + 1}`;
        params.push(filters.timeRange.start, filters.timeRange.end);
        paramIndex += 2;
      }

      if (filters.tags) {
        for (const [key, value] of Object.entries(filters.tags)) {
          query += ` AND tags->>${paramIndex} = $${paramIndex + 1}`;
          params.push(key, value);
          paramIndex += 2;
        }
      }

      query += ' ORDER BY timestamp DESC';

      if (filters.timeRange) {
        query += ` LIMIT 1000`; // Limit time-range queries
      }

      const result = await this.dbConnection.query(query, params);
      const metrics = result.rows.map(row => this.mapRowToMetric(row));
      
      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, metrics, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getMetrics', 'success', { 
        count: metrics.length,
        executionTime 
      });

      return metrics;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getMetrics', 'error', { 
        error: error.message, 
        executionTime 
      });
      throw error;
    }
  }

  // Create dashboard
  async createDashboard(dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalyticsDashboard> {
    const startTime = Date.now();

    try {
      const query = `
        INSERT INTO analytics_dashboards (
          name, description, widgets, layout, filters, time_range, 
          is_public, owner, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const params = [
        dashboard.name,
        dashboard.description,
        JSON.stringify(dashboard.widgets),
        JSON.stringify(dashboard.layout),
        JSON.stringify(dashboard.filters || []),
        JSON.stringify(dashboard.timeRange),
        dashboard.isPublic,
        dashboard.owner,
      ];

      const result = await this.dbConnection.query(query, params);
      const createdDashboard = this.mapRowToDashboard(result.rows[0]);

      const executionTime = Date.now() - startTime;
      this.logOperation('createDashboard', 'success', { 
        dashboardId: createdDashboard.id,
        executionTime 
      });

      return createdDashboard;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('createDashboard', 'error', { 
        error: error.message, 
        executionTime 
      });
      throw error;
    }
  }

  // Get dashboard
  async getDashboard(dashboardId: string): Promise<AnalyticsDashboard | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getDashboard', dashboardId);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<AnalyticsDashboard>(cacheKey);
        if (cached) {
          this.logOperation('getDashboard', 'cache_hit', { dashboardId, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM analytics_dashboards WHERE id = $1';
      const result = await this.dbConnection.query(query, [dashboardId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const dashboard = this.mapRowToDashboard(result.rows[0]);
      
      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, dashboard, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getDashboard', 'success', { dashboardId, executionTime });

      return dashboard;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getDashboard', 'error', { dashboardId, error: error.message, executionTime });
      throw error;
    }
  }

  // Get analytics summary
  async getAnalyticsSummary(timeRange: TimeRange): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    topEvents: Array<{ eventName: string; count: number }>;
    topPages: Array<{ url: string; count: number }>;
    errorRate: number;
    averageResponseTime: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getAnalyticsSummary', '', { timeRange });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) {
          this.logOperation('getAnalyticsSummary', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Get total events
      const totalEventsQuery = 'SELECT COUNT(*) as count FROM analytics_events WHERE timestamp >= $1 AND timestamp <= $2';
      const totalEventsResult = await this.dbConnection.query(totalEventsQuery, [timeRange.start, timeRange.end]);
      const totalEvents = parseInt(totalEventsResult.rows[0].count, 10);

      // Get unique users
      const uniqueUsersQuery = 'SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE timestamp >= $1 AND timestamp <= $2 AND user_id IS NOT NULL';
      const uniqueUsersResult = await this.dbConnection.query(uniqueUsersQuery, [timeRange.start, timeRange.end]);
      const uniqueUsers = parseInt(uniqueUsersResult.rows[0].count, 10);

      // Get top events
      const topEventsQuery = `
        SELECT event_name, COUNT(*) as count 
        FROM analytics_events 
        WHERE timestamp >= $1 AND timestamp <= $2 
        GROUP BY event_name 
        ORDER BY count DESC 
        LIMIT 10
      `;
      const topEventsResult = await this.dbConnection.query(topEventsQuery, [timeRange.start, timeRange.end]);
      const topEvents = topEventsResult.rows.map(row => ({
        eventName: row.event_name,
        count: parseInt(row.count, 10),
      }));

      // Get top pages
      const topPagesQuery = `
        SELECT metadata->>'url' as url, COUNT(*) as count 
        FROM analytics_events 
        WHERE timestamp >= $1 AND timestamp <= $2 
        AND event_type = $3
        AND metadata->>'url' IS NOT NULL
        GROUP BY metadata->>'url' 
        ORDER BY count DESC 
        LIMIT 10
      `;
      const topPagesResult = await this.dbConnection.query(topPagesQuery, [timeRange.start, timeRange.end, AnalyticsEventType.PAGE_VIEW]);
      const topPages = topPagesResult.rows.map(row => ({
        url: row.url,
        count: parseInt(row.count, 10),
      }));

      // Get error rate
      const errorRateQuery = `
        SELECT 
          COUNT(CASE WHEN event_type = $1 THEN 1 END) * 100.0 / COUNT(*) as error_rate
        FROM analytics_events 
        WHERE timestamp >= $2 AND timestamp <= $3
      `;
      const errorRateResult = await this.dbConnection.query(errorRateQuery, [AnalyticsEventType.ERROR_EVENT, timeRange.start, timeRange.end]);
      const errorRate = parseFloat(errorRateResult.rows[0].error_rate);

      // Get average response time
      const avgResponseTimeQuery = `
        SELECT AVG((properties->>'responseTime')::numeric) as avg_response_time
        FROM analytics_events 
        WHERE timestamp >= $1 AND timestamp <= $2 
        AND event_type = $3
        AND properties->>'responseTime' IS NOT NULL
      `;
      const avgResponseTimeResult = await this.dbConnection.query(avgResponseTimeQuery, [timeRange.start, timeRange.end, AnalyticsEventType.PERFORMANCE_EVENT]);
      const averageResponseTime = parseFloat(avgResponseTimeResult.rows[0].avg_response_time || '0');

      const summary = {
        totalEvents,
        uniqueUsers,
        topEvents,
        topPages,
        errorRate,
        averageResponseTime,
      };
      
      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, summary, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getAnalyticsSummary', 'success', { executionTime });

      return summary;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getAnalyticsSummary', 'error', { error: error.message, executionTime });
      throw error;
    }
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<AnalyticsEvent | null> {
    const query = 'SELECT * FROM analytics_events WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToEvent(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: AnalyticsEvent[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM analytics_events WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters
    if (options.filters) {
      if (options.filters.eventType) {
        query += ` AND event_type = $${paramIndex}`;
        params.push(options.filters.eventType);
        paramIndex++;
      }

      if (options.filters.eventName) {
        query += ` AND event_name = $${paramIndex}`;
        params.push(options.filters.eventName);
        paramIndex++;
      }

      if (options.filters.userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(options.filters.userId);
        paramIndex++;
      }

      if (options.filters.source) {
        query += ` AND source = $${paramIndex}`;
        params.push(options.filters.source);
        paramIndex++;
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
    const events = result.rows.map(row => this.mapRowToEvent(row));

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM analytics_events WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (options.filters) {
      if (options.filters.eventType) {
        countQuery += ` AND event_type = $${countParamIndex}`;
        countParams.push(options.filters.eventType);
        countParamIndex++;
      }

      if (options.filters.eventName) {
        countQuery += ` AND event_name = $${countParamIndex}`;
        countParams.push(options.filters.eventName);
        countParamIndex++;
      }

      if (options.filters.userId) {
        countQuery += ` AND user_id = $${countParamIndex}`;
        countParams.push(options.filters.userId);
        countParamIndex++;
      }

      if (options.filters.source) {
        countQuery += ` AND source = $${countParamIndex}`;
        countParams.push(options.filters.source);
        countParamIndex++;
      }
    }

    const countResult = await this.dbConnection.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: events,
      totalCount,
      hasMore: options.offset ? options.offset + events.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<AnalyticsEvent>): Promise<AnalyticsEvent> {
    const eventData = entity as Omit<AnalyticsEvent, 'id' | 'timestamp'>;
    
    const query = `
      INSERT INTO analytics_events (
        event_type, event_name, user_id, session_id, properties, 
        timestamp, source, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const params = [
      eventData.eventType,
      eventData.eventName,
      eventData.userId,
      eventData.sessionId,
      JSON.stringify(eventData.properties),
      new Date(),
      eventData.source,
      JSON.stringify(eventData.metadata),
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToEvent(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<AnalyticsEvent>): Promise<AnalyticsEvent | null> {
    // Analytics events are typically immutable
    throw new Error('Analytics events cannot be updated');
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'DELETE FROM analytics_events WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM analytics_events WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.eventType) {
        query += ` AND event_type = $${params.length + 1}`;
        params.push(filters.eventType);
      }

      if (filters.eventName) {
        query += ` AND event_name = $${params.length + 1}`;
        params.push(filters.eventName);
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
    const query = 'SELECT 1 FROM analytics_events WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<AnalyticsEvent>): Promise<void> {
    const eventData = entity as Omit<AnalyticsEvent, 'id' | 'timestamp'>;

    if (!eventData.eventType) {
      throw new Error('Event type is required');
    }

    if (!eventData.eventName || eventData.eventName.length < 1) {
      throw new Error('Event name is required');
    }

    if (!eventData.source) {
      throw new Error('Event source is required');
    }

    if (!eventData.metadata || !eventData.metadata.environment) {
      throw new Error('Event metadata with environment is required');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const summary = await this.getAnalyticsSummary({
      start: last24Hours,
      end: now,
      granularity: 'hour',
    });

    return {
      eventsLast24Hours: summary.totalEvents,
      uniqueUsersLast24Hours: summary.uniqueUsers,
      errorRate: summary.errorRate,
      averageResponseTime: summary.averageResponseTime,
    };
  }

  // Helper methods
  private mapRowToEvent(row: any): AnalyticsEvent {
    return {
      id: row.id,
      eventType: row.event_type as AnalyticsEventType,
      eventName: row.event_name,
      userId: row.user_id,
      sessionId: row.session_id,
      properties: row.properties ? JSON.parse(row.properties) : {},
      timestamp: new Date(row.timestamp),
      source: row.source as AnalyticsSource,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }

  private mapRowToMetric(row: any): AnalyticsMetric {
    return {
      id: row.id,
      name: row.name,
      type: row.type as MetricType,
      value: parseFloat(row.value),
      unit: row.unit,
      tags: row.tags ? JSON.parse(row.tags) : {},
      timestamp: new Date(row.timestamp),
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }

  private mapRowToDashboard(row: any): AnalyticsDashboard {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      widgets: row.widgets ? JSON.parse(row.widgets) : [],
      layout: row.layout ? JSON.parse(row.layout) : { columns: 12, rowHeight: 100, margin: [10, 10] },
      filters: row.filters ? JSON.parse(row.filters) : [],
      timeRange: row.time_range ? JSON.parse(row.time_range) : {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
        granularity: 'day',
      },
      isPublic: row.is_public,
      owner: row.owner,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private buildEventQuery(query: AnalyticsQuery): { sqlQuery: string; params: any[] } {
    let sqlQuery = 'SELECT ';
    const params: any[] = [];
    let paramIndex = 1;

    // Build aggregations
    if (query.aggregations.length > 0) {
      const aggregations = query.aggregations.map(agg => {
        const alias = agg.alias || `${agg.function}_${agg.field}`;
        switch (agg.function) {
          case MetricAggregation.COUNT:
            return `COUNT(${agg.field}) as ${alias}`;
          case MetricAggregation.SUM:
            return `SUM(${agg.field}) as ${alias}`;
          case MetricAggregation.AVERAGE:
            return `AVG(${agg.field}) as ${alias}`;
          case MetricAggregation.MIN:
            return `MIN(${agg.field}) as ${alias}`;
          case MetricAggregation.MAX:
            return `MAX(${agg.field}) as ${alias}`;
          default:
            return `COUNT(*) as ${alias}`;
        }
      });
      sqlQuery += aggregations.join(', ');
    } else {
      sqlQuery += '*';
    }

    sqlQuery += ' FROM analytics_events WHERE 1=1';

    // Add filters
    if (query.eventType) {
      sqlQuery += ` AND event_type = $${paramIndex}`;
      params.push(query.eventType);
      paramIndex++;
    }

    if (query.eventName) {
      sqlQuery += ` AND event_name = $${paramIndex}`;
      params.push(query.eventName);
      paramIndex++;
    }

    if (query.timeRange) {
      sqlQuery += ` AND timestamp >= $${paramIndex} AND timestamp <= $${paramIndex + 1}`;
      params.push(query.timeRange.start, query.timeRange.end);
      paramIndex += 2;
    }

    // Add custom filters
    for (const filter of query.filters) {
      switch (filter.operator) {
        case 'equals':
          sqlQuery += ` AND ${filter.field} = $${paramIndex}`;
          break;
        case 'not_equals':
          sqlQuery += ` AND ${filter.field} != $${paramIndex}`;
          break;
        case 'contains':
          sqlQuery += ` AND ${filter.field} LIKE $${paramIndex}`;
          params.push(`%${filter.value}%`);
          break;
        case 'greater_than':
          sqlQuery += ` AND ${filter.field} > $${paramIndex}`;
          break;
        case 'less_than':
          sqlQuery += ` AND ${filter.field} < $${paramIndex}`;
          break;
        case 'in':
          sqlQuery += ` AND ${filter.field} = ANY($${paramIndex})`;
          break;
      }
      if (filter.operator !== 'contains') {
        params.push(filter.value);
      }
      paramIndex++;
    }

    // Add group by
    if (query.groupBy && query.groupBy.length > 0) {
      sqlQuery += ` GROUP BY ${query.groupBy.join(', ')}`;
    }

    // Add limit
    if (query.limit) {
      sqlQuery += ` LIMIT ${query.limit}`;
    }

    return { sqlQuery, params };
  }
}
