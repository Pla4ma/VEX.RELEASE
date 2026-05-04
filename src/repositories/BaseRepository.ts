/**
 * Base Repository
 * 
 * Abstract base class for all repositories providing common CRUD operations,
 * error handling, caching, and data access patterns.
 */

import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface RepositoryOptions {
  useCache?: boolean;
  cacheTTL?: number;
  enableLogging?: boolean;
  retryAttempts?: number;
  timeout?: number;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  include?: string[];
  exclude?: string[];
}

export interface RepositoryResult<T> {
  data?: T;
  error?: Error;
  metadata?: {
    totalCount?: number;
    hasMore?: boolean;
    cacheHit?: boolean;
    executionTime?: number;
  };
}

export abstract class BaseRepository<T> {
  protected cacheManager: CacheManager;
  protected logger: Logger;
  protected dbConnection: DatabaseConnection;
  protected options: RepositoryOptions;

  constructor(
    dbConnection: DatabaseConnection,
    cacheManager: CacheManager,
    logger: Logger,
    options: RepositoryOptions = {}
  ) {
    this.dbConnection = dbConnection;
    this.cacheManager = cacheManager;
    this.logger = logger;
    this.options = {
      useCache: true,
      cacheTTL: 300000, // 5 minutes
      enableLogging: true,
      retryAttempts: 3,
      timeout: 30000,
      ...options,
    };
  }

  /**
   * Get entity by ID
   */
  async findById(id: string, queryOptions?: QueryOptions): Promise<RepositoryResult<T>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findById', id, queryOptions);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<T>(cacheKey);
        if (cached) {
          this.logOperation('findById', 'cache_hit', { id, executionTime: Date.now() - startTime });
          return {
            data: cached,
            metadata: { cacheHit: true, executionTime: Date.now() - startTime },
          };
        }
      }

      // Fetch from database
      const data = await this.findInDatabase(id, queryOptions);
      
      // Cache the result
      if (this.options.useCache && data) {
        await this.cacheManager.set(cacheKey, data, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findById', 'success', { id, executionTime });

      return {
        data,
        metadata: { cacheHit: false, executionTime },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findById', 'error', { id, error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }

  /**
   * Find multiple entities
   */
  async findMany(queryOptions: QueryOptions = {}): Promise<RepositoryResult<T[]>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findMany', '', queryOptions);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<T[]>(cacheKey);
        if (cached) {
          this.logOperation('findMany', 'cache_hit', { executionTime: Date.now() - startTime });
          return {
            data: cached,
            metadata: { cacheHit: true, executionTime: Date.now() - startTime },
          };
        }
      }

      // Fetch from database
      const result = await this.findManyInDatabase(queryOptions);
      
      // Cache the result
      if (this.options.useCache && result.data) {
        await this.cacheManager.set(cacheKey, result.data, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findMany', 'success', { count: result.data?.length, executionTime });

      return {
        data: result.data,
        metadata: {
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          cacheHit: false,
          executionTime,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findMany', 'error', { error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }

  /**
   * Create new entity
   */
  async create(entity: Partial<T>): Promise<RepositoryResult<T>> {
    const startTime = Date.now();

    try {
      // Validate entity
      await this.validateEntity(entity);

      // Create in database
      const data = await this.createInDatabase(entity);
      
      // Clear relevant cache
      if (this.options.useCache) {
        await this.clearCachePattern('findMany');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('create', 'success', { id: (data as any).id, executionTime });

      return {
        data,
        metadata: { executionTime },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('create', 'error', { error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }

  /**
   * Update existing entity
   */
  async update(id: string, updates: Partial<T>): Promise<RepositoryResult<T>> {
    const startTime = Date.now();

    try {
      // Validate updates
      await this.validateEntity(updates);

      // Update in database
      const data = await this.updateInDatabase(id, updates);
      
      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', id));
        await this.clearCachePattern('findMany');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('update', 'success', { id, executionTime });

      return {
        data,
        metadata: { executionTime },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('update', 'error', { id, error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<RepositoryResult<boolean>> {
    const startTime = Date.now();

    try {
      // Delete from database
      const success = await this.deleteInDatabase(id);
      
      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', id));
        await this.clearCachePattern('findMany');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('delete', 'success', { id, executionTime });

      return {
        data: success,
        metadata: { executionTime },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('delete', 'error', { id, error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }

  /**
   * Count entities
   */
  async count(filters?: Record<string, any>): Promise<RepositoryResult<number>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('count', '', { filters });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<number>(cacheKey);
        if (cached !== null) {
          this.logOperation('count', 'cache_hit', { executionTime: Date.now() - startTime });
          return {
            data: cached,
            metadata: { cacheHit: true, executionTime: Date.now() - startTime },
          };
        }
      }

      // Count in database
      const count = await this.countInDatabase(filters);
      
      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, count, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('count', 'success', { count, executionTime });

      return {
        data: count,
        metadata: { cacheHit: false, executionTime },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('count', 'error', { error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<RepositoryResult<boolean>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('exists', id);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<boolean>(cacheKey);
        if (cached !== null) {
          this.logOperation('exists', 'cache_hit', { id, executionTime: Date.now() - startTime });
          return {
            data: cached,
            metadata: { cacheHit: true, executionTime: Date.now() - startTime },
          };
        }
      }

      // Check in database
      const exists = await this.existsInDatabase(id);
      
      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, exists, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('exists', 'success', { id, exists, executionTime });

      return {
        data: exists,
        metadata: { cacheHit: false, executionTime },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('exists', 'error', { id, error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }

  /**
   * Execute custom query
   */
  async executeQuery<R>(query: string, params?: any[]): Promise<RepositoryResult<R>> {
    const startTime = Date.now();

    try {
      const result = await this.dbConnection.query(query, params);
      
      const executionTime = Date.now() - startTime;
      this.logOperation('executeQuery', 'success', { query, executionTime });

      return {
        data: result,
        metadata: { executionTime },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('executeQuery', 'error', { query, error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }

  // Abstract methods to be implemented by concrete repositories
  protected abstract findInDatabase(id: string, options?: QueryOptions): Promise<T | null>;
  protected abstract findManyInDatabase(options: QueryOptions): Promise<{ data: T[]; totalCount: number; hasMore: boolean }>;
  protected abstract createInDatabase(entity: Partial<T>): Promise<T>;
  protected abstract updateInDatabase(id: string, updates: Partial<T>): Promise<T | null>;
  protected abstract deleteInDatabase(id: string): Promise<boolean>;
  protected abstract countInDatabase(filters?: Record<string, any>): Promise<number>;
  protected abstract existsInDatabase(id: string): Promise<boolean>;
  protected abstract validateEntity(entity: Partial<T>): Promise<void>;

  // Helper methods
  protected generateCacheKey(operation: string, id: string = '', options?: any): string {
    const optionsStr = options ? JSON.stringify(options) : '';
    return `${this.constructor.name}:${operation}:${id}:${optionsStr}`;
  }

  protected async clearCachePattern(pattern: string): Promise<void> {
    if (!this.cacheManager.clearPattern) {
      return;
    }
    
    try {
      await this.cacheManager.clearPattern(`${this.constructor.name}:${pattern}:*`);
    } catch (error) {
      this.logger.warn('Failed to clear cache pattern', { pattern, error: error.message });
    }
  }

  protected logOperation(operation: string, status: string, metadata: any): void {
    if (!this.options.enableLogging) {
      return;
    }

    const logData = {
      repository: this.constructor.name,
      operation,
      status,
      ...metadata,
    };

    switch (status) {
      case 'success':
        this.logger.info('Repository operation completed', logData);
        break;
      case 'error':
        this.logger.error('Repository operation failed', logData);
        break;
      case 'cache_hit':
        this.logger.debug('Repository cache hit', logData);
        break;
      default:
        this.logger.debug('Repository operation', logData);
    }
  }

  protected async executeWithRetry<R>(
    operation: () => Promise<R>,
    operationName: string
  ): Promise<R> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.options.retryAttempts!; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.options.retryAttempts) {
          this.logOperation(operationName, 'error', { 
            error: lastError.message, 
            attempts: attempt,
            finalAttempt: true 
          });
          throw lastError;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        this.logOperation(operationName, 'retry', { 
          error: lastError.message, 
          attempt,
          delay 
        });
      }
    }

    throw lastError!;
  }

  protected async executeWithTimeout<R>(
    operation: () => Promise<R>,
    timeoutMs: number = this.options.timeout!
  ): Promise<R> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      ),
    ]);
  }

  /**
   * Get repository statistics
   */
  async getStats(): Promise<RepositoryResult<any>> {
    try {
      const stats = await this.getRepositoryStats();
      return { data: stats };
    } catch (error) {
      return { error: error as Error };
    }
  }

  protected abstract getRepositoryStats(): Promise<any>;

  /**
   * Health check for repository
   */
  async healthCheck(): Promise<RepositoryResult<boolean>> {
    const startTime = Date.now();

    try {
      // Test database connection
      await this.dbConnection.ping();
      
      // Test cache connection
      if (this.options.useCache) {
        await this.cacheManager.ping();
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('healthCheck', 'success', { executionTime });

      return {
        data: true,
        metadata: { executionTime },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('healthCheck', 'error', { error: error.message, executionTime });
      
      return {
        error: error as Error,
        metadata: { executionTime },
      };
    }
  }
}
