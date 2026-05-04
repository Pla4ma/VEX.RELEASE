/**
 * Cache Repository
 * 
 * Repository for cache management including cache operations,
 * invalidation strategies, performance monitoring, and cache analytics.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface CacheEntry {
  key: string;
  value: any;
  ttl?: number;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  lastAccessedAt: Date;
  size: number;
  tags: string[];
  metadata: CacheMetadata;
}

export interface CacheMetadata {
  source: string;
  version?: string;
  priority: CachePriority;
  compression: boolean;
  encrypted: boolean;
  dependencies: string[];
}

export enum CachePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionRate: number;
  averageAccessTime: number;
  entriesByPriority: Record<CachePriority, number>;
  oldestEntry: Date;
  newestEntry: Date;
  mostAccessed: CacheEntry;
  leastAccessed: CacheEntry;
}

export interface CacheOperation {
  id: string;
  operation: CacheOperationType;
  key: string;
  status: CacheOperationStatus;
  duration: number;
  error?: string;
  timestamp: Date;
  metadata: CacheOperationMetadata;
}

export enum CacheOperationType {
  GET = 'get',
  SET = 'set',
  DELETE = 'delete',
  CLEAR = 'clear',
  INVALIDATE = 'invalidate',
  COMPRESS = 'compress',
  DECOMPRESS = 'decompress',
}

export enum CacheOperationStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  TIMEOUT = 'timeout',
  SKIPPED = 'skipped',
}

export interface CacheOperationMetadata {
  source: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  batchSize?: number;
}

export interface CacheInvalidationRule {
  id: string;
  name: string;
  pattern: string;
  type: InvalidationType;
  schedule?: InvalidationSchedule;
  isActive: boolean;
  priority: number;
  conditions: InvalidationCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export enum InvalidationType {
  PATTERN = 'pattern',
  TAG = 'tag',
  TIME_BASED = 'time_based',
  DEPENDENCY = 'dependency',
  CUSTOM = 'custom',
}

export interface InvalidationSchedule {
  frequency: 'minute' | 'hour' | 'day' | 'week' | 'month';
  timezone: string;
  time: string; // HH:mm format
}

export interface InvalidationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface CachePerformanceMetrics {
  timestamp: Date;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkIO: number;
  errorRate: number;
}

export interface CacheConfiguration {
  maxSize: number;
  defaultTTL: number;
  compressionThreshold: number;
  encryptionEnabled: boolean;
  monitoringEnabled: boolean;
  evictionPolicy: EvictionPolicy;
  replicationEnabled: boolean;
  backupEnabled: boolean;
}

export enum EvictionPolicy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  RANDOM = 'random',
  TTL_BASED = 'ttl_based',
}

export class CacheRepository extends BaseRepository<CacheEntry> {
  constructor(
    dbConnection: DatabaseConnection,
    cacheManager: CacheManager,
    logger: Logger
  ) {
    super(dbConnection, cacheManager, logger, {
      useCache: false, // Don't cache cache operations
      enableLogging: true,
      retryAttempts: 3,
      timeout: 30000,
    });
  }

  // Get cache entry
  async get(key: string): Promise<CacheEntry | null> {
    const startTime = Date.now();

    try {
      // Try to get from cache manager first
      const value = await this.cacheManager.get(key);
      
      if (value !== null) {
        // Update access statistics
        await this.updateAccessStats(key);
        
        const executionTime = Date.now() - startTime;
        this.logOperation('get', 'success', { key, hit: true, executionTime });
        
        // Log operation for analytics
        await this.logCacheOperation({
          operation: CacheOperationType.GET,
          key,
          status: CacheOperationStatus.SUCCESS,
          duration: executionTime,
          timestamp: new Date(),
          metadata: { source: 'cache_repository' },
        });

        return value as CacheEntry;
      }

      // Check database for cache entry
      const query = 'SELECT * FROM cache_entries WHERE key = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)';
      const result = await this.dbConnection.query(query, [key]);
      
      if (result.rows.length === 0) {
        const executionTime = Date.now() - startTime;
        this.logOperation('get', 'success', { key, hit: false, executionTime });
        
        // Log operation for analytics
        await this.logCacheOperation({
          operation: CacheOperationType.GET,
          key,
          status: CacheOperationStatus.SUCCESS,
          duration: executionTime,
          timestamp: new Date(),
          metadata: { source: 'cache_repository' },
        });

        return null;
      }

      const cacheEntry = this.mapRowToCacheEntry(result.rows[0]);
      
      // Restore to cache manager
      await this.cacheManager.set(key, cacheEntry, this.calculateRemainingTTL(cacheEntry));
      
      const executionTime = Date.now() - startTime;
      this.logOperation('get', 'success', { key, hit: false, restored: true, executionTime });

      return cacheEntry;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('get', 'error', { key, error: (error as Error).message, executionTime });
      
      // Log operation for analytics
      await this.logCacheOperation({
        operation: CacheOperationType.GET,
        key,
        status: CacheOperationStatus.FAILURE,
        duration: executionTime,
        timestamp: new Date(),
        metadata: { source: 'cache_repository' },
        error: (error as Error).message,
      });

      throw error;
    }
  }

  // Set cache entry
  async set(key: string, value: any, ttl?: number, options: {
    tags?: string[];
    priority?: CachePriority;
    metadata?: Partial<CacheMetadata>;
  } = {}): Promise<void> {
    const startTime = Date.now();

    try {
      const now = new Date();
      const expiresAt = ttl ? new Date(now.getTime() + ttl) : null;
      const serializedValue = JSON.stringify(value);
      const size = Buffer.byteLength(serializedValue, 'utf8');

      const cacheEntry: CacheEntry = {
        key,
        value,
        ttl,
        createdAt: now,
        expiresAt,
        accessCount: 0,
        lastAccessedAt: now,
        size,
        tags: options.tags || [],
        metadata: {
          source: 'cache_repository',
          priority: options.priority || CachePriority.NORMAL,
          compression: size > (options.metadata?.compressionThreshold || 1024),
          encrypted: options.metadata?.encrypted || false,
          dependencies: options.metadata?.dependencies || [],
          ...options.metadata,
        },
      };

      // Store in cache manager
      await this.cacheManager.set(key, cacheEntry, ttl);

      // Store in database for persistence
      const query = `
        INSERT INTO cache_entries (
          key, value, ttl, created_at, expires_at, access_count, 
          last_accessed_at, size, tags, metadata, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          ttl = EXCLUDED.ttl,
          expires_at = EXCLUDED.expires_at,
          size = EXCLUDED.size,
          tags = EXCLUDED.tags,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
      `;

      await this.dbConnection.query(query, [
        key,
        serializedValue,
        ttl,
        now,
        expiresAt,
        0,
        now,
        size,
        JSON.stringify(options.tags || []),
        JSON.stringify(cacheEntry.metadata),
      ]);

      const executionTime = Date.now() - startTime;
      this.logOperation('set', 'success', { key, size, ttl, executionTime });

      // Log operation for analytics
      await this.logCacheOperation({
        operation: CacheOperationType.SET,
        key,
        status: CacheOperationStatus.SUCCESS,
        duration: executionTime,
        timestamp: new Date(),
        metadata: { source: 'cache_repository', batchSize: 1 },
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('set', 'error', { key, error: (error as Error).message, executionTime });
      
      // Log operation for analytics
      await this.logCacheOperation({
        operation: CacheOperationType.SET,
        key,
        status: CacheOperationStatus.FAILURE,
        duration: executionTime,
        timestamp: new Date(),
        metadata: { source: 'cache_repository' },
        error: (error as Error).message,
      });

      throw error;
    }
  }

  // Delete cache entry
  async delete(key: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      // Delete from cache manager
      await this.cacheManager.delete(key);

      // Delete from database
      const query = 'DELETE FROM cache_entries WHERE key = $1';
      const result = await this.dbConnection.query(query, [key]);
      const deleted = result.rowCount > 0;

      const executionTime = Date.now() - startTime;
      this.logOperation('delete', 'success', { key, deleted, executionTime });

      // Log operation for analytics
      await this.logCacheOperation({
        operation: CacheOperationType.DELETE,
        key,
        status: CacheOperationStatus.SUCCESS,
        duration: executionTime,
        timestamp: new Date(),
        metadata: { source: 'cache_repository' },
      });

      return deleted;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('delete', 'error', { key, error: (error as Error).message, executionTime });
      
      // Log operation for analytics
      await this.logCacheOperation({
        operation: CacheOperationType.DELETE,
        key,
        status: CacheOperationStatus.FAILURE,
        duration: executionTime,
        timestamp: new Date(),
        metadata: { source: 'cache_repository' },
        error: (error as Error).message,
      });

      throw error;
    }
  }

  // Clear cache
  async clear(pattern?: string): Promise<number> {
    const startTime = Date.now();

    try {
      let deletedCount = 0;

      if (pattern) {
        // Clear entries matching pattern
        const keys = await this.cacheManager.getKeys(pattern);
        
        for (const key of keys) {
          await this.cacheManager.delete(key);
        }

        const query = 'DELETE FROM cache_entries WHERE key LIKE $1';
        const result = await this.dbConnection.query(query, [pattern]);
        deletedCount = result.rowCount;
      } else {
        // Clear all entries
        await this.cacheManager.clear();
        
        const query = 'DELETE FROM cache_entries';
        const result = await this.dbConnection.query(query);
        deletedCount = result.rowCount;
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('clear', 'success', { pattern, deletedCount, executionTime });

      // Log operation for analytics
      await this.logCacheOperation({
        operation: CacheOperationType.CLEAR,
        key: pattern || 'all',
        status: CacheOperationStatus.SUCCESS,
        duration: executionTime,
        timestamp: new Date(),
        metadata: { source: 'cache_repository', batchSize: deletedCount },
      });

      return deletedCount;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('clear', 'error', { pattern, error: (error as Error).message, executionTime });
      
      // Log operation for analytics
      await this.logCacheOperation({
        operation: CacheOperationType.CLEAR,
        key: pattern || 'all',
        status: CacheOperationStatus.FAILURE,
        duration: executionTime,
        timestamp: new Date(),
        metadata: { source: 'cache_repository' },
        error: (error as Error).message,
      });

      throw error;
    }
  }

  // Invalidate by tags
  async invalidateByTags(tags: string[]): Promise<number> {
    const startTime = Date.now();

    try {
      // Get entries with specified tags
      const query = `
        SELECT key FROM cache_entries 
        WHERE tags && $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      `;
      const result = await this.dbConnection.query(query, [tags]);
      
      const keys = result.rows.map(row => row.key);
      
      // Delete from cache manager
      for (const key of keys) {
        await this.cacheManager.delete(key);
      }

      // Delete from database
      const deleteQuery = 'DELETE FROM cache_entries WHERE tags && $1';
      const deleteResult = await this.dbConnection.query(deleteQuery, [tags]);
      const deletedCount = deleteResult.rowCount;

      const executionTime = Date.now() - startTime;
      this.logOperation('invalidateByTags', 'success', { tags, deletedCount, executionTime });

      return deletedCount;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('invalidateByTags', 'error', { tags, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<CacheStats> {
    const startTime = Date.now();
    const cacheKey = 'cache_stats';

    try {
      // Try to get stats from cache first
      const cachedStats = await this.cacheManager.get(cacheKey);
      if (cachedStats) {
        return cachedStats as CacheStats;
      }

      // Calculate stats from database
      const query = `
        SELECT 
          COUNT(*) as total_entries,
          COALESCE(SUM(size), 0) as total_size,
          COALESCE(AVG(access_count), 0) as avg_access_count,
          MIN(created_at) as oldest_entry,
          MAX(created_at) as newest_entry
        FROM cache_entries
        WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP
      `;

      const result = await this.dbConnection.query(query);
      const basicStats = result.rows[0];

      // Get entries by priority
      const priorityQuery = `
        SELECT metadata->>'priority' as priority, COUNT(*) as count
        FROM cache_entries
        WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP
        GROUP BY metadata->>'priority'
      `;
      const priorityResult = await this.dbConnection.query(priorityQuery);
      const entriesByPriority = priorityResult.rows.reduce((acc, row) => {
        acc[row.priority] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<CachePriority, number>);

      // Get most and least accessed entries
      const mostAccessedQuery = `
        SELECT * FROM cache_entries
        WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP
        ORDER BY access_count DESC, last_accessed_at DESC
        LIMIT 1
      `;
      const mostAccessedResult = await this.dbConnection.query(mostAccessedQuery);
      const mostAccessed = mostAccessedResult.rows.length > 0 ? this.mapRowToCacheEntry(mostAccessedResult.rows[0]) : null;

      const leastAccessedQuery = `
        SELECT * FROM cache_entries
        WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP
        ORDER BY access_count ASC, last_accessed_at ASC
        LIMIT 1
      `;
      const leastAccessedResult = await this.dbConnection.query(leastAccessedQuery);
      const leastAccessed = leastAccessedResult.rows.length > 0 ? this.mapRowToCacheEntry(leastAccessedResult.rows[0]) : null;

      // Get operation stats for hit/miss rates
      const operationQuery = `
        SELECT 
          COUNT(CASE WHEN operation = $1 AND status = $2 THEN 1 END) as hits,
          COUNT(CASE WHEN operation = $1 AND status = $3 THEN 1 END) as misses,
          COUNT(CASE WHEN operation = $4 AND status = $2 THEN 1 END) as evictions
        FROM cache_operations
        WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
      `;
      const operationResult = await this.dbConnection.query(operationQuery, [
        CacheOperationType.GET,
        CacheOperationStatus.SUCCESS,
        CacheOperationStatus.FAILURE,
        CacheOperationType.INVALIDATE,
      ]);

      const operationStats = operationResult.rows[0];
      const totalOperations = parseInt(operationStats.hits, 10) + parseInt(operationStats.misses, 10);
      const hitRate = totalOperations > 0 ? (parseInt(operationStats.hits, 10) / totalOperations) * 100 : 0;
      const missRate = totalOperations > 0 ? (parseInt(operationStats.misses, 10) / totalOperations) * 100 : 0;
      const evictionRate = totalOperations > 0 ? (parseInt(operationStats.evictions, 10) / totalOperations) * 100 : 0;

      const stats: CacheStats = {
        totalEntries: parseInt(basicStats.total_entries, 10),
        totalSize: parseInt(basicStats.total_size, 10),
        hitRate,
        missRate,
        evictionRate,
        averageAccessTime: parseFloat(basicStats.avg_access_count),
        entriesByPriority,
        oldestEntry: basicStats.oldest_entry ? new Date(basicStats.oldest_entry) : new Date(),
        newestEntry: basicStats.newest_entry ? new Date(basicStats.newest_entry) : new Date(),
        mostAccessed: mostAccessed || this.createEmptyCacheEntry(),
        leastAccessed: leastAccessed || this.createEmptyCacheEntry(),
      };

      // Cache stats for 5 minutes
      await this.cacheManager.set(cacheKey, stats, 300000);

      const executionTime = Date.now() - startTime;
      this.logOperation('getCacheStats', 'success', { executionTime });

      return stats;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getCacheStats', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(timeRange: { start: Date; end: Date }): Promise<CachePerformanceMetrics[]> {
    const startTime = Date.now();

    try {
      const query = `
        SELECT timestamp, hit_rate, miss_rate, average_response_time, 
               memory_usage, cpu_usage, network_io, error_rate
        FROM cache_performance_metrics
        WHERE timestamp >= $1 AND timestamp <= $2
        ORDER BY timestamp ASC
      `;

      const result = await this.dbConnection.query(query, [timeRange.start, timeRange.end]);
      const metrics = result.rows.map(row => ({
        timestamp: new Date(row.timestamp),
        hitRate: parseFloat(row.hit_rate),
        missRate: parseFloat(row.miss_rate),
        averageResponseTime: parseFloat(row.average_response_time),
        memoryUsage: parseFloat(row.memory_usage),
        cpuUsage: parseFloat(row.cpu_usage),
        networkIO: parseFloat(row.network_io),
        errorRate: parseFloat(row.error_rate),
      }));

      const executionTime = Date.now() - startTime;
      this.logOperation('getPerformanceMetrics', 'success', { count: metrics.length, executionTime });

      return metrics;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getPerformanceMetrics', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<CacheEntry | null> {
    const query = 'SELECT * FROM cache_entries WHERE key = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)';
    const result = await this.dbConnection.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToCacheEntry(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: CacheEntry[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM cache_entries WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP';
    const params: any[] = [];

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
    const entries = result.rows.map(row => this.mapRowToCacheEntry(row));

    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM cache_entries WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP';
    const countResult = await this.dbConnection.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: entries,
      totalCount,
      hasMore: options.offset ? options.offset + entries.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<CacheEntry>): Promise<CacheEntry> {
    const cacheEntry = entity as CacheEntry;
    
    const query = `
      INSERT INTO cache_entries (
        key, value, ttl, created_at, expires_at, access_count, 
        last_accessed_at, size, tags, metadata, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const params = [
      cacheEntry.key,
      JSON.stringify(cacheEntry.value),
      cacheEntry.ttl,
      cacheEntry.createdAt,
      cacheEntry.expiresAt,
      cacheEntry.accessCount,
      cacheEntry.lastAccessedAt,
      cacheEntry.size,
      JSON.stringify(cacheEntry.tags),
      JSON.stringify(cacheEntry.metadata),
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToCacheEntry(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<CacheEntry>): Promise<CacheEntry | null> {
    const updateData = updates;
    
    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.value !== undefined) {
      setClause.push(`value = $${paramIndex}`);
      params.push(JSON.stringify(updateData.value));
      paramIndex++;
    }

    if (updateData.accessCount !== undefined) {
      setClause.push(`access_count = $${paramIndex}`);
      params.push(updateData.accessCount);
      paramIndex++;
    }

    if (updateData.lastAccessedAt !== undefined) {
      setClause.push(`last_accessed_at = $${paramIndex}`);
      params.push(updateData.lastAccessedAt);
      paramIndex++;
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE cache_entries 
      SET ${setClause.join(', ')}
      WHERE key = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToCacheEntry(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'DELETE FROM cache_entries WHERE key = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM cache_entries WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP';
    const params: any[] = [];

    if (filters) {
      if (filters.tags && filters.tags.length > 0) {
        query += ` AND tags && $${params.length + 1}`;
        params.push(filters.tags);
      }
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM cache_entries WHERE key = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<CacheEntry>): Promise<void> {
    const cacheEntry = entity as CacheEntry;

    if (!cacheEntry.key) {
      throw new Error('Cache key is required');
    }

    if (cacheEntry.value === undefined) {
      throw new Error('Cache value is required');
    }

    if (cacheEntry.ttl && cacheEntry.ttl < 0) {
      throw new Error('TTL must be positive');
    }

    if (cacheEntry.size && cacheEntry.size < 0) {
      throw new Error('Size must be positive');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getCacheStats();
  }

  // Helper methods
  private async updateAccessStats(key: string): Promise<void> {
    const query = `
      UPDATE cache_entries 
      SET access_count = access_count + 1, 
          last_accessed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE key = $1
    `;
    await this.dbConnection.query(query, [key]);
  }

  private async logCacheOperation(operation: Partial<CacheOperation>): Promise<void> {
    const query = `
      INSERT INTO cache_operations (
        operation, key, status, duration, error, timestamp, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await this.dbConnection.query(query, [
      operation.operation,
      operation.key,
      operation.status,
      operation.duration,
      operation.error,
      operation.timestamp,
      JSON.stringify(operation.metadata),
    ]);
  }

  private mapRowToCacheEntry(row: any): CacheEntry {
    return {
      key: row.key,
      value: row.value ? JSON.parse(row.value) : null,
      ttl: row.ttl,
      createdAt: new Date(row.created_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      accessCount: parseInt(row.access_count, 10),
      lastAccessedAt: new Date(row.last_accessed_at),
      size: parseInt(row.size, 10),
      tags: row.tags ? JSON.parse(row.tags) : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    };
  }

  private calculateRemainingTTL(entry: CacheEntry): number | undefined {
    if (!entry.expiresAt) {
      return entry.ttl;
    }

    const now = new Date();
    const remaining = entry.expiresAt.getTime() - now.getTime();
    return remaining > 0 ? remaining : undefined;
  }

  private createEmptyCacheEntry(): CacheEntry {
    return {
      key: '',
      value: null,
      createdAt: new Date(),
      accessCount: 0,
      lastAccessedAt: new Date(),
      size: 0,
      tags: [],
      metadata: {
        source: 'cache_repository',
        priority: CachePriority.NORMAL,
        compression: false,
        encrypted: false,
        dependencies: [],
      },
    };
  }
}
