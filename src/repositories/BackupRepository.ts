/**
 * Backup Repository
 *
 * Repository for backup management including data backups, restoration,
 * backup scheduling, and backup analytics.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface Backup {
  id: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  size: number;
  location: BackupLocation;
  schedule?: BackupSchedule;
  configuration: BackupConfiguration;
  metadata: BackupMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
  SNAPSHOT = 'snapshot',
}

export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface BackupLocation {
  type: LocationType;
  path?: string;
  bucket?: string;
  region?: string;
  endpoint?: string;
  credentials?: LocationCredentials;
  encryption?: EncryptionConfig;
}

export enum LocationType {
  LOCAL = 'local',
  S3 = 's3',
  AZURE_BLOB = 'azure_blob',
  GOOGLE_CLOUD = 'google_cloud',
  FTP = 'ftp',
  SFTP = 'sftp',
  CUSTOM = 'custom',
}

export interface LocationCredentials {
  accessKey?: string;
  secretKey?: string;
  connectionString?: string;
  username?: string;
  password?: string;
  privateKey?: string;
  certificate?: string;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyId?: string;
  iv?: string;
}

export interface BackupSchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  timezone: string;
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  retentionPolicy: RetentionPolicy;
}

export enum ScheduleFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export interface RetentionPolicy {
  count: number;
  duration: number; // in days
  archiveAfter?: number; // in days
  deleteAfter?: number; // in days
}

export interface BackupConfiguration {
  include: BackupSource[];
  exclude?: BackupSource[];
  compression: CompressionConfig;
  validation: ValidationConfig;
  notifications: NotificationConfig;
}

export interface BackupSource {
  type: SourceType;
  path: string;
  recursive: boolean;
  filters?: SourceFilter[];
}

export enum SourceType {
  DATABASE = 'database',
  FILE_SYSTEM = 'file_system',
  API = 'api',
  CUSTOM = 'custom',
}

export interface SourceFilter {
  pattern: string;
  exclude: boolean;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'zip' | 'lz4' | 'xz';
  level: number; // 1-9
}

export interface ValidationConfig {
  enabled: boolean;
  checksum: boolean;
  integrity: boolean;
  testRestore: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  onSuccess: boolean;
  onFailure: boolean;
  recipients: string[];
  channels: NotificationChannel[];
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
}

export interface BackupMetadata {
  description?: string;
  tags: string[];
  owner: string;
  department?: string;
  environment: 'development' | 'staging' | 'production';
  compliance: ComplianceInfo;
}

export interface ComplianceInfo {
  dataResidency: string[];
  certifications: string[];
  retentionRequired: boolean;
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
}

export interface BackupExecution {
  id: string;
  backupId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  size?: number;
  fileCount?: number;
  errorCount?: number;
  checksum?: string;
  filePath?: string;
  error?: string;
  logs: ExecutionLog[];
  metadata: ExecutionMetadata;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ExecutionLog {
  timestamp: Date;
  level: LogLevel;
  message: string;
  details?: Record<string, any>;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface ExecutionMetadata {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;
}

export interface BackupRestore {
  id: string;
  backupId: string;
  status: RestoreStatus;
  target: RestoreTarget;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  restoredSize?: number;
  restoredFileCount?: number;
  errorCount?: number;
  error?: string;
  logs: ExecutionLog[];
  metadata: ExecutionMetadata;
}

export enum RestoreStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  VALIDATED = 'validated',
}

export interface RestoreTarget {
  type: SourceType;
  path: string;
  overwrite: boolean;
  preservePermissions: boolean;
  dryRun: boolean;
}

export interface BackupFilters {
  type?: BackupType;
  status?: BackupStatus;
  locationType?: LocationType;
  owner?: string;
  environment?: string;
  tags?: string[];
  search?: string;
}

export interface BackupCreateData {
  name: string;
  type: BackupType;
  location: BackupLocation;
  schedule?: BackupSchedule;
  configuration: BackupConfiguration;
  metadata?: Partial<BackupMetadata>;
}

export interface BackupUpdateData {
  name?: string;
  schedule?: BackupSchedule;
  configuration?: Partial<BackupConfiguration>;
  metadata?: Partial<BackupMetadata>;
}

export class BackupRepository extends BaseRepository<Backup> {
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

  // Get backups by type
  async getByType(type: BackupType): Promise<Backup[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getByType', type);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Backup[]>(cacheKey);
        if (cached) {
          this.logOperation('getByType', 'cache_hit', { type, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM backups WHERE type = $1 ORDER BY created_at DESC';
      const result = await this.dbConnection.query(query, [type]);
      const backups = result.rows.map(row => this.mapRowToBackup(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, backups, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getByType', 'success', { type, count: backups.length, executionTime });

      return backups;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getByType', 'error', { type, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get recent backups
  async getRecentBackups(limit: number = 10): Promise<Backup[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getRecentBackups', limit);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Backup[]>(cacheKey);
        if (cached) {
          this.logOperation('getRecentBackups', 'cache_hit', { limit, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM backups ORDER BY created_at DESC LIMIT $1';
      const result = await this.dbConnection.query(query, [limit]);
      const backups = result.rows.map(row => this.mapRowToBackup(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, backups, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getRecentBackups', 'success', { limit, count: backups.length, executionTime });

      return backups;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getRecentBackups', 'error', { limit, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Execute backup
  async executeBackup(backupId: string, userId?: string): Promise<BackupExecution> {
    const startTime = Date.now();

    try {
      const backup = await this.findById(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Create execution record
      const execution: Omit<BackupExecution, 'id' | 'startedAt' | 'logs'> = {
        backupId,
        status: ExecutionStatus.PENDING,
        metadata: {
          userId: userId || 'system',
        },
      };

      const executionQuery = `
        INSERT INTO backup_executions (
          backup_id, status, started_at, metadata
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
        RETURNING *
      `;

      const executionResult = await this.dbConnection.query(executionQuery, [
        execution.backupId,
        execution.status,
        JSON.stringify(execution.metadata),
      ]);

      const createdExecution = this.mapRowToExecution(executionResult.rows[0]);

      // Process backup execution asynchronously
      this.processBackupExecution(createdExecution.id, backup).catch(error => {
        this.logOperation('processBackupExecution', 'error', {
          executionId: createdExecution.id,
          error: (error as Error).message,
        });
      });

      const executionTime = Date.now() - startTime;
      this.logOperation('executeBackup', 'success', {
        backupId,
        executionId: createdExecution.id,
        executionTime,
      });

      return createdExecution;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('executeBackup', 'error', {
        backupId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get backup execution
  async getExecution(executionId: string): Promise<BackupExecution | null> {
    const startTime = Date.now();

    try {
      const query = 'SELECT * FROM backup_executions WHERE id = $1';
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

  // Get backup executions
  async getExecutions(backupId: string, options: {
    limit?: number;
    offset?: number;
    status?: ExecutionStatus;
    timeRange?: { start: Date; end: Date };
  } = {}): Promise<BackupExecution[]> {
    const startTime = Date.now();

    try {
      let query = 'SELECT * FROM backup_executions WHERE backup_id = $1';
      const params: any[] = [backupId];
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
        backupId,
        count: executions.length,
        executionTime,
      });

      return executions;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getExecutions', 'error', {
        backupId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Restore backup
  async restoreBackup(backupId: string, target: RestoreTarget, userId?: string): Promise<BackupRestore> {
    const startTime = Date.now();

    try {
      const backup = await this.findById(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Create restore record
      const restore: Omit<BackupRestore, 'id' | 'startedAt' | 'logs'> = {
        backupId,
        status: RestoreStatus.PENDING,
        target,
        metadata: {
          userId: userId || 'system',
        },
      };

      const restoreQuery = `
        INSERT INTO backup_restores (
          backup_id, status, target, started_at, metadata
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
        RETURNING *
      `;

      const restoreResult = await this.dbConnection.query(restoreQuery, [
        restore.backupId,
        restore.status,
        JSON.stringify(restore.target),
        JSON.stringify(restore.metadata),
      ]);

      const createdRestore = this.mapRowToRestore(restoreResult.rows[0]);

      // Process restore asynchronously
      this.processBackupRestore(createdRestore.id, backup, target).catch(error => {
        this.logOperation('processBackupRestore', 'error', {
          restoreId: createdRestore.id,
          error: (error as Error).message,
        });
      });

      const executionTime = Date.now() - startTime;
      this.logOperation('restoreBackup', 'success', {
        backupId,
        restoreId: createdRestore.id,
        executionTime,
      });

      return createdRestore;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('restoreBackup', 'error', {
        backupId,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get backup statistics
  async getBackupStats(): Promise<{
    totalBackups: number;
    activeBackups: number;
    backupsByType: Record<BackupType, number>;
    backupsByLocation: Record<LocationType, number>;
    totalSize: number;
    averageSize: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    scheduledBackups: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getBackupStats');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) {
          this.logOperation('getBackupStats', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Get basic statistics
      const basicQuery = `
        SELECT 
          COUNT(*) as total_backups,
          COUNT(CASE WHEN schedule->>'enabled' = 'true' THEN 1 END) as scheduled_backups,
          COALESCE(SUM(size), 0) as total_size,
          COALESCE(AVG(size), 0) as average_size
        FROM backups
      `;

      const basicResult = await this.dbConnection.query(basicQuery);
      const basicStats = basicResult.rows[0];

      // Get backups by type
      const typeQuery = 'SELECT type, COUNT(*) as count FROM backups GROUP BY type';
      const typeResult = await this.dbConnection.query(typeQuery);
      const backupsByType = typeResult.rows.reduce((acc: any, row: any) => {
        acc[row.type] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<BackupType, number>);

      // Get backups by location
      const locationQuery = 'SELECT location->>\'type\' as location_type, COUNT(*) as count FROM backups GROUP BY location->>\'type\'';
      const locationResult = await this.dbConnection.query(locationQuery);
      const backupsByLocation = locationResult.rows.reduce((acc: any, row: any) => {
        acc[row.location_type] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<LocationType, number>);

      // Get execution statistics
      const executionQuery = `
        SELECT 
          COUNT(CASE WHEN status = $1 THEN 1 END) as successful_executions,
          COUNT(CASE WHEN status = $2 THEN 1 END) as failed_executions,
          COALESCE(AVG(duration), 0) as average_execution_time
        FROM backup_executions
      `;

      const executionResult = await this.dbConnection.query(executionQuery, [
        ExecutionStatus.COMPLETED,
        ExecutionStatus.FAILED,
      ]);
      const executionStats = executionResult.rows[0];

      const stats = {
        totalBackups: parseInt(basicStats.total_backups, 10),
        activeBackups: parseInt(basicStats.total_backups, 10), // All backups are considered active
        backupsByType,
        backupsByLocation,
        totalSize: parseInt(basicStats.total_size, 10),
        averageSize: parseFloat(basicStats.average_size),
        successfulExecutions: parseInt(executionStats.successful_executions, 10),
        failedExecutions: parseInt(executionStats.failed_executions, 10),
        averageExecutionTime: parseFloat(executionStats.average_execution_time),
        scheduledBackups: parseInt(basicStats.scheduled_backups, 10),
      };

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, stats, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getBackupStats', 'success', { executionTime });

      return stats;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getBackupStats', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Helper methods
  private async processBackupExecution(executionId: string, backup: Backup): Promise<void> {
    const startTime = Date.now();

    try {
      // Update status to running
      await this.updateExecutionStatus(executionId, ExecutionStatus.RUNNING);

      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10000 + 5000));

      // Generate backup file (simulated)
      const size = Math.floor(Math.random() * 1000000000) + 100000000; // 100MB - 1GB
      const fileCount = Math.floor(Math.random() * 10000) + 1000;
      const checksum = this.generateChecksum();
      const filePath = `/backups/${backup.id}_${Date.now()}.backup`;

      // Update execution with results
      await this.updateExecutionResults(executionId, {
        status: ExecutionStatus.COMPLETED,
        size,
        fileCount,
        checksum,
        filePath,
        completedAt: new Date(),
        duration: Date.now() - startTime,
      });

      this.logOperation('processBackupExecution', 'success', {
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

      this.logOperation('processBackupExecution', 'error', {
        executionId,
        error: (error as Error).message,
      });
    }
  }

  private async processBackupRestore(restoreId: string, backup: Backup, target: RestoreTarget): Promise<void> {
    const startTime = Date.now();

    try {
      // Update status to running
      await this.updateRestoreStatus(restoreId, RestoreStatus.RUNNING);

      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, Math.random() * 8000 + 3000));

      // Generate restore results (simulated)
      const restoredSize = Math.floor(Math.random() * 1000000000) + 100000000;
      const restoredFileCount = Math.floor(Math.random() * 10000) + 1000;

      // Update restore with results
      await this.updateRestoreResults(restoreId, {
        status: target.dryRun ? RestoreStatus.VALIDATED : RestoreStatus.COMPLETED,
        restoredSize,
        restoredFileCount,
        completedAt: new Date(),
        duration: Date.now() - startTime,
      });

      this.logOperation('processBackupRestore', 'success', {
        restoreId,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      // Update restore with error
      await this.updateRestoreResults(restoreId, {
        status: RestoreStatus.FAILED,
        error: (error as Error).message,
        completedAt: new Date(),
        duration: Date.now() - startTime,
      });

      this.logOperation('processBackupRestore', 'error', {
        restoreId,
        error: (error as Error).message,
      });
    }
  }

  private async updateExecutionStatus(executionId: string, status: ExecutionStatus): Promise<void> {
    const query = `
      UPDATE backup_executions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await this.dbConnection.query(query, [status, executionId]);
  }

  private async updateExecutionResults(executionId: string, results: {
    status: ExecutionStatus;
    size?: number;
    fileCount?: number;
    checksum?: string;
    filePath?: string;
    error?: string;
    completedAt: Date;
    duration: number;
  }): Promise<void> {
    const query = `
      UPDATE backup_executions 
      SET status = $1, size = $2, file_count = $3, checksum = $4, file_path = $5,
          error = $6, completed_at = $7, duration = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
    `;

    await this.dbConnection.query(query, [
      results.status,
      results.size || null,
      results.fileCount || null,
      results.checksum || null,
      results.filePath || null,
      results.error || null,
      results.completedAt,
      results.duration,
      executionId,
    ]);
  }

  private async updateRestoreStatus(restoreId: string, status: RestoreStatus): Promise<void> {
    const query = `
      UPDATE backup_restores 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await this.dbConnection.query(query, [status, restoreId]);
  }

  private async updateRestoreResults(restoreId: string, results: {
    status: RestoreStatus;
    restoredSize?: number;
    restoredFileCount?: number;
    error?: string;
    completedAt: Date;
    duration: number;
  }): Promise<void> {
    const query = `
      UPDATE backup_restores 
      SET status = $1, restored_size = $2, restored_file_count = $3,
          error = $4, completed_at = $5, duration = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `;

    await this.dbConnection.query(query, [
      results.status,
      results.restoredSize || null,
      results.restoredFileCount || null,
      results.error || null,
      results.completedAt,
      results.duration,
      restoreId,
    ]);
  }

  private generateChecksum(): string {
    return Math.random().toString(36).substr(2, 32);
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<Backup | null> {
    const query = 'SELECT * FROM backups WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBackup(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: Backup[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM backups WHERE 1=1';
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

      if (options.filters.search) {
        query += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
        params.push(`%${options.filters.search}%`);
      }
    }

    // Add sorting
    if (options.sortBy) {
      query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'DESC'}`;
    } else {
      query += ' ORDER BY created_at DESC';
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
    const backups = result.rows.map(row => this.mapRowToBackup(row));

    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM backups WHERE 1=1';
    const countResult = await this.dbConnection.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: backups,
      totalCount,
      hasMore: options.offset ? options.offset + backups.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<Backup>): Promise<Backup> {
    const backupData = entity as BackupCreateData;

    const query = `
      INSERT INTO backups (
        name, type, status, size, location, schedule, configuration,
        metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      backupData.name,
      backupData.type,
      BackupStatus.PENDING,
      0,
      JSON.stringify(backupData.location),
      JSON.stringify(backupData.schedule || {}),
      JSON.stringify(backupData.configuration),
      JSON.stringify({
        tags: [],
        owner: 'system',
        environment: 'production',
        compliance: {
          dataResidency: [],
          certifications: [],
          retentionRequired: false,
          gdprCompliant: false,
          hipaaCompliant: false,
        },
        ...backupData.metadata,
      }),
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToBackup(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<Backup>): Promise<Backup | null> {
    const updateData = updates as BackupUpdateData;

    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.name !== undefined) {
      setClause.push(`name = $${paramIndex}`);
      params.push(updateData.name);
      paramIndex++;
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `
      UPDATE backups 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBackup(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'DELETE FROM backups WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM backups WHERE 1=1';
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
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM backups WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<Backup>): Promise<void> {
    const backupData = entity as BackupCreateData;

    if (!backupData.name) {
      throw new Error('Backup name is required');
    }

    if (!backupData.type) {
      throw new Error('Backup type is required');
    }

    if (!backupData.location) {
      throw new Error('Backup location is required');
    }

    if (!backupData.configuration) {
      throw new Error('Backup configuration is required');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getBackupStats();
  }

  // Helper methods for mapping
  private mapRowToBackup(row: any): Backup {
    return {
      id: row.id,
      name: row.name,
      type: row.type as BackupType,
      status: row.status as BackupStatus,
      size: parseInt(row.size, 10),
      location: row.location ? JSON.parse(row.location) : {},
      schedule: row.schedule ? JSON.parse(row.schedule) : undefined,
      configuration: row.configuration ? JSON.parse(row.configuration) : {},
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToExecution(row: any): BackupExecution {
    return {
      id: row.id,
      backupId: row.backup_id,
      status: row.status as ExecutionStatus,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      duration: row.duration ? parseFloat(row.duration) : undefined,
      size: row.size ? parseInt(row.size) : undefined,
      fileCount: row.file_count ? parseInt(row.file_count) : undefined,
      errorCount: row.error_count ? parseInt(row.error_count) : undefined,
      checksum: row.checksum,
      filePath: row.file_path,
      error: row.error,
      logs: row.logs ? JSON.parse(row.logs) : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }

  private mapRowToRestore(row: any): BackupRestore {
    return {
      id: row.id,
      backupId: row.backup_id,
      status: row.status as RestoreStatus,
      target: row.target ? JSON.parse(row.target) : {},
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      duration: row.duration ? parseFloat(row.duration) : undefined,
      restoredSize: row.restored_size ? parseInt(row.restored_size) : undefined,
      restoredFileCount: row.restored_file_count ? parseInt(row.restored_file_count) : undefined,
      errorCount: row.error_count ? parseInt(row.error_count) : undefined,
      error: row.error,
      logs: row.logs ? JSON.parse(row.logs) : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }
}
