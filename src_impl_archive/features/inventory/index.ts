/**
 * Inventory Feature
 * Export all inventory-related modules
 *
 * DEFERRED_PUBLIC_V1: Inventory is disabled in public V1 (see PUBLIC_V1_FEATURE_MAP).
 * No route, Home card, notification, or completion reward uses inventory.
 * This code remains for internal reference only.
 */

export * from './schemas';
export * as inventoryRepository from './repository';
export * from './service';
export * from './hooks';
export * from './analytics';
