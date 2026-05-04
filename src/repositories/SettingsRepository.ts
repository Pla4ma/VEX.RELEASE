/**
 * Settings Repository
 * 
 * Repository for application settings management including system settings,
 * user preferences, configuration management, and settings validation.
 */

import { BaseRepository } from './BaseRepository';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';
import { DatabaseConnection } from '../database/DatabaseConnection';

export interface Setting {
  id: string;
  key: string;
  value: any;
  type: SettingType;
  category: SettingCategory;
  description?: string;
  isRequired: boolean;
  isPublic: boolean;
  validationRules?: ValidationRule[];
  metadata: SettingMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
  OBJECT = 'object',
  DATE = 'date',
  EMAIL = 'email',
  URL = 'url',
  COLOR = 'color',
}

export enum SettingCategory {
  SYSTEM = 'system',
  USER_INTERFACE = 'user_interface',
  SECURITY = 'security',
  NOTIFICATIONS = 'notifications',
  INTEGRATIONS = 'integrations',
  PERFORMANCE = 'performance',
  COMPLIANCE = 'compliance',
  BUSINESS = 'business',
}

export interface ValidationRule {
  type: ValidationRuleType;
  parameters: Record<string, any>;
  message?: string;
}

export enum ValidationRuleType {
  REQUIRED = 'required',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  PATTERN = 'pattern',
  EMAIL = 'email',
  URL = 'url',
  ENUM = 'enum',
}

export interface SettingMetadata {
  source: string;
  version?: string;
  environment: 'development' | 'staging' | 'production';
  tags: string[];
  dependencies: string[];
  lastModifiedBy?: string;
  auditTrail?: AuditEntry[];
}

export interface AuditEntry {
  action: 'created' | 'updated' | 'deleted';
  timestamp: Date;
  userId?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
}

export interface UserSetting {
  id: string;
  userId: string;
  settingKey: string;
  value: any;
  overrides: boolean;
  metadata: UserSettingMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettingMetadata {
  source: string;
  deviceId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SettingTemplate {
  id: string;
  name: string;
  description: string;
  category: SettingCategory;
  settings: TemplateSetting[];
  isActive: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSetting {
  key: string;
  type: SettingType;
  defaultValue: any;
  description?: string;
  isRequired: boolean;
  validationRules?: ValidationRule[];
  dependsOn?: string[];
}

export interface SettingFilters {
  category?: SettingCategory;
  type?: SettingType;
  isPublic?: boolean;
  isRequired?: boolean;
  tags?: string[];
  search?: string;
}

export interface SettingCreateData {
  key: string;
  value: any;
  type: SettingType;
  category: SettingCategory;
  description?: string;
  isRequired?: boolean;
  isPublic?: boolean;
  validationRules?: ValidationRule[];
  metadata?: Partial<SettingMetadata>;
}

export interface SettingUpdateData {
  value?: any;
  description?: string;
  isRequired?: boolean;
  isPublic?: boolean;
  validationRules?: ValidationRule[];
  metadata?: Partial<SettingMetadata>;
}

export class SettingsRepository extends BaseRepository<Setting> {
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

  // Get setting by key
  async getByKey(key: string): Promise<Setting | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getByKey', key);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Setting>(cacheKey);
        if (cached) {
          this.logOperation('getByKey', 'cache_hit', { key, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM settings WHERE key = $1';
      const result = await this.dbConnection.query(query, [key]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const setting = this.mapRowToSetting(result.rows[0]);
      
      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, setting, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getByKey', 'success', { key, executionTime });

      return setting;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getByKey', 'error', { key, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get settings by category
  async getByCategory(category: SettingCategory): Promise<Setting[]> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getByCategory', category);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Setting[]>(cacheKey);
        if (cached) {
          this.logOperation('getByCategory', 'cache_hit', { category, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM settings WHERE category = $1 ORDER BY key ASC';
      const result = await this.dbConnection.query(query, [category]);
      const settings = result.rows.map(row => this.mapRowToSetting(row));

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, settings, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getByCategory', 'success', { category, count: settings.length, executionTime });

      return settings;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getByCategory', 'error', { category, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get public settings
  async getPublicSettings(): Promise<Record<string, any>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getPublicSettings');

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Record<string, any>>(cacheKey);
        if (cached) {
          this.logOperation('getPublicSettings', 'cache_hit', { executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM settings WHERE is_public = true ORDER BY key ASC';
      const result = await this.dbConnection.query(query);
      const settings = result.rows.map(row => this.mapRowToSetting(row));

      const publicSettings = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, publicSettings, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getPublicSettings', 'success', { count: settings.length, executionTime });

      return publicSettings;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getPublicSettings', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Update setting value
  async updateSettingValue(key: string, value: any, userId?: string, reason?: string): Promise<Setting> {
    const startTime = Date.now();

    try {
      // Get current setting for audit
      const currentSetting = await this.getByKey(key);
      if (!currentSetting) {
        throw new Error('Setting not found');
      }

      // Validate new value
      await this.validateSettingValue(currentSetting, value);

      // Update setting
      const query = `
        UPDATE settings 
        SET value = $1, updated_at = CURRENT_TIMESTAMP
        WHERE key = $2
        RETURNING *
      `;

      const result = await this.dbConnection.query(query, [JSON.stringify(value), key]);
      const updatedSetting = this.mapRowToSetting(result.rows[0]);

      // Add audit entry
      await this.addAuditEntry(key, 'updated', userId, currentSetting.value, value, reason);

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('getByKey', key));
        await this.clearCachePattern('getByCategory');
        await this.clearCachePattern('getPublicSettings');
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('updateSettingValue', 'success', { key, executionTime });

      return updatedSetting;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('updateSettingValue', 'error', { key, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get user setting
  async getUserSetting(userId: string, settingKey: string): Promise<UserSetting | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getUserSetting', userId, settingKey);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<UserSetting>(cacheKey);
        if (cached) {
          this.logOperation('getUserSetting', 'cache_hit', { userId, settingKey, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      const query = 'SELECT * FROM user_settings WHERE user_id = $1 AND setting_key = $2';
      const result = await this.dbConnection.query(query, [userId, settingKey]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const userSetting = this.mapRowToUserSetting(result.rows[0]);
      
      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, userSetting, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getUserSetting', 'success', { userId, settingKey, executionTime });

      return userSetting;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getUserSetting', 'error', { userId, settingKey, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Set user setting
  async setUserSetting(userId: string, settingKey: string, value: any, overrides: boolean = false, metadata?: Partial<UserSettingMetadata>): Promise<UserSetting> {
    const startTime = Date.now();

    try {
      // Validate setting exists
      const setting = await this.getByKey(settingKey);
      if (!setting) {
        throw new Error('Setting not found');
      }

      // Validate value
      await this.validateSettingValue(setting, value);

      const query = `
        INSERT INTO user_settings (
          user_id, setting_key, value, overrides, metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, setting_key) DO UPDATE SET
          value = EXCLUDED.value,
          overrides = EXCLUDED.overrides,
          metadata = EXCLUDED.metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const params = [
        userId,
        settingKey,
        JSON.stringify(value),
        overrides,
        JSON.stringify({
          source: 'settings_repository',
          ...metadata,
        }),
      ];

      const result = await this.dbConnection.query(query, params);
      const userSetting = this.mapRowToUserSetting(result.rows[0]);

      // Clear cache
      if (this.options.useCache) {
        await this.cacheManager.delete(this.generateCacheKey('getUserSetting', userId, settingKey));
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('setUserSetting', 'success', { userId, settingKey, executionTime });

      return userSetting;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('setUserSetting', 'error', { userId, settingKey, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get effective setting value (considering user overrides)
  async getEffectiveSetting(userId: string, settingKey: string): Promise<any> {
    const startTime = Date.now();

    try {
      // Check for user override
      const userSetting = await this.getUserSetting(userId, settingKey);
      if (userSetting && userSetting.overrides) {
        return userSetting.value;
      }

      // Fall back to default setting
      const setting = await this.getByKey(settingKey);
      return setting ? setting.value : null;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getEffectiveSetting', 'error', { userId, settingKey, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Get all user settings
  async getUserSettings(userId: string): Promise<Record<string, any>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('getUserSettings', userId);

    try {
      // Check cache first
      if (this.options.useCache) {
        const cached = await this.cacheManager.get<Record<string, any>>(cacheKey);
        if (cached) {
          this.logOperation('getUserSettings', 'cache_hit', { userId, executionTime: Date.now() - startTime });
          return cached;
        }
      }

      // Get user overrides
      const userSettingsQuery = 'SELECT * FROM user_settings WHERE user_id = $1 AND overrides = true';
      const userSettingsResult = await this.dbConnection.query(userSettingsQuery, [userId]);
      const userOverrides = userSettingsResult.rows.reduce((acc: any, row: any) => {
        const userSetting = this.mapRowToUserSetting(row);
        acc[userSetting.settingKey] = userSetting.value;
        return acc;
      }, {});

      // Get default settings
      const defaultSettingsQuery = 'SELECT * FROM settings ORDER BY key ASC';
      const defaultSettingsResult = await this.dbConnection.query(defaultSettingsQuery);
      const defaultSettings = defaultSettingsResult.rows.reduce((acc: any, row: any) => {
        const setting = this.mapRowToSetting(row);
        if (!userOverrides[setting.key]) {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {});

      const allSettings = { ...defaultSettings, ...userOverrides };

      // Cache the result
      if (this.options.useCache) {
        await this.cacheManager.set(cacheKey, allSettings, this.options.cacheTTL);
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('getUserSettings', 'success', { userId, count: Object.keys(allSettings).length, executionTime });

      return allSettings;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('getUserSettings', 'error', { userId, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Create setting template
  async createTemplate(template: Omit<SettingTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<SettingTemplate> {
    const startTime = Date.now();

    try {
      const query = `
        INSERT INTO setting_templates (
          name, description, category, settings, is_active, version, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const params = [
        template.name,
        template.description,
        template.category,
        JSON.stringify(template.settings),
        template.isActive,
        template.version,
      ];

      const result = await this.dbConnection.query(query, params);
      const createdTemplate = this.mapRowToTemplate(result.rows[0]);

      const executionTime = Date.now() - startTime;
      this.logOperation('createTemplate', 'success', { templateId: createdTemplate.id, executionTime });

      return createdTemplate;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('createTemplate', 'error', { error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Apply template
  async applyTemplate(templateId: string, userId?: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Get template
      const templateQuery = 'SELECT * FROM setting_templates WHERE id = $1 AND is_active = true';
      const templateResult = await this.dbConnection.query(templateQuery, [templateId]);
      
      if (templateResult.rows.length === 0) {
        throw new Error('Template not found or inactive');
      }

      const template = this.mapRowToTemplate(templateResult.rows[0]);

      // Apply each setting in the template
      for (const templateSetting of template.settings) {
        try {
          if (userId) {
            // Set as user setting
            await this.setUserSetting(userId, templateSetting.key, templateSetting.defaultValue, true);
          } else {
            // Set as system setting
            await this.updateSettingValue(templateSetting.key, templateSetting.defaultValue);
          }
        } catch (error) {
          // Log error but continue with other settings
          this.logOperation('applyTemplate', 'warning', {
            templateId,
            settingKey: templateSetting.key,
            error: (error as Error).message,
          });
        }
      }

      const executionTime = Date.now() - startTime;
      this.logOperation('applyTemplate', 'success', { templateId, userId, executionTime });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logOperation('applyTemplate', 'error', { templateId, userId, error: (error as Error).message, executionTime });
      throw error;
    }
  }

  // Validate setting value
  private async validateSettingValue(setting: Setting, value: any): Promise<void> {
    // Type validation
    switch (setting.type) {
      case SettingType.STRING:
        if (typeof value !== 'string') {
          throw new Error('Value must be a string');
        }
        break;
      case SettingType.NUMBER:
        if (typeof value !== 'number') {
          throw new Error('Value must be a number');
        }
        break;
      case SettingType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new Error('Value must be a boolean');
        }
        break;
      case SettingType.JSON:
        if (typeof value !== 'object') {
          throw new Error('Value must be a JSON object');
        }
        break;
      case SettingType.ARRAY:
        if (!Array.isArray(value)) {
          throw new Error('Value must be an array');
        }
        break;
      case SettingType.EMAIL:
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          throw new Error('Value must be a valid email');
        }
        break;
      case SettingType.URL:
        if (typeof value !== 'string' || !this.isValidUrl(value)) {
          throw new Error('Value must be a valid URL');
        }
        break;
    }

    // Custom validation rules
    if (setting.validationRules) {
      for (const rule of setting.validationRules) {
        await this.applyValidationRule(rule, value);
      }
    }
  }

  // Apply validation rule
  private async applyValidationRule(rule: ValidationRule, value: any): Promise<void> {
    switch (rule.type) {
      case ValidationRuleType.REQUIRED:
        if (value === null || value === undefined || value === '') {
          throw new Error(rule.message || 'Value is required');
        }
        break;
      case ValidationRuleType.MIN_LENGTH:
        if (typeof value === 'string' && value.length < rule.parameters.min) {
          throw new Error(rule.message || `Value must be at least ${rule.parameters.min} characters`);
        }
        break;
      case ValidationRuleType.MAX_LENGTH:
        if (typeof value === 'string' && value.length > rule.parameters.max) {
          throw new Error(rule.message || `Value must be no more than ${rule.parameters.max} characters`);
        }
        break;
      case ValidationRuleType.MIN_VALUE:
        if (typeof value === 'number' && value < rule.parameters.min) {
          throw new Error(rule.message || `Value must be at least ${rule.parameters.min}`);
        }
        break;
      case ValidationRuleType.MAX_VALUE:
        if (typeof value === 'number' && value > rule.parameters.max) {
          throw new Error(rule.message || `Value must be no more than ${rule.parameters.max}`);
        }
        break;
      case ValidationRuleType.PATTERN:
        if (typeof value === 'string' && !new RegExp(rule.parameters.pattern).test(value)) {
          throw new Error(rule.message || 'Value does not match required pattern');
        }
        break;
      case ValidationRuleType.ENUM:
        if (!rule.parameters.values.includes(value)) {
          throw new Error(rule.message || 'Value must be one of the allowed values');
        }
        break;
    }
  }

  // Add audit entry
  private async addAuditEntry(key: string, action: string, userId?: string, oldValue?: any, newValue?: any, reason?: string): Promise<void> {
    const query = `
      UPDATE settings 
      SET metadata = jsonb_set(
        jsonb_set(metadata, '{auditTrail}', COALESCE(metadata->'auditTrail', '[]'::jsonb) || $1),
        '{lastModifiedBy}', $2
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE key = $3
    `;

    const auditEntry: AuditEntry = {
      action: action as any,
      timestamp: new Date(),
      userId,
      oldValue,
      newValue,
      reason,
    };

    await this.dbConnection.query(query, [JSON.stringify(auditEntry), userId || null, key]);
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Protected abstract methods implementation
  protected async findInDatabase(id: string, _options?: any): Promise<Setting | null> {
    const query = 'SELECT * FROM settings WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSetting(result.rows[0]);
  }

  protected async findManyInDatabase(options: any): Promise<{ data: Setting[]; totalCount: number; hasMore: boolean }> {
    let query = 'SELECT * FROM settings WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (options.filters) {
      if (options.filters.category) {
        query += ` AND category = $${params.length + 1}`;
        params.push(options.filters.category);
      }

      if (options.filters.type) {
        query += ` AND type = $${params.length + 1}`;
        params.push(options.filters.type);
      }

      if (options.filters.isPublic !== undefined) {
        query += ` AND is_public = $${params.length + 1}`;
        params.push(options.filters.isPublic);
      }

      if (options.filters.search) {
        query += ` AND (key ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
        params.push(`%${options.filters.search}%`);
      }
    }

    // Add sorting
    if (options.sortBy) {
      query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`;
    } else {
      query += ' ORDER BY key ASC';
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
    const settings = result.rows.map(row => this.mapRowToSetting(row));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM settings WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (options.filters) {
      if (options.filters.category) {
        countQuery += ` AND category = $${countParamIndex}`;
        countParams.push(options.filters.category);
        countParamIndex++;
      }

      if (options.filters.type) {
        countQuery += ` AND type = $${countParamIndex}`;
        countParams.push(options.filters.type);
        countParamIndex++;
      }

      if (options.filters.isPublic !== undefined) {
        countQuery += ` AND is_public = $${countParamIndex}`;
        countParams.push(options.filters.isPublic);
        countParamIndex++;
      }

      if (options.filters.search) {
        countQuery += ` AND (key ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
        countParams.push(`%${options.filters.search}%`);
        countParamIndex++;
      }
    }

    const countResult = await this.dbConnection.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      data: settings,
      totalCount,
      hasMore: options.offset ? options.offset + settings.length < totalCount : false,
    };
  }

  protected async createInDatabase(entity: Partial<Setting>): Promise<Setting> {
    const settingData = entity as SettingCreateData;
    
    const query = `
      INSERT INTO settings (
        key, value, type, category, description, is_required, is_public,
        validation_rules, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const params = [
      settingData.key,
      JSON.stringify(settingData.value),
      settingData.type,
      settingData.category,
      settingData.description,
      settingData.isRequired || false,
      settingData.isPublic || false,
      JSON.stringify(settingData.validationRules || []),
      JSON.stringify({
        source: 'settings_repository',
        environment: 'production',
        tags: [],
        dependencies: [],
        ...settingData.metadata,
      }),
    ];

    const result = await this.dbConnection.query(query, params);
    return this.mapRowToSetting(result.rows[0]);
  }

  protected async updateInDatabase(id: string, updates: Partial<Setting>): Promise<Setting | null> {
    const updateData = updates as SettingUpdateData;
    
    const setClause: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updateData.value !== undefined) {
      setClause.push(`value = $${paramIndex}`);
      params.push(JSON.stringify(updateData.value));
      paramIndex++;
    }

    if (updateData.description !== undefined) {
      setClause.push(`description = $${paramIndex}`);
      params.push(updateData.description);
      paramIndex++;
    }

    if (updateData.isRequired !== undefined) {
      setClause.push(`is_required = $${paramIndex}`);
      params.push(updateData.isRequired);
      paramIndex++;
    }

    if (updateData.isPublic !== undefined) {
      setClause.push(`is_public = $${paramIndex}`);
      params.push(updateData.isPublic);
      paramIndex++;
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE settings 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.dbConnection.query(query, params);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSetting(result.rows[0]);
  }

  protected async deleteInDatabase(id: string): Promise<boolean> {
    const query = 'DELETE FROM settings WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rowCount > 0;
  }

  protected async countInDatabase(filters?: Record<string, any>): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM settings WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.category) {
        query += ` AND category = $${params.length + 1}`;
        params.push(filters.category);
      }

      if (filters.type) {
        query += ` AND type = $${params.length + 1}`;
        params.push(filters.type);
      }
    }

    const result = await this.dbConnection.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  protected async existsInDatabase(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM settings WHERE id = $1';
    const result = await this.dbConnection.query(query, [id]);
    return result.rows.length > 0;
  }

  protected async validateEntity(entity: Partial<Setting>): Promise<void> {
    const settingData = entity as SettingCreateData;

    if (!settingData.key) {
      throw new Error('Setting key is required');
    }

    if (!settingData.type) {
      throw new Error('Setting type is required');
    }

    if (!settingData.category) {
      throw new Error('Setting category is required');
    }

    if (settingData.value === undefined) {
      throw new Error('Setting value is required');
    }
  }

  protected async getRepositoryStats(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_settings,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_settings,
        COUNT(CASE WHEN is_required = true THEN 1 END) as required_settings,
        COUNT(DISTINCT category) as categories
      FROM settings
    `;

    const result = await this.dbConnection.query(query);
    return result.rows[0];
  }

  // Helper methods for mapping
  private mapRowToSetting(row: any): Setting {
    return {
      id: row.id,
      key: row.key,
      value: row.value ? JSON.parse(row.value) : null,
      type: row.type as SettingType,
      category: row.category as SettingCategory,
      description: row.description,
      isRequired: row.is_required,
      isPublic: row.is_public,
      validationRules: row.validation_rules ? JSON.parse(row.validation_rules) : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToUserSetting(row: any): UserSetting {
    return {
      id: row.id,
      userId: row.user_id,
      settingKey: row.setting_key,
      value: row.value ? JSON.parse(row.value) : null,
      overrides: row.overrides,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToTemplate(row: any): SettingTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category as SettingCategory,
      settings: row.settings ? JSON.parse(row.settings) : [],
      isActive: row.is_active,
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
