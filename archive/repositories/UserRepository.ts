/**
 * User Repository
 *
 * Repository for user data management including CRUD operations,
 * authentication, profile management, and user relationships.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
}

export interface UserCreateData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UserUpdateData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
  isActive?: boolean;
}

export interface UserFilters {
  isActive?: boolean;
  isVerified?: boolean;
  roles?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

export class UserRepository extends BaseRepository<User> {
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

  // Find by email
  async findByEmail(email: string): Promise<User | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findByEmail', email);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<User>(cacheKey);
        if (cached) {
          this.logOperation('findByEmail', 'cache_hit', { email, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Query database
      const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
      const result = await this.dbConnection.query(query, [email]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = this.mapRowToUser(result.rows[0]);

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, user, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findByEmail', 'success', { email, executionTime });

      return user;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findByEmail', 'error', { email, error: error.message, executionTime });
      throw error;
    }
  }

  // Find by username
  async findByUsername(username: string): Promise<User | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findByUsername', username);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<User>(cacheKey);
        if (cached) {
          this.logOperation('findByUsername', 'cache_hit', { username, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Query database
      const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true';
      const result = await this.dbConnection.query(query, [username]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = this.mapRowToUser(result.rows[0]);

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, user, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findByUsername', 'success', { username, executionTime });

      return user;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findByUsername', 'error', { username, error: error.message, executionTime });
      throw error;
    }
  }

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1';
      await this.dbConnection.query(query, [userId]);

      // Clear cache for this user
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', userId));
        await this.clearCachePattern('findByEmail');
        await this.clearCachePattern('findByUsername');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('updateLastLogin', 'success', { userId, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updateLastLogin', 'error', { userId, error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Change password (separate from user update for security)
  async changePassword(userId: string, hashedPassword: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
      await this.dbConnection.query(query, [hashedPassword, userId]);

      // Clear cache for this user
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', userId));
        await this.clearCachePattern('findByEmail');
        await this.clearCachePattern('findByUsername');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('changePassword', 'success', { userId, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('changePassword', 'error', { userId, error: error.message, executionTime });
      throw error;
    }
  }

  // Verify user
  async verifyUser(userId: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = 'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
      await this.dbConnection.query(query, [userId]);

      // Clear cache for this user
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', userId));
        await this.clearCachePattern('findByEmail');
        await this.clearCachePattern('findByUsername');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('verifyUser', 'success', { userId, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('verifyUser', 'error', { userId, error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(userId: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
      await this.dbConnection.query(query, [userId]);

      // Clear cache for this user
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', userId));
        await this.clearCachePattern('findByEmail');
        await this.clearCachePattern('findByUsername');
        await this.clearCachePattern('findMany');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('deactivateUser', 'success', { userId, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('deactivateUser', 'error', { userId, error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Add role to user
  async addRole(userId: string, role: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Check if role already exists
      const checkQuery = 'SELECT 1 FROM user_roles WHERE user_id = $1 AND role = $2';
      const checkResult = await this.dbConnection.query(checkQuery, [userId, role]);

      if (checkResult.rows.length > 0) {
        return; // Role already exists
      }

      // Add role
      const query = 'INSERT INTO user_roles (user_id, role, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)';
      await this.dbConnection.query(query, [userId, role]);

      // Clear cache for this user
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', userId));
        await this.clearCachePattern('findByEmail');
        await this.clearCachePattern('findByUsername');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('addRole', 'success', { userId, role, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('addRole', 'error', { userId, role, error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Remove role from user
  async removeRole(userId: string, role: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = 'DELETE FROM user_roles WHERE user_id = $1 AND role = $2';
      await this.dbConnection.query(query, [userId, role]);

      // Clear cache for this user
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', userId));
        await this.clearCachePattern('findByEmail');
        await this.clearCachePattern('findByUsername');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('removeRole', 'success', { userId, role, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('removeRole', 'error', { userId, role, error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Search users
  async searchUsers(searchTerm: string, filters?: UserFilters): Promise<User[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('searchUsers', searchTerm, { filters });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<User[]>(cacheKey);
        if (cached) {
          this.logOperation('searchUsers', 'cache_hit', { searchTerm, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Build query
      let query = `
        SELECT u.*, array_agg(ur.role) as roles 
        FROM users u 
        LEFT JOIN user_roles ur ON u.id = ur.user_id 
        WHERE u.is_active = true 
        AND (LOWER(u.first_name) LIKE LOWER($1) 
             OR LOWER(u.last_name) LIKE LOWER($1) 
             OR LOWER(u.username) LIKE LOWER($1) 
             OR LOWER(u.email) LIKE LOWER($1))
      `;

      const params: any[] = [`%${searchTerm}%`];
      let paramIndex = 2;

      // Add filters
      if (filters) {
        if (filters.isVerified !== undefined) {
          query += ` AND u.is_verified = $${paramIndex}`;
          params.push(filters.isVerified);
          paramIndex++;
        }

        if (filters.roles && filters.roles.length > 0) {
          query += ` AND EXISTS (
            SELECT 1 FROM user_roles ur2 
            WHERE ur2.user_id = u.id AND ur2.role = ANY($${paramIndex})
          )`;
          params.push(filters.roles);
          paramIndex++;
        }

        if (filters.createdAfter) {
          query += ` AND u.created_at >= $${paramIndex}`;
          params.push(filters.createdAfter);
          paramIndex++;
        }

        if (filters.createdBefore) {
          query += ` AND u.created_at <= $${paramIndex}`;
          params.push(filters.createdBefore);
          paramIndex++;
        }
      }

      query += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT 50';

      const result = await this.dbConnection.query(query, params);
      const users = result.rows.map((row: any) => this.mapRowToUser(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, users, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('searchUsers', 'success', { searchTerm, count: users.length, executionTime });

      return users;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('searchUsers', 'error', { searchTerm, error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    recentSignups: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getUserStats');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) {
          this.logOperation('getUserStats', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
          COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_signups
        FROM users
      `;

      const result = await this.dbConnection.query(query);
      const stats = result.rows[0];

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, stats, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getUserStats', 'success', { executionTime });

      return stats;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getUserStats', 'error', { error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, options?: any): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
    const result = await this.dbConnection.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: User[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM users WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters
    if (options.filters) {
      if (options.filters.isActive !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(options.filters.isActive);
        paramIndex++;
      }

      if (options.filters.isVerified !== undefined) {
        query += ` AND is_verified = $${paramIndex}`;
        params.push(options.filters.isVerified);
        paramIndex++;
      }
    }

    // Add sorting
    if (options.sortBy) {
      query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`;
    } else {
      query += ' ORDER BY created_at DESC';
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
    const users = result.rows.map((row: any) => this.mapRowToUser(row));

    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM users WHERE is_active = true';
    const countResult = await this.dbConnection.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);

    return {
      data: users,
      totalCount,
      hasMore: options.offset ? options.offset + users.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<User>): Promise<User> {
    const createData = entity as UserCreateData;

    const query = `
      INSERT INTO users (
        email, username, first_name, last_name, phone, date_of_birth, 
        avatar, bio, preferences, is_active, is_verified, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      createData.email,
      createData.username,
      createData.firstName,
      createData.lastName,
      createData.phone,
      createData.dateOfBirth,
      createData.avatar,
      createData.bio,
      JSON.stringify(createData.preferences || {}),
      true,
      false,
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToUser(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<User>): Promise<User | null> {
    const updateData = updates as UserUpdateData;

    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.email !== undefined) {
      setClause.push(`email = $${paramIndex}`);
      params.push(updateData.email);
      paramIndex++;
    }

    if (updateData.username !== undefined) {
      setClause.push(`username = $${paramIndex}`);
      params.push(updateData.username);
      paramIndex++;
    }

    if (updateData.firstName !== undefined) {
      setClause.push(`first_name = $${paramIndex}`);
      params.push(updateData.firstName);
      paramIndex++;
    }

    if (updateData.lastName !== undefined) {
      setClause.push(`last_name = $${paramIndex}`);
      params.push(updateData.lastName);
      paramIndex++;
    }

    if (updateData.phone !== undefined) {
      setClause.push(`phone = $${paramIndex}`);
      params.push(updateData.phone);
      paramIndex++;
    }

    if (updateData.avatar !== undefined) {
      setClause.push(`avatar = $${paramIndex}`);
      params.push(updateData.avatar);
      paramIndex++;
    }

    if (updateData.bio !== undefined) {
      setClause.push(`bio = $${paramIndex}`);
      params.push(updateData.bio);
      paramIndex++;
    }

    if (updateData.preferences !== undefined) {
      setClause.push(`preferences = $${paramIndex}`);
      params.push(JSON.stringify(updateData.preferences));
      paramIndex++;
    }

    if (updateData.isActive !== undefined) {
      setClause.push(`is_active = $${paramIndex}`);
      params.push(updateData.isActive);
      paramIndex++;
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `
      UPDATE users 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM users WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters) {
      if (filters.isActive !== undefined) {
        query += ` AND is_active = $${paramIndex}`;
        params.push(filters.isActive);
        paramIndex++;
      }

      if (filters.isVerified !== undefined) {
        query += ` AND is_verified = $${paramIndex}`;
        params.push(filters.isVerified);
        paramIndex++;
      }
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE id = $1 AND is_active = true';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<User>): Promise<void> {
    // Basic validation
    if (!entity.email && !entity.username) {
      throw new Error('Email or username is required');
    }

    if (entity.email && !this.isValidEmail(entity.email)) {
      throw new Error('Invalid email format');
    }

    if (entity.username && !this.isValidUsername(entity.username)) {
      throw new Error('Invalid username format');
    }

    if (entity.firstName && entity.firstName.length < 2) {
      throw new Error('First name must be at least 2 characters');
    }

    if (entity.lastName && entity.lastName.length < 2) {
      throw new Error('Last name must be at least 2 characters');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getUserStats();
  }

  // Helper methods
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
      avatar: row.avatar,
      bio: row.bio,
      preferences: row.preferences ? JSON.parse(row.preferences) : this.getDefaultPreferences(),
      roles: row.roles || [],
      permissions: [], // Would need separate query
      isActive: row.is_active,
      isVerified: row.is_verified,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
      },
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }
}
