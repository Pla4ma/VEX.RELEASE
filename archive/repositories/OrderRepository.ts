/**
 * Order Repository
 *
 * Repository for order data management including CRUD operations,
 * order processing, payment handling, and order status tracking.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingMethod: ShippingMethod;
  shippingStatus: ShippingStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  metadata: OrderMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: {
    id: string;
    name: string;
    sku: string;
    attributes: Record<string, string>;
  };
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum ShippingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RETURNED = 'returned',
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  trackingRequired: boolean;
}

export interface OrderMetadata {
  source: 'web' | 'mobile' | 'api' | 'admin';
  ipAddress?: string;
  userAgent?: string;
  referralSource?: string;
  discountCode?: string;
  giftMessage?: string;
  giftWrap?: boolean;
}

export interface OrderFilters {
  customerId?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  createdAfter?: Date;
  createdBefore?: Date;
  totalMin?: number;
  totalMax?: number;
  hasDiscount?: boolean;
}

export interface OrderCreateData {
  customerId: string;
  customerEmail: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  currency: string;
  notes?: string;
  metadata?: Partial<OrderMetadata>;
}

export interface OrderUpdateData {
  customerEmail?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  shippingStatus?: ShippingStatus;
  notes?: string;
  metadata?: Partial<OrderMetadata>;
}

export class OrderRepository extends BaseRepository<Order> {
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

  // Find by order number
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findByOrderNumber', orderNumber);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Order>(cacheKey);
        if (cached) {
          this.logOperation('findByOrderNumber', 'cache_hit', { orderNumber, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Query database
      const query = 'SELECT * FROM orders WHERE order_number = $1';
      const result = await this.dbConnection.query(query, [orderNumber]);

      if (result.rows.length === 0) {
        return null;
      }

      const order = await this.mapRowToOrder(result.rows[0]);

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, order, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findByOrderNumber', 'success', { orderNumber, executionTime });

      return order;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findByOrderNumber', 'error', { orderNumber, error: error.message, executionTime });
      throw error;
    }
  }

  // Find orders by customer
  async findByCustomer(customerId: string, options: { limit?: number; offset?: number } = {}): Promise<Order[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findByCustomer', customerId, options);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Order[]>(cacheKey);
        if (cached) {
          this.logOperation('findByCustomer', 'cache_hit', { customerId, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Query database
      let query = 'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC';
      const params: any[] = [customerId];

      if (options.limit) {
        query += ' LIMIT $2';
        params.push(options.limit);

        if (options.offset) {
          query += ' OFFSET $3';
          params.push(options.offset);
        }
      }

      const result = await this.dbConnection.query(query, params);
      const orders = await Promise.all(result.rows.map(row => this.mapRowToOrder(row)));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, orders, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findByCustomer', 'success', { customerId, count: orders.length, executionTime });

      return orders;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findByCustomer', 'error', { customerId, error: error.message, executionTime });
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE orders 
        SET order_status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `;

      await this.dbConnection.query(query, [status, notes, orderId]);

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', orderId));
        await this.clearCachePattern('findByOrderNumber');
        await this.clearCachePattern('findByCustomer');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('updateOrderStatus', 'success', { orderId, status, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updateOrderStatus', 'error', { orderId, status, error: error.message, executionTime });
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId: string, status: PaymentStatus, transactionId?: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE orders 
        SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      await this.dbConnection.query(query, [status, orderId]);

      // Store transaction if provided
      if (transactionId) {
        const transactionQuery = `
          INSERT INTO order_transactions (order_id, transaction_id, status, created_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        `;
        await this.dbConnection.query(transactionQuery, [orderId, transactionId, status]);
      }

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', orderId));
        await this.clearCachePattern('findByOrderNumber');
        await this.clearCachePattern('findByCustomer');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('updatePaymentStatus', 'success', { orderId, status, transactionId, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updatePaymentStatus', 'error', { orderId, status, error: error.message, executionTime });
      throw error;
    }
  }

  // Update shipping status
  async updateShippingStatus(orderId: string, status: ShippingStatus, trackingNumber?: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE orders 
        SET shipping_status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      await this.dbConnection.query(query, [status, orderId]);

      // Store tracking number if provided
      if (trackingNumber) {
        const trackingQuery = `
          INSERT INTO order_tracking (order_id, tracking_number, status, created_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (order_id) DO UPDATE SET
            tracking_number = EXCLUDED.tracking_number,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP
        `;
        await this.dbConnection.query(trackingQuery, [orderId, trackingNumber, status]);
      }

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', orderId));
        await this.clearCachePattern('findByOrderNumber');
        await this.clearCachePattern('findByCustomer');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('updateShippingStatus', 'success', { orderId, status, trackingNumber, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updateShippingStatus', 'error', { orderId, status, error: error.message, executionTime });
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<void> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE orders 
        SET order_status = $1, notes = COALESCE(notes, '') || ' | Cancelled: ' || $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND order_status NOT IN ($4, $5)
      `;

      const result = await this.dbConnection.query(query, [
        OrderStatus.CANCELLED,
        reason,
        orderId,
        OrderStatus.DELIVERED,
        OrderStatus.REFUNDED,
      ]);

      if (result.rowCount === 0) {
        throw new Error('Order cannot be cancelled');
      }

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', orderId));
        await this.clearCachePattern('findByOrderNumber');
        await this.clearCachePattern('findByCustomer');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('cancelOrder', 'success', { orderId, reason, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('cancelOrder', 'error', { orderId, reason, error: error.message, executionTime });
      throw error;
    }
  }

  // Get order statistics
  async getOrderStats(filters?: OrderFilters): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByPaymentStatus: Record<PaymentStatus, number>;
    recentOrders: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getOrderStats', '', { filters });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) {
          this.logOperation('getOrderStats', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters) {
        if (filters.customerId) {
          whereClause += ` AND customer_id = $${paramIndex}`;
          params.push(filters.customerId);
          paramIndex++;
        }

        if (filters.createdAfter) {
          whereClause += ` AND created_at >= $${paramIndex}`;
          params.push(filters.createdAfter);
          paramIndex++;
        }

        if (filters.createdBefore) {
          whereClause += ` AND created_at <= $${paramIndex}`;
          params.push(filters.createdBefore);
          paramIndex++;
        }
      }

      const query = `
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as average_order_value,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_orders
        FROM orders ${whereClause}
      `;

      const result = await this.dbConnection.query(query, params);
      const basicStats = result.rows[0];

      // Get orders by status
      const statusQuery = `
        SELECT order_status, COUNT(*) as count 
        FROM orders ${whereClause}
        GROUP BY order_status
      `;

      const statusResult = await this.dbConnection.query(statusQuery, params);
      const ordersByStatus = statusResult.rows.reduce((acc, row) => {
        acc[row.order_status] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<OrderStatus, number>);

      // Get orders by payment status
      const paymentStatusQuery = `
        SELECT payment_status, COUNT(*) as count 
        FROM orders ${whereClause}
        GROUP BY payment_status
      `;

      const paymentStatusResult = await this.dbConnection.query(paymentStatusQuery, params);
      const ordersByPaymentStatus = paymentStatusResult.rows.reduce((acc, row) => {
        acc[row.payment_status] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<PaymentStatus, number>);

      const stats = {
        totalOrders: parseInt(basicStats.total_orders, 10),
        totalRevenue: parseFloat(basicStats.total_revenue),
        averageOrderValue: parseFloat(basicStats.average_order_value),
        ordersByStatus,
        ordersByPaymentStatus,
        recentOrders: parseInt(basicStats.recent_orders, 10),
      };

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, stats, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getOrderStats', 'success', { executionTime });

      return stats;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getOrderStats', 'error', { error: error.message, executionTime });
      throw error;
    }
  }

  // Get pending orders
  async getPendingOrders(): Promise<Order[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getPendingOrders');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Order[]>(cacheKey);
        if (cached) {
          this.logOperation('getPendingOrders', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = `
        SELECT * FROM orders 
        WHERE order_status = $1 OR payment_status = $2 
        ORDER BY created_at ASC
      `;

      const result = await this.dbConnection.query(query, [OrderStatus.PENDING, PaymentStatus.PENDING]);
      const orders = await Promise.all(result.rows.map(row => this.mapRowToOrder(row)));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, orders, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getPendingOrders', 'success', { count: orders.length, executionTime });

      return orders;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getPendingOrders', 'error', { error: error.message, executionTime });
      throw error;
    }
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToOrder(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: Order[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters
    if (options.filters) {
      if (options.filters.customerId) {
        query += ` AND customer_id = $${paramIndex}`;
        params.push(options.filters.customerId);
        paramIndex++;
      }

      if (options.filters.orderStatus) {
        query += ` AND order_status = $${paramIndex}`;
        params.push(options.filters.orderStatus);
        paramIndex++;
      }

      if (options.filters.paymentStatus) {
        query += ` AND payment_status = $${paramIndex}`;
        params.push(options.filters.paymentStatus);
        paramIndex++;
      }

      if (options.filters.createdAfter) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(options.filters.createdAfter);
        paramIndex++;
      }

      if (options.filters.createdBefore) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(options.filters.createdBefore);
        paramIndex++;
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
    const orders = await Promise.all(result.rows.map(row => this.mapRowToOrder(row)));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (options.filters) {
      if (options.filters.customerId) {
        countQuery += ` AND customer_id = $${countParamIndex}`;
        countParams.push(options.filters.customerId);
        countParamIndex++;
      }

      if (options.filters.orderStatus) {
        countQuery += ` AND order_status = $${countParamIndex}`;
        countParams.push(options.filters.orderStatus);
        countParamIndex++;
      }

      if (options.filters.paymentStatus) {
        countQuery += ` AND payment_status = $${countParamIndex}`;
        countParams.push(options.filters.paymentStatus);
        countParamIndex++;
      }

      if (options.filters.createdAfter) {
        countQuery += ` AND created_at >= $${countParamIndex}`;
        countParams.push(options.filters.createdAfter);
        countParamIndex++;
      }

      if (options.filters.createdBefore) {
        countQuery += ` AND created_at <= $${countParamIndex}`;
        countParams.push(options.filters.createdBefore);
        countParamIndex++;
      }
    }

    const countResult = await this.dbConnection.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: orders,
      totalCount,
      hasMore: options.offset ? options.offset + orders.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<Order>): Promise<Order> {
    const createData = entity as OrderCreateData;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate totals
    const subtotal = createData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * 0.1; // 10% tax (simplified)
    const shippingAmount = createData.shippingMethod.cost;
    const discountAmount = 0; // Would calculate based on discount codes
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    const query = `
      INSERT INTO orders (
        order_number, customer_id, customer_email, items, shipping_address, 
        billing_address, payment_method, payment_status, order_status, 
        shipping_method, shipping_status, subtotal, tax_amount, shipping_amount, 
        discount_amount, total_amount, currency, notes, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      orderNumber,
      createData.customerId,
      createData.customerEmail,
      JSON.stringify(createData.items.map(item => ({
        ...item,
        id: this.generateId(),
        totalPrice: item.quantity * item.unitPrice,
      }))),
      JSON.stringify(createData.shippingAddress),
      JSON.stringify(createData.billingAddress),
      JSON.stringify(createData.paymentMethod),
      PaymentStatus.PENDING,
      OrderStatus.PENDING,
      JSON.stringify(createData.shippingMethod),
      ShippingStatus.PENDING,
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      totalAmount,
      createData.currency,
      createData.notes,
      JSON.stringify(createData.metadata || {}),
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToOrder(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<Order>): Promise<Order | null> {
    const updateData = updates as OrderUpdateData;

    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.customerEmail !== undefined) {
      setClause.push(`customer_email = $${paramIndex}`);
      params.push(updateData.customerEmail);
      paramIndex++;
    }

    if (updateData.paymentStatus !== undefined) {
      setClause.push(`payment_status = $${paramIndex}`);
      params.push(updateData.paymentStatus);
      paramIndex++;
    }

    if (updateData.orderStatus !== undefined) {
      setClause.push(`order_status = $${paramIndex}`);
      params.push(updateData.orderStatus);
      paramIndex++;
    }

    if (updateData.shippingStatus !== undefined) {
      setClause.push(`shipping_status = $${paramIndex}`);
      params.push(updateData.shippingStatus);
      paramIndex++;
    }

    if (updateData.notes !== undefined) {
      setClause.push(`notes = $${paramIndex}`);
      params.push(updateData.notes);
      paramIndex++;
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `
      UPDATE orders 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToOrder(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    // Orders are typically not deleted, just cancelled
    const query = 'UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await this.dbConnection.query(query, [OrderStatus.CANCELLED, id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters) {
      if (filters.customerId) {
        query += ` AND customer_id = $${paramIndex}`;
        params.push(filters.customerId);
        paramIndex++;
      }

      if (filters.orderStatus) {
        query += ` AND order_status = $${paramIndex}`;
        params.push(filters.orderStatus);
        paramIndex++;
      }
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM orders WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<Order>): Promise<void> {
    const createData = entity as OrderCreateData;

    if (!createData.customerId) {
      throw new Error('Customer ID is required');
    }

    if (!createData.customerEmail || !this.isValidEmail(createData.customerEmail)) {
      throw new Error('Valid customer email is required');
    }

    if (!createData.items || createData.items.length === 0) {
      throw new Error('At least one order item is required');
    }

    for (const item of createData.items) {
      if (!item.productId) {
        throw new Error('Product ID is required for all items');
      }

      if (!item.quantity || item.quantity <= 0) {
        throw new Error('Item quantity must be positive');
      }

      if (!item.unitPrice || item.unitPrice <= 0) {
        throw new Error('Item unit price must be positive');
      }
    }

    if (!createData.shippingAddress || !this.isValidAddress(createData.shippingAddress)) {
      throw new Error('Valid shipping address is required');
    }

    if (!createData.billingAddress || !this.isValidAddress(createData.billingAddress)) {
      throw new Error('Valid billing address is required');
    }

    if (!createData.paymentMethod) {
      throw new Error('Payment method is required');
    }

    if (!createData.shippingMethod) {
      throw new Error('Shipping method is required');
    }

    if (!createData.currency) {
      throw new Error('Currency is required');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getOrderStats();
  }

  // Helper methods
  private async mapRowToOrder(row: any): Promise<Order> {
    return {
      id: row.id,
      orderNumber: row.order_number,
      customerId: row.customer_id,
      customerEmail: row.customer_email,
      items: row.items ? JSON.parse(row.items) : [],
      shippingAddress: row.shipping_address ? JSON.parse(row.shipping_address) : {},
      billingAddress: row.billing_address ? JSON.parse(row.billing_address) : {},
      paymentMethod: row.payment_method ? JSON.parse(row.payment_method) : {},
      paymentStatus: row.payment_status as PaymentStatus,
      orderStatus: row.order_status as OrderStatus,
      shippingMethod: row.shipping_method ? JSON.parse(row.shipping_method) : {},
      shippingStatus: row.shipping_status as ShippingStatus,
      subtotal: parseFloat(row.subtotal),
      taxAmount: parseFloat(row.tax_amount),
      shippingAmount: parseFloat(row.shipping_amount),
      discountAmount: parseFloat(row.discount_amount),
      totalAmount: parseFloat(row.total_amount),
      currency: row.currency,
      notes: row.notes,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const prefix = 'ORD';
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');

    // Get sequence number
    const sequenceQuery = 'SELECT nextval(\'order_number_seq\') as sequence';
    const result = await this.dbConnection.query(sequenceQuery);
    const sequence = parseInt(result.rows[0].sequence, 10);

    return `${prefix}${dateStr}${sequence.toString().padStart(6, '0')}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidAddress(address: Address): boolean {
    return !!(address.firstName &&
             address.lastName &&
             address.address1 &&
             address.city &&
             address.state &&
             address.postalCode &&
             address.country);
  }
}
