/**
 * LiveOps Config Feature - Repository
 *
 * Supabase data access for remote configuration.
 */

import { getSupabaseClient } from '../../config/supabase';
import { LiveOpsConfigSchema, type LiveOpsConfig } from './schemas';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('liveops:repository');

const supabase = getSupabaseClient();

export class RepositoryError extends Error {
  constructor(public operation: string, public originalError: unknown) {
    super(`Repository error in ${operation}: ${String(originalError)}`);
    this.name = 'RepositoryError';
  }
}

// ============================================================================
// Config Queries
// ============================================================================

/**
 * Fetch the current active config for an environment
 */
export async function fetchCurrentConfig(
  environment: 'development' | 'staging' | 'production'
): Promise<LiveOpsConfig | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('liveops_config')
    .select('*')
    .eq('environment', environment)
    .lte('effective_from', now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {return null;}
    throw new RepositoryError('fetchCurrentConfig', error);
  }

  return LiveOpsConfigSchema.parse(data);
}

/**
 * Fetch config by specific version
 */
export async function fetchConfigByVersion(
  environment: string,
  version: number
): Promise<LiveOpsConfig | null> {
  const { data, error } = await supabase
    .from('liveops_config')
    .select('*')
    .eq('environment', environment)
    .eq('version', version)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {return null;}
    throw new RepositoryError('fetchConfigByVersion', error);
  }

  return LiveOpsConfigSchema.parse(data);
}

/**
 * Fetch config history for rollback purposes
 */
export async function fetchConfigHistory(
  environment: string,
  limit: number = 10
): Promise<LiveOpsConfig[]> {
  const { data, error } = await supabase
    .from('liveops_config')
    .select('*')
    .eq('environment', environment)
    .order('version', { ascending: false })
    .limit(limit);

  if (error) {throw new RepositoryError('fetchConfigHistory', error);}
  return LiveOpsConfigSchema.array().parse(data || []);
}

// ============================================================================
// Config Management (Admin only)
// ============================================================================

/**
 * Create a new config version
 */
export async function createConfig(
  config: Omit<LiveOpsConfig, 'id' | 'createdAt' | 'updatedAt'>,
  adminUserId: string
): Promise<LiveOpsConfig> {
  const now = Date.now();

  const { data, error } = await supabase
    .from('liveops_config')
    .insert({
      ...config,
      id: crypto.randomUUID(),
      changed_by: adminUserId,
      created_at: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    })
    .select()
    .single();

  if (error) {throw new RepositoryError('createConfig', error);}
  return LiveOpsConfigSchema.parse(data);
}

/**
 * Update an existing config (only if not yet effective)
 */
export async function updateConfig(
  configId: string,
  updates: Partial<LiveOpsConfig>,
  adminUserId: string
): Promise<LiveOpsConfig> {
  const { data: existing } = await supabase
    .from('liveops_config')
    .select('effective_from')
    .eq('id', configId)
    .single();

  // Prevent editing configs that are already effective
  if (existing && new Date(existing.effective_from) <= new Date()) {
    throw new RepositoryError('updateConfig',
      new Error('Cannot edit config that is already effective. Create a new version instead.'));
  }

  const { data, error } = await supabase
    .from('liveops_config')
    .update({
      ...updates,
      changed_by: adminUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', configId)
    .select()
    .single();

  if (error) {throw new RepositoryError('updateConfig', error);}
  return LiveOpsConfigSchema.parse(data);
}

// ============================================================================
// A/B Test Queries
// ============================================================================

export interface ABTestRow {
  id: string;
  name: string;
  description: string;
  feature_flag: string;
  variants: unknown;
  start_at: string;
  end_at: string | null;
  audience: unknown;
  traffic_allocation: number;
  is_active: boolean;
}

/**
 * Fetch active A/B tests for a user
 */
export async function fetchActiveABTests(
  environment: string
): Promise<ABTestRow[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('ab_tests')
    .select('*')
    .eq('environment', environment)
    .eq('is_active', true)
    .lte('start_at', now)
    .or(`end_at.is.null,end_at.gt.${now}`);

  if (error) {throw new RepositoryError('fetchActiveABTests', error);}
  return data || [];
}

/**
 * Get user's A/B test assignment
 */
export async function getUserABTestAssignment(
  userId: string,
  testId: string
): Promise<{ variant_id: string } | null> {
  const { data, error } = await supabase
    .from('ab_test_assignments')
    .select('variant_id')
    .eq('user_id', userId)
    .eq('test_id', testId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {return null;}
    throw new RepositoryError('getUserABTestAssignment', error);
  }

  return data;
}

/**
 * Assign user to A/B test variant
 */
export async function assignUserToABTest(
  userId: string,
  testId: string,
  variantId: string
): Promise<void> {
  const { error } = await supabase
    .from('ab_test_assignments')
    .insert({
      user_id: userId,
      test_id: testId,
      variant_id: variantId,
      assigned_at: new Date().toISOString(),
    });

  if (error) {throw new RepositoryError('assignUserToABTest', error);}
}

// ============================================================================
// Feature Flag Checks
// ============================================================================

/**
 * Quick check if a feature is enabled (for server-side use)
 */
export async function isFeatureEnabled(
  environment: string,
  featureName: keyof LiveOpsConfig['features']
): Promise<boolean> {
  const config = await fetchCurrentConfig(environment as 'development' | 'staging' | 'production');
  if (!config) {return false;}

  const value = config.features[featureName];
  return typeof value === 'boolean' ? value : false;
}

// ============================================================================
// Config Analytics
// ============================================================================

export async function recordConfigFetch(
  environment: string,
  version: number,
  userId: string | null,
  cacheHit: boolean
): Promise<void> {
  const { error } = await supabase
    .from('config_analytics')
    .insert({
      environment,
      version,
      user_id: userId,
      cache_hit: cacheHit,
      fetched_at: new Date().toISOString(),
    });

  if (error) {
    // Silent fail - analytics should not break functionality
    debug.warn('Failed to record config analytics:', error);
  }
}
