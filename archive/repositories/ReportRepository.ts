/**
 * Report Repository
 *
 * Repository for report generation and management including report templates,
 * scheduled reports, report execution, and report analytics.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  template: ReportTemplate;
  parameters: ReportParameter[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  recipients: string[];
  format: ReportFormat;
  status: ReportStatus;
  metadata: ReportMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReportType {
  SALES = 'sales',
  ANALYTICS = 'analytics',
  FINANCIAL = 'financial',
  INVENTORY = 'inventory',
  CUSTOMER = 'customer',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  HTML = 'html',
  JSON = 'json',
}

export enum ReportStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PROCESSING = 'processing',
}

export interface ReportTemplate {
  id: string;
  name: string;
  layout: ReportLayout;
  sections: ReportSection[];
  styling: ReportStyling;
  charts: ChartConfig[];
  tables: TableConfig[];
}

export interface ReportLayout {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'A3' | 'letter' | 'legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header?: HeaderFooterConfig;
  footer?: HeaderFooterConfig;
}

export interface HeaderFooterConfig {
  enabled: boolean;
  content: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  border: boolean;
}

export interface ReportSection {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  dataSource: DataSource;
  configuration: SectionConfiguration;
  visible: boolean;
}

export enum SectionType {
  TITLE = 'title',
  SUMMARY = 'summary',
  CHART = 'chart',
  TABLE = 'table',
  TEXT = 'text',
  IMAGE = 'image',
  SPACER = 'spacer',
}

export interface DataSource {
  type: DataSourceType;
  query?: string;
  endpoint?: string;
  parameters?: Record<string, any>;
  cache: boolean;
  refreshInterval?: number;
}

export enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  FILE = 'file',
  CACHE = 'cache',
  EXTERNAL = 'external',
}

export interface SectionConfiguration {
  width?: number;
  height?: number;
  columns?: number;
  chartType?: ChartType;
  tableColumns?: TableColumn[];
  aggregation?: AggregationConfig;
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  GAUGE = 'gauge',
  HEATMAP = 'heatmap',
}

export interface TableColumn {
  field: string;
  title: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
  format?: string;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
}

export interface AggregationConfig {
  function: 'sum' | 'average' | 'count' | 'min' | 'max';
  field: string;
  groupBy?: string[];
}

export interface ReportStyling {
  theme: ReportTheme;
  fonts: FontConfig[];
  colors: ColorPalette;
  branding: BrandingConfig;
}

export interface ReportTheme {
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: 'normal' | 'bold' | 'light';
  style: 'normal' | 'italic';
}

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  success: string;
  warning: string;
  error: string;
}

export interface BrandingConfig {
  logo?: string;
  companyName: string;
  website?: string;
  contact?: string;
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  dataSource: DataSource;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series: SeriesConfig[];
  styling: ChartStyling;
}

export interface AxisConfig {
  label: string;
  format?: string;
  min?: number;
  max?: number;
  ticks?: number;
}

export interface SeriesConfig {
  name: string;
  field: string;
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

export interface ChartStyling {
  legend: boolean;
  grid: boolean;
  animation: boolean;
  colors: string[];
}

export interface TableConfig {
  id: string;
  title: string;
  dataSource: DataSource;
  columns: TableColumn[];
  pagination: PaginationConfig;
  sorting: SortingConfig;
  filtering: FilteringConfig;
  styling: TableStyling;
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  showTotal: boolean;
}

export interface SortingConfig {
  enabled: boolean;
  defaultField?: string;
  defaultDirection?: 'asc' | 'desc';
}

export interface FilteringConfig {
  enabled: boolean;
  searchableFields: string[];
  filterTypes: string[];
}

export interface TableStyling {
  striped: boolean;
  bordered: boolean;
  hover: boolean;
  compact: boolean;
}

export interface ReportParameter {
  id: string;
  name: string;
  type: ParameterType;
  required: boolean;
  defaultValue?: any;
  options?: ParameterOption[];
  validation?: ParameterValidation;
}

export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  RANGE = 'range',
}

export interface ParameterOption {
  value: any;
  label: string;
  description?: string;
}

export interface ParameterValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value?: any;
  values?: any[];
  type: FilterType;
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  IN = 'in',
  NOT_IN = 'not_in',
}

export enum FilterType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  RANGE = 'range',
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  timezone: string;
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  recipients: string[];
  format: ReportFormat;
  deliveryMethod: DeliveryMethod;
}

export enum ScheduleFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum DeliveryMethod {
  EMAIL = 'email',
  DOWNLOAD = 'download',
  WEBHOOK = 'webhook',
  CLOUD_STORAGE = 'cloud_storage',
}

export interface ReportMetadata {
  description?: string;
  tags: string[];
  category: string;
  owner: string;
  department?: string;
  retention?: RetentionPolicy;
  access: AccessPolicy;
}

export interface RetentionPolicy {
  duration: number; // in days
  archive: boolean;
  deleteAfterArchive: boolean;
}

export interface AccessPolicy {
  public: boolean;
  roles: string[];
  users: string[];
  permissions: Permission[];
}

export interface Permission {
  action: 'view' | 'edit' | 'delete' | 'share';
  roles: string[];
  users: string[];
}

export interface ReportExecution {
  id: string;
  reportId: string;
  parameters: Record<string, any>;
  status: ExecutionStatus;
  format: ReportFormat;
  filePath?: string;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  metadata: ExecutionMetadata;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ExecutionMetadata {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
}

export interface ReportFilters {
  type?: ReportType;
  status?: ReportStatus;
  format?: ReportFormat;
  category?: string;
  owner?: string;
  tags?: string[];
  search?: string;
}

export interface ReportCreateData {
  name: string;
  description: string;
  type: ReportType;
  template: ReportTemplate;
  parameters?: ReportParameter[];
  filters?: ReportFilter[];
  schedule?: ReportSchedule;
  recipients: string[];
  format: ReportFormat;
  metadata?: Partial<ReportMetadata>;
}

export interface ReportUpdateData {
  name?: string;
  description?: string;
  template?: ReportTemplate;
  parameters?: ReportParameter[];
  filters?: ReportFilter[];
  schedule?: ReportSchedule;
  recipients?: string[];
  format?: ReportFormat;
  status?: ReportStatus;
  metadata?: Partial<ReportMetadata>;
}

export class ReportRepository extends BaseRepository<Report> {
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

  // Get reports by type
  async getByType(type: ReportType): Promise<Report[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getByType', type);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Report[]>(cacheKey);
        if (cached) {
          this.logOperation('getByType', 'cache_hit', { type, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM reports WHERE type = $1 ORDER BY name ASC';
      const result = await this.dbConnection.query(query, [type]);
      const reports = result.rows.map(row => this.mapRowToReport(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, reports, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getByType', 'success', { type, count: reports.length, executionTime });

      return reports;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getByType', 'error', { type, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get active reports
  async getActiveReports(): Promise<Report[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getActiveReports');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Report[]>(cacheKey);
        if (cached) {
          this.logOperation('getActiveReports', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM reports WHERE status = $1 ORDER BY name ASC';
      const result = await this.dbConnection.query(query, [ReportStatus.ACTIVE]);
      const reports = result.rows.map(row => this.mapRowToReport(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, reports, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getActiveReports', 'success', { count: reports.length, executionTime });

      return reports;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getActiveReports', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Execute report
  async executeReport(reportId: string, parameters: Record<string, any> = {}, userId?: string): Promise<ReportExecution> {
    const startTime = Date.now();

    try {
      const report = await this.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      if (report.status !== ReportStatus.ACTIVE) {
        throw new Error('Report is not active');
      }

      // Create execution record
      const execution: Omit<ReportExecution, 'id' | 'startedAt'> = {
        reportId,
        parameters,
        status: ExecutionStatus.PENDING,
        format: report.format,
        metadata: {
          userId: userId || 'system',
        },
      };

      const executionQuery = `
        INSERT INTO report_executions (
          report_id, parameters, status, format, metadata, started_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const executionResult = await this.dbConnection.query(executionQuery, [
        execution.reportId,
        JSON.stringify(execution.parameters),
        execution.status,
        execution.format,
        JSON.stringify(execution.metadata),
      ]);

      const createdExecution = this.mapRowToExecution(executionResult.rows[0]);

      // Process report execution asynchronously
      this.processReportExecution(createdExecution.id, report, parameters).catch(error => {
        this.logOperation('processReportExecution', 'error', {
          executionId: createdExecution.id,
          error: (error as Error).message,
        });
      });

      const executionTime = Date.now() - startTime;
      this.logOperation('executeReport', 'success', {
        reportId,
        executionId: createdExecution.id,
        executionTime,
      });

      return createdExecution;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('executeReport', 'error', {
        reportId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get report execution
  async getExecution(executionId: string): Promise<ReportExecution | null> {
    const startTime = Date.now();

    try {
      const query = 'SELECT * FROM report_executions WHERE id = $1';
      const result = await this.dbConnection.query(query, [executionId]);

      if (result.rows.length === 0) {
        return null;
      }

      const execution = this.mapRowToExecution(result.rows[0]);

      const executionTime = Date.now() - startTime;
      this.logOperation('getExecution', 'success', { executionId, executionTime });

      return execution;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getExecution', 'error', { executionId, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get report executions
  async getExecutions(reportId: string, options: {
    limit?: number;
    offset?: number;
    status?: ExecutionStatus;
    timeRange?: { start: Date; end: Date };
  } = {}): Promise<ReportExecution[]> {
    const startTime = Date.now();

    try {
      let query = 'SELECT * FROM report_executions WHERE report_id = $1';
      const params: any[] = [reportId];
      let paramIndex = 2;

      if (options.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(options.status);
        paramIndex++;
      }

      if (options.timeRange) {
        query += ` AND started_at >= $${paramIndex} AND started_at <= $${paramIndex + 1}`;
        params.push(options.timeRange.start, options.timeRange.end);
        paramIndex += 2;
      }

      query += ' ORDER BY started_at DESC';

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
      const executions = result.rows.map(row => this.mapRowToExecution(row));

      const executionTime = Date.now() - startTime;
      this.logOperation('getExecutions', 'success', {
        reportId,
        count: executions.length,
        executionTime,
      });

      return executions;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getExecutions', 'error', {
        reportId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Schedule report
  async updateSchedule(reportId: string, schedule: ReportSchedule): Promise<Report> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE reports 
        SET schedule = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await this.dbConnection.query(query, [JSON.stringify(schedule), reportId]);

      if (result.rows.length === 0) {
        throw new Error('Report not found');
      }

      const report = this.mapRowToReport(result.rows[0]);

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', reportId));
        await this.clearCachePattern('getByType');
        await this.clearCachePattern('getActiveReports');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('updateSchedule', 'success', { reportId, executionTime });

      return report;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updateSchedule', 'error', {
        reportId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get report statistics
  async getReportStats(): Promise<{
    totalReports: number;
    activeReports: number;
    reportsByType: Record<ReportType, number>;
    reportsByFormat: Record<ReportFormat, number>;
    totalExecutions: number;
    successfulExecutions: number;
    averageExecutionTime: number;
    scheduledReports: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getReportStats');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) {
          this.logOperation('getReportStats', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Get basic statistics
      const basicQuery = `
        SELECT 
          COUNT(*) as total_reports,
          COUNT(CASE WHEN status = $1 THEN 1 END) as active_reports,
          COUNT(CASE WHEN schedule->>'enabled' = 'true' THEN 1 END) as scheduled_reports
        FROM reports
      `;

      const basicResult = await this.dbConnection.query(basicQuery, [ReportStatus.ACTIVE]);
      const basicStats = basicResult.rows[0];

      // Get reports by type
      const typeQuery = 'SELECT type, COUNT(*) as count FROM reports GROUP BY type';
      const typeResult = await this.dbConnection.query(typeQuery);
      const reportsByType = typeResult.rows.reduce((acc: any, row: any) => {
        acc[row.type] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<ReportType, number>);

      // Get reports by format
      const formatQuery = 'SELECT format, COUNT(*) as count FROM reports GROUP BY format';
      const formatResult = await this.dbConnection.query(formatQuery);
      const reportsByFormat = formatResult.rows.reduce((acc: any, row: any) => {
        acc[row.format] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<ReportFormat, number>);

      // Get execution statistics
      const executionQuery = `
        SELECT 
          COUNT(*) as total_executions,
          COUNT(CASE WHEN status = $1 THEN 1 END) as successful_executions,
          COALESCE(AVG(duration), 0) as average_execution_time
        FROM report_executions
      `;

      const executionResult = await this.dbConnection.query(executionQuery, [ExecutionStatus.COMPLETED]);
      const executionStats = executionResult.rows[0];

      const stats = {
        totalReports: parseInt(basicStats.total_reports, 10),
        activeReports: parseInt(basicStats.active_reports, 10),
        reportsByType,
        reportsByFormat,
        totalExecutions: parseInt(executionStats.total_executions, 10),
        successfulExecutions: parseInt(executionStats.successful_executions, 10),
        averageExecutionTime: parseFloat(executionStats.average_execution_time),
        scheduledReports: parseInt(basicStats.scheduled_reports, 10),
      };

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, stats, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getReportStats', 'success', { executionTime });

      return stats;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getReportStats', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Helper methods
  private async processReportExecution(executionId: string, report: Report, parameters: Record<string, any>): Promise<void> {
    const startTime = Date.now();

    try {
      // Update status to running
      await this.updateExecutionStatus(executionId, ExecutionStatus.RUNNING);

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 2000));

      // Generate report file (simulated)
      const filePath = `/reports/${executionId}.${report.format}`;
      const fileSize = Math.floor(Math.random() * 1000000) + 100000; // 100KB - 1MB
      const downloadUrl = `/api/reports/${executionId}/download`;

      // Update execution with results
      await this.updateExecutionResults(executionId, {
        status: ExecutionStatus.COMPLETED,
        filePath,
        fileSize,
        downloadUrl,
        completedAt: new Date(),
        duration: Date.now() - startTime,
      });

      this.logOperation('processReportExecution', 'success', {
        executionId,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      // Update execution with error
      await this.updateExecutionResults(executionId, {
        status: ExecutionStatus.FAILED,
        error: (error as Error).message,
        completedAt: new Date(),
        duration: Date.now() - startTime,
      });

      this.logOperation('processReportExecution', 'error', {
        executionId,
        error: (error as Error).message,
      });
    }
  }

  private async updateExecutionStatus(executionId: string, status: ExecutionStatus): Promise<void> {
    const query = `
      UPDATE report_executions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await this.dbConnection.query(query, [status, executionId]);
  }

  private async updateExecutionResults(executionId: string, results: {
    status: ExecutionStatus;
    filePath?: string;
    fileSize?: number;
    downloadUrl?: string;
    error?: string;
    completedAt: Date;
    duration: number;
  }): Promise<void> {
    const query = `
      UPDATE report_executions 
      SET status = $1, file_path = $2, file_size = $3, download_url = $4,
          error = $5, completed_at = $6, duration = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `;

    await this.dbConnection.query(query, [
      results.status,
      results.filePath || null,
      results.fileSize || null,
      results.downloadUrl || null,
      results.error || null,
      results.completedAt,
      results.duration,
      executionId,
    ]);
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<Report | null> {
    const query = 'SELECT * FROM reports WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToReport(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: Report[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM reports WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (options.filters) {
      if (options.filters.type) {
        query += ` AND type = $${params.length + 1}`;
        params.push(options.filters.type);
      }

      if (options.filters.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(options.filters.status);
      }

      if (options.filters.format) {
        query += ` AND format = $${params.length + 1}`;
        params.push(options.filters.format);
      }

      if (options.filters.search) {
        query += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
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
    const reports = result.rows.map(row => this.mapRowToReport(row));

    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM reports WHERE 1=1';
    const countResult = await this.dbConnection.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: reports,
      totalCount,
      hasMore: options.offset ? options.offset + reports.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<Report>): Promise<Report> {
    const reportData = entity as ReportCreateData;

    const query = `
      INSERT INTO reports (
        name, description, type, template, parameters, filters, schedule,
        recipients, format, status, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      reportData.name,
      reportData.description,
      reportData.type,
      JSON.stringify(reportData.template),
      JSON.stringify(reportData.parameters || []),
      JSON.stringify(reportData.filters || []),
      JSON.stringify(reportData.schedule || {}),
      JSON.stringify(reportData.recipients || []),
      reportData.format,
      ReportStatus.DRAFT,
      JSON.stringify({
        tags: [],
        category: 'general',
        owner: 'system',
        access: { public: false, roles: [], users: [], permissions: [] },
        ...reportData.metadata,
      }),
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToReport(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<Report>): Promise<Report | null> {
    const updateData = updates as ReportUpdateData;

    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.name !== undefined) {
      setClause.push(`name = $${paramIndex}`);
      params.push(updateData.name);
      paramIndex++;
    }

    if (updateData.description !== undefined) {
      setClause.push(`description = $${paramIndex}`);
      params.push(updateData.description);
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
      UPDATE reports 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToReport(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'DELETE FROM reports WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM reports WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.type) {
        query += ` AND type = $${params.length + 1}`;
        params.push(filters.type);
      }

      if (filters.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(filters.status);
      }

      if (filters.format) {
        query += ` AND format = $${params.length + 1}`;
        params.push(filters.format);
      }
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM reports WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<Report>): Promise<void> {
    const reportData = entity as ReportCreateData;

    if (!reportData.name) {
      throw new Error('Report name is required');
    }

    if (!reportData.type) {
      throw new Error('Report type is required');
    }

    if (!reportData.template) {
      throw new Error('Report template is required');
    }

    if (!reportData.format) {
      throw new Error('Report format is required');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getReportStats();
  }

  // Helper methods for mapping
  private mapRowToReport(row: any): Report {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type as ReportType,
      template: row.template ? JSON.parse(row.template) : {},
      parameters: row.parameters ? JSON.parse(row.parameters) : [],
      filters: row.filters ? JSON.parse(row.filters) : [],
      schedule: row.schedule ? JSON.parse(row.schedule) : undefined,
      recipients: row.recipients ? JSON.parse(row.recipients) : [],
      format: row.format as ReportFormat,
      status: row.status as ReportStatus,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToExecution(row: any): ReportExecution {
    return {
      id: row.id,
      reportId: row.report_id,
      parameters: row.parameters ? JSON.parse(row.parameters) : {},
      status: row.status as ExecutionStatus,
      format: row.format as ReportFormat,
      filePath: row.file_path,
      fileSize: row.file_size ? parseInt(row.file_size) : undefined,
      downloadUrl: row.download_url,
      error: row.error,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      duration: row.duration ? parseFloat(row.duration) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }
}
