/**
 * Notification Repository
 *
 * Repository for notification data management including CRUD operations,
 * notification delivery, preferences, and notification history.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  status: NotificationStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata: NotificationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationType {
  SYSTEM = 'system',
  ORDER = 'order',
  PAYMENT = 'payment',
  SHIPPING = 'shipping',
  MARKETING = 'marketing',
  SECURITY = 'security',
  ACCOUNT = 'account',
  SOCIAL = 'social',
  REMINDER = 'reminder',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
  EXPIRED = 'expired',
}

export interface NotificationMetadata {
  source: string;
  template?: string;
  campaign?: string;
  trackingId?: string;
  deliveryAttempts: number;
  lastError?: string;
  deliveryDetails: Record<NotificationChannel, NotificationDeliveryDetail>;
}

export interface NotificationDeliveryDetail {
  sent: boolean;
  delivered: boolean;
  read: boolean;
  clicked: boolean;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  error?: string;
}

export interface NotificationPreferences {
  userId: string;
  channels: Record<NotificationChannel, boolean>;
  types: Record<NotificationType, boolean>;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
  frequency: {
    maxPerHour: number;
    maxPerDay: number;
  };
}

export interface NotificationCreateData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Partial<NotificationMetadata>;
}

export interface NotificationUpdateData {
  title?: string;
  message?: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledAt?: Date;
  expiresAt?: Date;
  status?: NotificationStatus;
}

export interface NotificationFilters {
  userId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  createdAfter?: Date;
  createdBefore?: Date;
  unread?: boolean;
}

export class NotificationRepository extends BaseRepository<Notification> {
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

  // Find notifications for user
  async findByUserId(userId: string, options: { limit?: number; offset?: number; unread?: boolean } = {}): Promise<Notification[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findByUserId', userId, options);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Notification[]>(cacheKey);
        if (cached) {
          this.logOperation('findByUserId', 'cache_hit', { userId, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Build query
      let query = 'SELECT * FROM notifications WHERE user_id = $1';
      const params: any[] = [userId];

      if (options.unread) {
        query += ' AND read_at IS NULL';
      }

      query += ' ORDER BY created_at DESC';

      if (options.limit) {
        query += ' LIMIT $2';
        params.push(options.limit);

        if (options.offset) {
          query += ' OFFSET $3';
          params.push(options.offset);
        }
      }

      const result = await this.dbConnection.query(query, params);
      const notifications = await Promise.all(result.rows.map(row => this.mapRowToNotification(row)));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, notifications, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findByUserId', 'success', { userId, count: notifications.length, executionTime });

      return notifications;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findByUserId', 'error', { userId, error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE notifications 
        SET read_at = CURRENT_TIMESTAMP, status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3 AND read_at IS NULL
      `;

      await this.dbConnection.query(query, [NotificationStatus.READ, notificationId, userId]);

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', notificationId));
        await this.clearCachePattern('findByUserId');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('markAsRead', 'success', { notificationId, userId, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('markAsRead', 'error', { notificationId, userId, error: error instanceof Error ? error.message : String(error), executionTime });
      throw error;
    }
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<Notification | null> {
    const query = 'SELECT * FROM notifications WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToNotification(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    const updateData = updates as NotificationUpdateData;
    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.title !== undefined) {
      setClause.push(`title = $${paramIndex}`);
      params.push(updateData.title);
      paramIndex++;
    }

    if (updateData.message !== undefined) {
      setClause.push(`message = $${paramIndex}`);
      params.push(updateData.message);
      paramIndex++;
    }

    if (updateData.status !== undefined) {
      setClause.push(`status = $${paramIndex}`);
      params.push(updateData.status);
      paramIndex++;
    }

    if (setClause.length === 0) {
      const result = await this.findById(id);
      return result.data || null;
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `
      UPDATE notifications 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToNotification(result.rows[0]);
  }

  // Helper methods
  private async mapRowToNotification(row: any): Promise<Notification> {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as NotificationType,
      title: row.title,
      message: row.message,
      data: row.data ? JSON.parse(row.data) : {},
      channels: row.channels ? JSON.parse(row.channels) : [],
      priority: row.priority as NotificationPriority,
      status: row.status as NotificationStatus,
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
      sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
      readAt: row.read_at ? new Date(row.read_at) : undefined,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
