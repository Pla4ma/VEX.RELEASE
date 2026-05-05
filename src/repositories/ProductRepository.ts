/**
 * Product Repository
 *
 * Repository for product data management including CRUD operations,
 * inventory management, pricing, and product relationships.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  costPrice: number;
  currency: string;
  images: ProductImage[];
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  inventory: ProductInventory;
  seo: ProductSEO;
  status: ProductStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  inventory: {
    quantity: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
  };
  attributes: Record<string, string>;
}

export interface ProductInventory {
  quantity: number;
  reserved: number;
  available: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
}

export interface ProductSEO {
  title: string;
  description: string;
  keywords: string[];
  slug: string;
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  OUT_OF_STOCK = 'out_of_stock',
}

export interface ProductFilters {
  status?: ProductStatus;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ProductCreateData {
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  costPrice: number;
  currency: string;
  images?: Partial<ProductImage>[];
  attributes?: ProductAttribute[];
  variants?: Partial<ProductVariant>[];
  inventory?: Partial<ProductInventory>;
  seo?: Partial<ProductSEO>;
  tags?: string[];
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  price?: number;
  costPrice?: number;
  currency?: string;
  images?: Partial<ProductImage>[];
  attributes?: ProductAttribute[];
  variants?: Partial<ProductVariant>[];
  inventory?: Partial<ProductInventory>;
  seo?: Partial<ProductSEO>;
  status?: ProductStatus;
  tags?: string[];
}

export class ProductRepository extends BaseRepository<Product> {
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

  // Find by SKU
  async findBySku(sku: string): Promise<Product | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findBySku', sku);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Product>(cacheKey);
        if (cached) {
          this.logOperation('findBySku', 'cache_hit', { sku, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Query database
      const query = 'SELECT * FROM products WHERE sku = $1 AND status != $2';
      const result = await this.dbConnection.query(query, [sku, ProductStatus.ARCHIVED]);

      if (result.rows.length === 0) {
        return null;
      }

      const product = await this.mapRowToProduct(result.rows[0]);

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, product, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findBySku', 'success', { sku, executionTime });

      return product;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findBySku', 'error', { sku, error: error.message, executionTime });
      throw error;
    }
  }

  // Find by barcode
  async findByBarcode(barcode: string): Promise<Product | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('findByBarcode', barcode);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Product>(cacheKey);
        if (cached) {
          this.logOperation('findByBarcode', 'cache_hit', { barcode, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Query database
      const query = 'SELECT * FROM products WHERE barcode = $1 AND status != $2';
      const result = await this.dbConnection.query(query, [barcode, ProductStatus.ARCHIVED]);

      if (result.rows.length === 0) {
        return null;
      }

      const product = await this.mapRowToProduct(result.rows[0]);

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, product, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('findByBarcode', 'success', { barcode, executionTime });

      return product;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('findByBarcode', 'error', { barcode, error: error.message, executionTime });
      throw error;
    }
  }

  // Search products
  async searchProducts(searchTerm: string, filters?: ProductFilters): Promise<Product[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('searchProducts', searchTerm, { filters });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Product[]>(cacheKey);
        if (cached) {
          this.logOperation('searchProducts', 'cache_hit', { searchTerm, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Build query
      let query = `
        SELECT p.* FROM products p 
        WHERE p.status != $1 
        AND (LOWER(p.name) LIKE LOWER($2) 
             OR LOWER(p.description) LIKE LOWER($2) 
             OR LOWER(p.sku) LIKE LOWER($2)
             OR LOWER(p.barcode) LIKE LOWER($2))
      `;

      const params: any[] = [ProductStatus.ARCHIVED, `%${searchTerm}%`];
      let paramIndex = 3;

      // Add filters
      if (filters) {
        if (filters.status) {
          query += ` AND p.status = $${paramIndex}`;
          params.push(filters.status);
          paramIndex++;
        }

        if (filters.category) {
          query += ` AND p.category = $${paramIndex}`;
          params.push(filters.category);
          paramIndex++;
        }

        if (filters.brand) {
          query += ` AND p.brand = $${paramIndex}`;
          params.push(filters.brand);
          paramIndex++;
        }

        if (filters.priceMin !== undefined) {
          query += ` AND p.price >= $${paramIndex}`;
          params.push(filters.priceMin);
          paramIndex++;
        }

        if (filters.priceMax !== undefined) {
          query += ` AND p.price <= $${paramIndex}`;
          params.push(filters.priceMax);
          paramIndex++;
        }

        if (filters.inStock) {
          query += ' AND p.inventory_quantity > 0';
        }

        if (filters.tags && filters.tags.length > 0) {
          query += ` AND p.tags && $${paramIndex}`;
          params.push(filters.tags);
          paramIndex++;
        }
      }

      query += ' ORDER BY p.name ASC LIMIT 100';

      const result = await this.dbConnection.query(query, params);
      const products = await Promise.all(result.rows.map(row => this.mapRowToProduct(row)));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, products, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('searchProducts', 'success', { searchTerm, count: products.length, executionTime });

      return products;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('searchProducts', 'error', { searchTerm, error: error.message, executionTime });
      throw error;
    }
  }

  // Update inventory
  async updateInventory(productId: string, quantity: number, operation: 'add' | 'subtract' | 'set'): Promise<void> {
    const startTime = Date.now();

    try {
      let query: string;
      const params: any[] = [];

      switch (operation) {
        case 'add':
          query = 'UPDATE products SET inventory_quantity = inventory_quantity + $1, available_quantity = available_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
          params.push(quantity, productId);
          break;
        case 'subtract':
          query = 'UPDATE products SET inventory_quantity = inventory_quantity - $1, available_quantity = available_quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND inventory_quantity >= $1';
          params.push(quantity, productId);
          break;
        case 'set':
          query = 'UPDATE products SET inventory_quantity = $1, available_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
          params.push(quantity, productId);
          break;
      }

      const result = await this.dbConnection.query(query, params);

      if (result.rowCount === 0 && operation === 'subtract') {
        throw new Error('Insufficient inventory');
      }

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', productId));
        await this.clearCachePattern('findBySku');
        await this.clearCachePattern('searchProducts');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('updateInventory', 'success', { productId, quantity, operation, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updateInventory', 'error', { productId, quantity, operation, error: error.message, executionTime });
      throw error;
    }
  }

  // Reserve inventory
  async reserveInventory(productId: string, quantity: number): Promise<boolean> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE products 
        SET reserved_quantity = reserved_quantity + $1,
            available_quantity = available_quantity - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND available_quantity >= $1
        RETURNING available_quantity
      `;

      const result = await this.dbConnection.query(query, [quantity, productId]);

      if (result.rows.length === 0) {
        return false;
      }

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', productId));
        await this.clearCachePattern('findBySku');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('reserveInventory', 'success', { productId, quantity, executionTime });

      return true;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('reserveInventory', 'error', { productId, quantity, error: error.message, executionTime });
      throw error;
    }
  }

  // Release reserved inventory
  async releaseReservedInventory(productId: string, quantity: number): Promise<void> {
    const startTime = Date.now();

    try {
      const query = `
        UPDATE products 
        SET reserved_quantity = reserved_quantity - $1,
            available_quantity = available_quantity + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND reserved_quantity >= $1
      `;

      const result = await this.dbConnection.query(query, [quantity, productId]);

      if (result.rowCount === 0) {
        throw new Error('Insufficient reserved inventory');
      }

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('findById', productId));
        await this.clearCachePattern('findBySku');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('releaseReservedInventory', 'success', { productId, quantity, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('releaseReservedInventory', 'error', { productId, quantity, error: error.message, executionTime });
      throw error;
    }
  }

  // Get low stock products
  async getLowStockProducts(): Promise<Product[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getLowStockProducts');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Product[]>(cacheKey);
        if (cached) {
          this.logOperation('getLowStockProducts', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = `
        SELECT * FROM products 
        WHERE status = $1 
        AND inventory_quantity <= low_stock_threshold 
        AND track_quantity = true
        ORDER BY inventory_quantity ASC
      `;

      const result = await this.dbConnection.query(query, [ProductStatus.ACTIVE]);
      const products = await Promise.all(result.rows.map(row => this.mapRowToProduct(row)));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, products, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getLowStockProducts', 'success', { count: products.length, executionTime });

      return products;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getLowStockProducts', 'error', { error: error.message, executionTime });
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category: string, limit: number = 50): Promise<Product[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getProductsByCategory', category, { limit });

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Product[]>(cacheKey);
        if (cached) {
          this.logOperation('getProductsByCategory', 'cache_hit', { category, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = `
        SELECT * FROM products 
        WHERE category = $1 AND status = $2 
        ORDER BY name ASC 
        LIMIT $3
      `;

      const result = await this.dbConnection.query(query, [category, ProductStatus.ACTIVE, limit]);
      const products = await Promise.all(result.rows.map(row => this.mapRowToProduct(row)));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, products, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getProductsByCategory', 'success', { category, count: products.length, executionTime });

      return products;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getProductsByCategory', 'error', { category, error: error.message, executionTime });
      throw error;
    }
  }

  // Get product statistics
  async getProductStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalValue: number;
    averagePrice: number;
  }> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getProductStats');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<any>(cacheKey);
        if (cached) {
          this.logOperation('getProductStats', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = `
        SELECT 
          COUNT(*) as total_products,
          COUNT(CASE WHEN status = $1 THEN 1 END) as active_products,
          COUNT(CASE WHEN inventory_quantity = 0 THEN 1 END) as out_of_stock_products,
          COUNT(CASE WHEN inventory_quantity <= low_stock_threshold AND track_quantity = true THEN 1 END) as low_stock_products,
          COALESCE(SUM(price * inventory_quantity), 0) as total_value,
          COALESCE(AVG(price), 0) as average_price
        FROM products 
        WHERE status != $2
      `;

      const result = await this.dbConnection.query(query, [ProductStatus.ACTIVE, ProductStatus.ARCHIVED]);
      const stats = result.rows[0];

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, stats, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getProductStats', 'success', { executionTime });

      return stats;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getProductStats', 'error', { error: error.message, executionTime });
      throw error;
    }
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = $1 AND status != $2';
    const result = await this.dbConnection.query(query, [id, ProductStatus.ARCHIVED]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToProduct(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: Product[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM products WHERE status != $1';
    const params: any[] = [ProductStatus.ARCHIVED];
    let paramIndex = 2;

    // Apply filters
    if (options.filters) {
      if (options.filters.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(options.filters.status);
        paramIndex++;
      }

      if (options.filters.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(options.filters.category);
        paramIndex++;
      }

      if (options.filters.brand) {
        query += ` AND brand = $${paramIndex}`;
        params.push(options.filters.brand);
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
    const products = await Promise.all(result.rows.map(row => this.mapRowToProduct(row)));

    // Get total count
    const countQuery = 'SELECT COUNT(*) as count FROM products WHERE status != $1';
    const countResult = await this.dbConnection.query(countQuery, [ProductStatus.ARCHIVED]);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: products,
      totalCount,
      hasMore: options.offset ? options.offset + products.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<Product>): Promise<Product> {
    const createData = entity as ProductCreateData;

    const query = `
      INSERT INTO products (
        name, description, sku, barcode, category, subcategory, brand, 
        price, cost_price, currency, images, attributes, variants, 
        inventory, seo, status, tags, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      createData.name,
      createData.description,
      createData.sku,
      createData.barcode,
      createData.category,
      createData.subcategory,
      createData.brand,
      createData.price,
      createData.costPrice,
      createData.currency,
      JSON.stringify(createData.images || []),
      JSON.stringify(createData.attributes || []),
      JSON.stringify(createData.variants || []),
      JSON.stringify(createData.inventory || this.getDefaultInventory()),
      JSON.stringify(createData.seo || {}),
      ProductStatus.DRAFT,
      createData.tags || [],
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToProduct(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<Product>): Promise<Product | null> {
    const updateData = updates as ProductUpdateData;

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

    if (updateData.price !== undefined) {
      setClause.push(`price = $${paramIndex}`);
      params.push(updateData.price);
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
      UPDATE products 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToProduct(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'UPDATE products SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await this.dbConnection.query(query, [ProductStatus.ARCHIVED, id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM products WHERE status != $1';
    const params: any[] = [ProductStatus.ARCHIVED];
    let paramIndex = 2;

    if (filters) {
      if (filters.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(filters.category);
        paramIndex++;
      }
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM products WHERE id = $1 AND status != $2';
    const result = await this.dbConnection.query(query, [id, ProductStatus.ARCHIVED]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<Product>): Promise<void> {
    const createData = entity as ProductCreateData;

    if (!createData.name || createData.name.length < 2) {
      throw new Error('Product name must be at least 2 characters');
    }

    if (!createData.sku || createData.sku.length < 3) {
      throw new Error('Product SKU must be at least 3 characters');
    }

    if (!createData.category) {
      throw new Error('Product category is required');
    }

    if (!createData.price || createData.price <= 0) {
      throw new Error('Product price must be positive');
    }

    if (!createData.costPrice || createData.costPrice <= 0) {
      throw new Error('Product cost price must be positive');
    }

    if (createData.price < createData.costPrice) {
      throw new Error('Product price cannot be less than cost price');
    }

    // Check for duplicate SKU
    const existingProduct = await this.findBySku(createData.sku);
    if (existingProduct && existingProduct.id !== (entity as any).id) {
      throw new Error('Product SKU already exists');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    return this.getProductStats();
  }

  // Helper methods
  private async mapRowToProduct(row: any): Promise<Product> {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      sku: row.sku,
      barcode: row.barcode,
      category: row.category,
      subcategory: row.subcategory,
      brand: row.brand,
      price: parseFloat(row.price),
      costPrice: parseFloat(row.cost_price),
      currency: row.currency,
      images: row.images ? JSON.parse(row.images) : [],
      attributes: row.attributes ? JSON.parse(row.attributes) : [],
      variants: row.variants ? JSON.parse(row.variants) : [],
      inventory: row.inventory ? JSON.parse(row.inventory) : this.getDefaultInventory(),
      seo: row.seo ? JSON.parse(row.seo) : {},
      status: row.status as ProductStatus,
      tags: row.tags || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private getDefaultInventory(): ProductInventory {
    return {
      quantity: 0,
      reserved: 0,
      available: 0,
      trackQuantity: true,
      allowBackorder: false,
      lowStockThreshold: 10,
      reorderPoint: 5,
      reorderQuantity: 50,
    };
  }
}
