/**
 * Inventory Types
 * Domain types for the inventory system
 *
 * Dependencies:
 * - Economy (purchases add items to inventory)
 * - Items (item definitions)
 * - Crafting (uses inventory items as ingredients)
 * - Shop (items come from shop purchases)
 */

// ============================================================================
// Item Instance Types
// ============================================================================

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type ItemType =
  | 'CONSUMABLE'      // Single use, provides immediate effect
  | 'EQUIPMENT'       // Equipped for passive bonuses
  | 'COSMETIC'        // Visual customization only
  | 'CRAFTING'        // Used as crafting ingredient
  | 'COLLECTIBLE';    // No functional use, just for collection

export type ItemStatus =
  | 'OWNED'           // In inventory, not equipped
  | 'EQUIPPED'        // Currently equipped
  | 'CONSUMED'        // Used up
  | 'TRADED'          // Traded away
  | 'DESTROYED';      // Destroyed/dismantled

export interface InventoryItem {
  id: string;
  userId: string;
  itemDefinitionId: string;  // Reference to item definition

  // Instance state
  status: ItemStatus;
  quantity: number;          // Stack size (1 for unique items)

  // Acquisition
  acquiredAt: number;
  acquiredFrom: 'SHOP' | 'CRAFTING' | 'DROP' | 'REWARD' | 'GIFT' | 'TRADE';
  purchaseId: string | null; // If from shop purchase

  // For equipment
  equippedAt: number | null;
  slot: EquipmentSlot | null;

  // For consumables
  usesRemaining: number | null; // For multi-use consumables

  // For upgradable items
  enhancementLevel: number;   // +1, +2, etc.

  // Metadata
  metadata: Record<string, unknown> | null;

  // Soft delete
  deletedAt: number | null;
  deletedReason: string | null;

  createdAt: number;
  updatedAt: number;
}

export type EquipmentSlot =
  | 'HEAD'
  | 'BODY'
  | 'HANDS'
  | 'FEET'
  | 'ACCESSORY_1'
  | 'ACCESSORY_2'
  | 'FOCUS_TOOL'
  | 'PET';

// ============================================================================
// Inventory Capacity
// ============================================================================

export interface InventoryCapacity {
  maxSlots: number;
  usedSlots: number;
  maxStackSize: number;      // Per item type
  canStack: boolean;         // Some items may not stack
}

export interface InventoryState {
  userId: string;
  items: InventoryItem[];
  capacity: InventoryCapacity;
  totalValue: number;        // Estimated value of inventory
  lastSyncedAt: number;
}

// ============================================================================
// Inventory Actions
// ============================================================================

export interface UseItemResult {
  success: boolean;
  itemId: string;
  effectApplied: boolean;
  effectType: string | null;
  quantityConsumed: number;
  remainingQuantity: number;
  message: string;
}

export interface EquipItemResult {
  success: boolean;
  itemId: string;
  previousItemId: string | null; // If another item was unequipped
  slot: EquipmentSlot;
  bonusesApplied: string[];
}

export interface UnequipItemResult {
  success: boolean;
  itemId: string;
  slot: EquipmentSlot;
  bonusesRemoved: string[];
}

export interface DestroyItemResult {
  success: boolean;
  itemId: string;
  quantityDestroyed: number;
  materialsRecovered: Array<{
    itemDefinitionId: string;
    quantity: number;
  }>;
}

// ============================================================================
// Item Collection
// ============================================================================

export interface ItemCollection {
  userId: string;
  totalItems: number;
  uniqueItems: number;
  completedSets: string[];
  completionPercentage: number;
  rarestItem: string | null;
}

export interface ItemSet {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  bonusDescription: string | null;
}

// ============================================================================
// Quick Use
// ============================================================================

export interface QuickUseSlot {
  slotIndex: number;
  itemId: string | null;
  itemDefinitionId: string | null;
}

export interface QuickUseConfig {
  userId: string;
  slots: QuickUseSlot[];
  maxSlots: number;
}

// ============================================================================
// Inventory Filters
// ============================================================================

export interface InventoryFilter {
  types?: ItemType[];
  rarities?: ItemRarity[];
  status?: ItemStatus[];
  slots?: EquipmentSlot[];
  searchQuery?: string;
  minQuantity?: number;
  acquiredAfter?: number;
  acquiredBefore?: number;
  sortBy: 'acquiredAt' | 'name' | 'rarity' | 'quantity';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// Item Stack
// ============================================================================

export interface ItemStack {
  itemDefinitionId: string;
  totalQuantity: number;
  instances: InventoryItem[];
  canStackMore: boolean;
  maxStackSize: number;
}
