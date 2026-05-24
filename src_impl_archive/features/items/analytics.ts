/**
 * Items Analytics
 * Sentry breadcrumbs and custom event tracking for item system
 */

import * as Sentry from '@sentry/react-native';
import type { ItemRarity } from './schemas';

// ============================================================================
// Item Definition Events
// ============================================================================

export function trackItemDefinitionLoaded(itemDefinitionId: string, itemName: string): void {
  Sentry.addBreadcrumb({
    message: `Item definition loaded: ${itemName}`,
    category: 'items',
    data: { itemDefinitionId, itemName },
    level: 'debug',
  });
}

export function trackItemDefinitionCacheHit(itemDefinitionId: string): void {
  // Only track in debug, too noisy for normal operation
}

export function trackItemDefinitionCacheMiss(itemDefinitionId: string): void {
  Sentry.addBreadcrumb({
    message: 'Item definition cache miss',
    category: 'items.cache',
    data: { itemDefinitionId },
    level: 'debug',
  });
}

// ============================================================================
// Item Effect Events
// ============================================================================

export function trackItemEffectApplied(userId: string, itemDefinitionId: string, effects: string[]): void {
  Sentry.addBreadcrumb({
    message: `Item effect applied: ${effects.join(', ')}`,
    category: 'items.effects',
    data: { userId, itemDefinitionId, effects },
    level: 'info',
  });
}

export function trackItemEffectFailed(userId: string, itemDefinitionId: string, effectType: string, error: string): void {
  Sentry.addBreadcrumb({
    message: `Item effect failed: ${effectType}`,
    category: 'items.effects',
    data: { userId, itemDefinitionId, effectType, error },
    level: 'warning',
  });
}

// ============================================================================
// Crafting Events
// ============================================================================

export function trackCraftingChecked(userId: string, itemDefinitionId: string, canCraft: boolean): void {
  Sentry.addBreadcrumb({
    message: `Crafting check: ${canCraft ? 'can craft' : 'cannot craft'}`,
    category: 'items.crafting',
    data: { userId, itemDefinitionId, canCraft },
    level: 'info',
  });
}

export function trackCraftingMaterialsRecovered(userId: string, itemDefinitionId: string, materialsCount: number): void {
  Sentry.addBreadcrumb({
    message: `Materials recovered from dismantle: ${materialsCount}`,
    category: 'items.crafting',
    data: { userId, itemDefinitionId, materialsCount },
    level: 'info',
  });
}

// ============================================================================
// Drop Table Events
// ============================================================================

export function trackDropTableRolled(tableId: string, rollCount: number, resultsCount: number): void {
  Sentry.addBreadcrumb({
    message: 'Drop table rolled',
    category: 'items.drops',
    data: { tableId, rollCount, resultsCount },
    level: 'info',
  });
}

export function trackItemDropped(userId: string, itemDefinitionId: string, quantity: number, source: string): void {
  Sentry.addBreadcrumb({
    message: `Item dropped: ${quantity}x`,
    category: 'items.drops',
    data: { userId, itemDefinitionId, quantity, source },
    level: 'info',
  });
}

// ============================================================================
// Shop/Purchase Events
// ============================================================================

export function trackItemPurchaseChecked(userId: string, itemDefinitionId: string, canPurchase: boolean, reason: string | null): void {
  Sentry.addBreadcrumb({
    message: `Purchase check: ${canPurchase ? 'can purchase' : reason}`,
    category: 'items.shop',
    data: { userId, itemDefinitionId, canPurchase, reason },
    level: canPurchase ? 'info' : 'warning',
  });
}

export function trackItemValueCalculated(itemDefinitionId: string, baseValue: number, finalValue: number, enhancementLevel: number): void {
  Sentry.addBreadcrumb({
    message: 'Item value calculated',
    category: 'items.pricing',
    data: { itemDefinitionId, baseValue, finalValue, enhancementLevel },
    level: 'debug',
  });
}

// ============================================================================
// Comparison Events
// ============================================================================

export function trackItemsCompared(itemAId: string, itemBId: string, betterStats: string[]): void {
  Sentry.addBreadcrumb({
    message: `Items compared: ${itemAId} vs ${itemBId}`,
    category: 'items.comparison',
    data: { itemAId, itemBId, betterStats },
    level: 'debug',
  });
}

// ============================================================================
// Error Events
// ============================================================================

export function trackItemDefinitionLoadFailed(itemDefinitionId: string, error: unknown): void {
  Sentry.captureException(error, {
    tags: {
      feature: 'items',
      operation: 'load_definition',
    },
    extra: {
      itemDefinitionId,
    },
  });
}

export function trackInvalidItemData(itemDefinitionId: string, validationErrors: string[]): void {
  Sentry.captureMessage('Invalid item definition data', {
    level: 'error',
    tags: {
      feature: 'items',
      operation: 'validation',
    },
    extra: {
      itemDefinitionId,
      validationErrors,
    },
  });
}

export function trackDropTableError(tableId: string, error: string): void {
  Sentry.captureMessage('Drop table error', {
    level: 'error',
    tags: {
      feature: 'items',
      operation: 'drop_table',
    },
    extra: {
      tableId,
      error,
    },
  });
}
