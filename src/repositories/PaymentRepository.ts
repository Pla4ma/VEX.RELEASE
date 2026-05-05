/**
 * Payment Repository
 *
 * Repository for payment data management including payment processing,
 * transaction handling, refunds, and payment method management.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethodInfo;
  gateway: PaymentGateway;
  transactionId?: string;
  gatewayTransactionId?: string;
  failureReason?: string;
  processedAt?: Date;
  refundedAmount?: number;
  refunds: PaymentRefund[];
  metadata: PaymentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export interface PaymentMethodInfo {
  type: PaymentMethodType;
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  billingAddress?: Address;
  token?: string;
}

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTOCURRENCY = 'cryptocurrency',
  BUY_NOW_PAY_LATER = 'buy_now_pay_later',
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

export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square',
  ADOBE_PAY = 'adobe_pay',
  BRAINTREE = 'braintree',
  AUTHORIZE_NET = 'authorize_net',
}

export interface PaymentRefund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  gatewayRefundId?: string;
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
}

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PaymentMetadata {
  source: string;
  ipAddress?: string;
  userAgent?: string;
  riskScore?: number;
  fraudFlags?: string[];
  threeDSecure?: ThreeDSecureResult;
  installmentPlan?: InstallmentPlan;
  subscriptionInfo?: SubscriptionInfo;
}

export interface ThreeDSecureResult {
  authenticated: boolean;
  version: string;
  challenge: boolean;
  liabilityShift: boolean;
}

export interface InstallmentPlan {
  provider: string;
  planId: string;
  totalInstallments: number;
  currentInstallment: number;
  installmentAmount: number;
}

export interface SubscriptionInfo {
  subscriptionId: string;
  planId: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface PaymentFilters {
  orderId?: string;
  customerId?: string;
  status?: PaymentStatus;
  gateway?: PaymentGateway;
  paymentMethodType?: PaymentMethodType;
  amountMin?: number;
  amountMax?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  hasRefunds?: boolean;
}

export interface PaymentCreateData {
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodInfo;
  gateway: PaymentGateway;
  metadata?: Partial<PaymentMetadata>;
}

export interface PaymentUpdateData {
  status?: PaymentStatus;
  transactionId?: string;
  gatewayTransactionId?: string;
  failureReason?: string;
  processedAt?: Date;
  metadata?: Partial<PaymentMetadata>;
}

export class PaymentRepository extends BaseRepository<Payment> {
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

  // Process payment
  async processPayment(data: PaymentCreateData): Promise<Payment> {
    const startTime = Date.now();

    try {
      // Validate payment data
      await this.validatePaymentData(data);

      // Create payment record
      const payment = await this.create({
        ...data,
        status: PaymentStatus.PENDING,
        metadata: {
          source: 'payment_repository',
          ...data.metadata,
        },
      });

      // Process with gateway (simplified)
      const gatewayResult = await this.processWithGateway(payment);

      // Update payment with gateway result
      const updatedPayment = await this.updatePaymentStatus(
        payment.id,
        gatewayResult.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        gatewayResult.transactionId,
        gatewayResult.gatewayTransactionId,
        gatewayResult.failureReason
      );

      const executionTime = Date.now() - startTime;
      this.logOperation('processPayment', 'success', {
        paymentId: payment.id,
        orderId: data.orderId,
        amount: data.amount,
        status: updatedPayment.status,
        executionTime,
      });

      return updatedPayment;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('processPayment', 'error', {
        orderId: data.orderId,
        amount: data.amount,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Find payments by order
  async findByOrder(orderId: string): Promise<Payment[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findByOrder', orderId);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Payment[]>(cacheKey);
        if (cached) {
          this.logOperation('findByOrder', 'cache_hit', { orderId, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC';
      const result = await this.dbConnection.query(query, [orderId]);
      const payments = result.rows.map(row => this.mapRowToPayment(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, payments, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findByOrder', 'success', { orderId, count: payments.length, executionTime });

      return payments;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findByOrder', 'error', { orderId, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Find payments by customer
  async findByCustomer(customerId: string, options: { limit?: number; offset?: number } = {}): Promise<Payment[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findByCustomer', customerId, options);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Payment[]>(cacheKey);
        if (cached) {
          this.logOperation('findByCustomer', 'cache_hit', { customerId, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      let query = 'SELECT * FROM payments WHERE customer_id = $1 ORDER BY created_at DESC';
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
      const payments = result.rows.map(row => this.mapRowToPayment(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, payments, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findByCustomer', 'success', { customerId, count: payments.length, executionTime });

      return payments;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findByCustomer', 'error', { customerId, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionId?: string,
    gatewayTransactionId?: string,
    failureReason?: string
  ): Promise<Payment> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE payments 
        SET status = $1, transaction_id = $2, gateway_transaction_id = $3, 
            failure_reason = $4, processed_at = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;

      const result = await this.dbConnection.query(query, [
        status,
        transactionId,
        gatewayTransactionId,
        failureReason,
        status === PaymentStatus.COMPLETED ? new Date() : null,
        paymentId,
      ]);

      if (result.rows.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = this.mapRowToPayment(result.rows[0]);

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', paymentId));
        await this.clearCachePattern('findByOrder');
        await this.clearCachePattern('findByCustomer');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('updatePaymentStatus', 'success', {
        paymentId,
        status,
        transactionId,
        executionTime,
      });

      return payment;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updatePaymentStatus', 'error', {
        paymentId,
        status,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Process refund
  async processRefund(paymentId: string, amount: number, reason: string): Promise<PaymentRefund> {
    const startTime = Date.now();

    try {
      // Get payment
      const payment = await this.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Payment must be completed to refund');
      }

      const totalRefunded = payment.refunds.reduce((sum, refund) => sum + refund.amount, 0);
      if (totalRefunded + amount > payment.amount) {
        throw new Error('Refund amount exceeds payment amount');
      }

      // Create refund record
      const refundId = this.generateId();
      const refund: PaymentRefund = {
        id: refundId,
        paymentId,
        amount,
        reason,
        status: RefundStatus.PENDING,
        createdAt: new Date(),
      };

      const refundQuery = `
        INSERT INTO payment_refunds (
          id, payment_id, amount, reason, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const refundResult = await this.dbConnection.query(refundQuery, [
        refundId,
        paymentId,
        amount,
        reason,
        RefundStatus.PENDING,
      ]);

      const createdRefund = this.mapRowToRefund(refundResult.rows[0]);

      // Process refund with gateway
      const gatewayResult = await this.processRefundWithGateway(payment, amount, reason);

      // Update refund status
      await this.updateRefundStatus(
        refundId,
        gatewayResult.success ? RefundStatus.COMPLETED : RefundStatus.FAILED,
        gatewayResult.gatewayRefundId,
        gatewayResult.failureReason
      );

      // Update payment status if fully refunded
      const newTotalRefunded = totalRefunded + amount;
      if (newTotalRefunded >= payment.amount) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.REFUNDED);
      } else {
        await this.updatePaymentStatus(paymentId, PaymentStatus.PARTIALLY_REFUNDED);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('processRefund', 'success', {
        paymentId,
        refundId,
        amount,
        status: createdRefund.status,
        executionTime,
      });

      return createdRefund;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('processRefund', 'error', {
        paymentId,
        amount,
        error: (error as Error).message,
        executionTime,
      });
      throw error;
    }
  }

  // Get payment statistics
  async getPaymentStats(filters?: PaymentFilters): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    paymentsByStatus: Record<PaymentStatus, number>;
    paymentsByGateway: Record<PaymentGateway, number>;
    paymentsByMethod: Record<PaymentMethodType, number>;
    refundRate: number;
    successRate: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getPaymentStats', '', { filters });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) {
          this.logOperation('getPaymentStats', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filters) {
        if (filters.orderId) {
          whereClause += ` AND order_id = $${params.length + 1}`;
          params.push(filters.orderId);
        }

        if (filters.customerId) {
          whereClause += ` AND customer_id = $${params.length + 1}`;
          params.push(filters.customerId);
        }

        if (filters.status) {
          whereClause += ` AND status = $${params.length + 1}`;
          params.push(filters.status);
        }

        if (filters.createdAfter) {
          whereClause += ` AND created_at >= $${params.length + 1}`;
          params.push(filters.createdAfter);
        }

        if (filters.createdBefore) {
          whereClause += ` AND created_at <= $${params.length + 1}`;
          params.push(filters.createdBefore);
        }
      }

      // Get basic statistics
      const basicQuery = `
        SELECT 
          COUNT(*) as total_payments,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_amount
        FROM payments ${whereClause}
      `;

      const basicResult = await this.dbConnection.query(basicQuery, params);
      const basicStats = basicResult.rows[0];

      // Get payments by status
      const statusQuery = `
        SELECT status, COUNT(*) as count 
        FROM payments ${whereClause}
        GROUP BY status
      `;

      const statusResult = await this.dbConnection.query(statusQuery, params);
      const paymentsByStatus = statusResult.rows.reduce((acc: any, row: any) => {
        acc[row.status] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<PaymentStatus, number>);

      // Get payments by gateway
      const gatewayQuery = `
        SELECT gateway, COUNT(*) as count 
        FROM payments ${whereClause}
        GROUP BY gateway
      `;

      const gatewayResult = await this.dbConnection.query(gatewayQuery, params);
      const paymentsByGateway = gatewayResult.rows.reduce((acc: any, row: any) => {
        acc[row.gateway] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<PaymentGateway, number>);

      // Get payments by method type
      const methodQuery = `
        SELECT payment_method->>'type' as method_type, COUNT(*) as count 
        FROM payments ${whereClause}
        GROUP BY payment_method->>'type'
      `;

      const methodResult = await this.dbConnection.query(methodQuery, params);
      const paymentsByMethod = methodResult.rows.reduce((acc: any, row: any) => {
        acc[row.method_type] = parseInt(row.count, 10);
        return acc;
      }, {} as Record<PaymentMethodType, number>);

      // Calculate refund rate and success rate
      const totalPayments = parseInt(basicStats.total_payments, 10);
      const completedPayments = paymentsByStatus[PaymentStatus.COMPLETED] || 0;
      const refundedPayments = (paymentsByStatus[PaymentStatus.REFUNDED] || 0) + (paymentsByStatus[PaymentStatus.PARTIALLY_REFUNDED] || 0);

      const refundRate = totalPayments > 0 ? (refundedPayments / totalPayments) * 100 : 0;
      const successRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

      const stats = {
        totalPayments,
        totalAmount: parseFloat(basicStats.total_amount),
        averageAmount: parseFloat(basicStats.average_amount),
        paymentsByStatus,
        paymentsByGateway,
        paymentsByMethod,
        refundRate,
        successRate,
      };

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, stats, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getPaymentStats', 'success', { executionTime });

      return stats;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getPaymentStats', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Helper methods
  private async validatePaymentData(data: PaymentCreateData): Promise<void> {
    if (!data.orderId) {
      throw new Error('Order ID is required');
    }

    if (!data.customerId) {
      throw new Error('Customer ID is required');
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    if (!data.currency) {
      throw new Error('Currency is required');
    }

    if (!data.paymentMethod) {
      throw new Error('Payment method is required');
    }

    if (!data.gateway) {
      throw new Error('Payment gateway is required');
    }
  }

  private async processWithGateway(payment: Payment): Promise<{
    success: boolean;
    transactionId?: string;
    gatewayTransactionId?: string;
    failureReason?: string;
  }> {
    // Simplified gateway processing
    // In real implementation, this would integrate with actual payment gateways
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        return {
          success: true,
          transactionId: this.generateTransactionId(),
          gatewayTransactionId: `gw_${this.generateId()}`,
        };
      } else {
        return {
          success: false,
          failureReason: 'Insufficient funds',
        };
      }
    } catch (error) {
      return {
        success: false,
        failureReason: (error as Error).message,
      };
    }
  }

  private async processRefundWithGateway(payment: Payment, amount: number, reason: string): Promise<{
    success: boolean;
    gatewayRefundId?: string;
    failureReason?: string;
  }> {
    // Simplified refund processing
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate success (95% success rate for refunds)
      const success = Math.random() > 0.05;

      if (success) {
        return {
          success: true,
          gatewayRefundId: `refund_${this.generateId()}`,
        };
      } else {
        return {
          success: false,
          failureReason: 'Refund period expired',
        };
      }
    } catch (error) {
      return {
        success: false,
        failureReason: (error as Error).message,
      };
    }
  }

  private async updateRefundStatus(
    refundId: string,
    status: RefundStatus,
    gatewayRefundId?: string,
    failureReason?: string
  ): Promise<void> {
    const query = `
      UPDATE payment_refunds 
      SET status = $1, gateway_refund_id = $2, failure_reason = $3, 
          processed_at = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `;

    await this.dbConnection.query(query, [
      status,
      gatewayRefundId,
      failureReason,
      status === RefundStatus.COMPLETED ? new Date() : null,
      refundId,
    ]);
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<Payment | null> {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPayment(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: Payment[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM payments WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (options.filters) {
      if (options.filters.orderId) {
        query += ` AND order_id = $${params.length + 1}`;
        params.push(options.filters.orderId);
      }

      if (options.filters.customerId) {
        query += ` AND customer_id = $${params.length + 1}`;
        params.push(options.filters.customerId);
      }

      if (options.filters.status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(options.filters.status);
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
    const payments = result.rows.map(row => this.mapRowToPayment(row));

    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM payments WHERE 1=1';
    const countResult = await this.dbConnection.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: payments,
      totalCount,
      hasMore: options.offset ? options.offset + payments.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<Payment>): Promise<Payment> {
    const paymentData = entity as PaymentCreateData;

    const query = `
      INSERT INTO payments (
        order_id, customer_id, amount, currency, status, payment_method,
        gateway, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      paymentData.orderId,
      paymentData.customerId,
      paymentData.amount,
      paymentData.currency,
      PaymentStatus.PENDING,
      JSON.stringify(paymentData.paymentMethod),
      paymentData.gateway,
      JSON.stringify(paymentData.metadata || {}),
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToPayment(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const updateData = updates as PaymentUpdateData;

    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.status !== undefined) {
      setClause.push(`status = $${paramIndex}`);
      params.push(updateData.status);
      paramIndex++;
    }

    if (updateData.transactionId !== undefined) {
      setClause.push(`transaction_id = $${paramIndex}`);
      params.push(updateData.transactionId);
      paramIndex++;
    }

    if (updateData.gatewayTransactionId !== undefined) {
      setClause.push(`gateway_transaction_id = $${paramIndex}`);
      params.push(updateData.gatewayTransactionId);
      paramIndex++;
    }

    if (updateData.failureReason !== undefined) {
      setClause.push(`failure_reason = $${paramIndex}`);
      params.push(updateData.failureReason);
      paramIndex++;
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `
      UPDATE payments 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPayment(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'DELETE FROM payments WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM payments WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.orderId) {
        query += ` AND order_id = $${params.length + 1}`;
        params.push(filters.orderId);
      }

      if (filters.customerId) {
        query += ` AND customer_id = $${params.length + 1}`;
        params.push(filters.customerId);
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
    const query = 'SELECT 1 FROM payments WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<Payment>): Promise<void> {
    const paymentData = entity as PaymentCreateData;
    await this.validatePaymentData(paymentData);
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getPaymentStats();
  }

  // Helper methods for mapping
  private mapRowToPayment(row: any): Payment {
    return {
      id: row.id,
      orderId: row.order_id,
      customerId: row.customer_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status as PaymentStatus,
      paymentMethod: row.payment_method ? JSON.parse(row.payment_method) : {},
      gateway: row.gateway as PaymentGateway,
      transactionId: row.transaction_id,
      gatewayTransactionId: row.gateway_transaction_id,
      failureReason: row.failure_reason,
      processedAt: row.processed_at ? new Date(row.processed_at) : undefined,
      refundedAmount: row.refunded_amount ? parseFloat(row.refunded_amount) : undefined,
      refunds: [], // Would need separate query
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToRefund(row: any): PaymentRefund {
    return {
      id: row.id,
      paymentId: row.payment_id,
      amount: parseFloat(row.amount),
      reason: row.reason,
      status: row.status as RefundStatus,
      gatewayRefundId: row.gateway_refund_id,
      processedAt: row.processed_at ? new Date(row.processed_at) : undefined,
      failureReason: row.failure_reason,
      createdAt: new Date(row.created_at),
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}
