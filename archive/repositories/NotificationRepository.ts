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
const query = 'UPDATE notifications SET read_at = CURRENT_TIMESTAMP, status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 AND read_at IS NULL';
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

protected async findManyInDatabase(options: any): Promise<{ data: Notification[]; totalCount: number; hasMore: boolean }> {
let query = 'SELECT * FROM notifications WHERE 1=1';
const params: any[] = [];
let paramIndex = 1;

// Apply filters
if (options.filters) {
if (options.filters.userId) {
query += ` AND user_id = $${paramIndex}`;
params.push(options.filters.userId);
paramIndex++;
}

if (options.filters.type) {
query += ` AND type = $${paramIndex}`;
params.push(options.filters.type);
paramIndex++;
}

if (options.filters.status) {
query += ` AND status = $${paramIndex}`;
params.push(options.filters.status);
paramIndex++;
}

if (options.filters.unread) {
query += ' AND read_at IS NULL';
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
const notifications = await Promise.all(result.rows.map(row => this.mapRowToNotification(row)));

// Get total count
let countQuery = 'SELECT COUNT(*) as count FROM notifications WHERE 1=1';
const countParams: any[] = [];
let countParamIndex = 1;

if (options.filters) {
if (options.filters.userId) {
countQuery += ` AND user_id = $${countParamIndex}`;
countParams.push(options.filters.userId);
countParamIndex++;
}

if (options.filters.type) {
countQuery += ` AND type = $${countParamIndex}`;
countParams.push(options.filters.type);
countParamIndex++;
}

if (options.filters.status) {
countQuery += ` AND status = $${countParamIndex}`;
countParams.push(options.filters.status);
countParamIndex++;
}

if (options.filters.unread) {
countQuery += ' AND read_at IS NULL';
}
}

const countResult = await this.dbConnection.query(countQuery, countParams);
const totalCount = parseInt(countResult.rows[0].count, 10);

return {
data: notifications,
totalCount,
hasMore: options.offset ? options.offset + notifications.length < totalCount : false,
};
}

protected async createInDatabase(entity: Partial<Notification>): Promise<Notification> {
const createData = entity as NotificationCreateData;
const query = 'INSERT INTO notifications (user_id, type, title, message, data, channels, priority, status, scheduled_at, expires_at, metadata, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *';

const metadata = {
source: 'system',
deliveryAttempts: 0,
deliveryDetails: {} as Record<NotificationChannel, NotificationDeliveryDetail>,
...createData.metadata,
};

// Initialize delivery details for all channels
for (const channel of (createData.channels || [NotificationChannel.IN_APP])) {
metadata.deliveryDetails[channel] = {
sent: false,
delivered: false,
read: false,
clicked: false,
};
}

const params = [
createData.userId,
createData.type,
createData.title,
createData.message,
JSON.stringify(createData.data || {}),
JSON.stringify(createData.channels || [NotificationChannel.IN_APP]),
createData.priority || NotificationPriority.NORMAL,
createData.scheduledAt ? NotificationStatus.SCHEDULED : NotificationStatus.PENDING,
createData.scheduledAt,
createData.expiresAt,
JSON.stringify(metadata),
];

const result = await this.dbConnection.query(query, params);
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

const query = 'UPDATE notifications SET ' + setClause.join(', ') + ' WHERE id = $' + paramIndex + ' RETURNING *';

const result = await this.dbConnection.query(query, params);
if (result.rows.length === 0) {
return null;
}

return this.mapRowToNotification(result.rows[0]);
}

protected async deleteInDatabase(id: string): Promise<boolean> {
const query = 'DELETE FROM notifications WHERE id = $1';
const result = await this.dbConnection.query(query, [id]);
return result.rowCount > 0;
}

protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
let query = 'SELECT COUNT(*) as count FROM notifications WHERE 1=1';
const params: any[] = [];

if (filters) {
if (filters.userId) {
query += ` AND user_id = $${params.length + 1}`;
params.push(filters.userId);
}

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
const query = 'SELECT 1 FROM notifications WHERE id = $1';
const result = await this.dbConnection.query(query, [id]);
return result.rows.length > 0;
}

protected async validateEntity(entity: Partial<Notification>): Promise<void> {
const createData = entity as NotificationCreateData;

if (!createData.userId) {
throw new Error('User ID is required');
}

if (!createData.type) {
throw new Error('Notification type is required');
}

if (!createData.title || createData.title.length < 1) {
throw new Error('Notification title is required');
}

if (!createData.message || createData.message.length < 1) {
throw new Error('Notification message is required');
}

if (createData.scheduledAt && createData.scheduledAt <= new Date()) {
throw new Error('Scheduled time must be in the future');
}

if (createData.expiresAt && createData.scheduledAt && createData.expiresAt <= createData.scheduledAt) {
throw new Error('Expiration time must be after scheduled time');
}
}

protected async getRepositoryStats(): Promise<any> {
// Return basic stats - can be expanded later
return {
totalNotifications: 0,
activeNotifications: 0,
cacheHitRate: 0,
};
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
