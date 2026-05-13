import { z } from "zod";


export const ItemRaritySchema = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);

export const ItemTypeSchema = z.enum(['CONSUMABLE', 'EQUIPMENT', 'COSMETIC', 'CRAFTING', 'COLLECTIBLE']);

export const ItemStatusSchema = z.enum(['OWNED', 'EQUIPPED', 'CONSUMED', 'TRADED', 'DESTROYED']);

export const EquipmentSlotSchema = z.enum(['HEAD', 'BODY', 'HANDS', 'FEET', 'ACCESSORY_1', 'ACCESSORY_2', 'FOCUS_TOOL', 'PET']);

export const AcquisitionSourceSchema = z.enum(['SHOP', 'CRAFTING', 'DROP', 'REWARD', 'GIFT', 'TRADE']);

export const InventoryItemSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    itemDefinitionId: z.string().uuid(),
    status: ItemStatusSchema,
    quantity: z.number().int().min(1).default(1),
    acquiredAt: z.number().int(),
    acquiredFrom: AcquisitionSourceSchema,
    purchaseId: z.string().uuid().nullable(),
    equippedAt: z.number().int().nullable(),
    slot: EquipmentSlotSchema.nullable(),
    usesRemaining: z.number().int().min(0).nullable(),
    enhancementLevel: z.number().int().min(0).default(0),
    metadata: z.record(z.unknown()).nullable(),
    deletedAt: z.number().int().nullable(),
    deletedReason: z.string().max(200).nullable(),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .strict();

export const InventoryCapacitySchema = z
  .object({
    maxSlots: z.number().int().min(1).default(100),
    usedSlots: z.number().int().min(0).default(0),
    maxStackSize: z.number().int().min(1).default(99),
    canStack: z.boolean().default(true),
  })
  .strict();

export const InventoryStateSchema = z
  .object({
    userId: z.string().uuid(),
    items: z.array(InventoryItemSchema),
    capacity: InventoryCapacitySchema,
    totalValue: z.number().int().min(0).default(0),
    lastSyncedAt: z.number().int(),
  })
  .strict();

export const LoadoutItemSchema = z
  .object({
    id: z.string().uuid(),
    itemDefinitionId: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    iconUrl: z.string().optional(),
    rarity: ItemRaritySchema,
    quantity: z.number().int().min(0),
    usesRemaining: z.number().int().min(0).nullable(),
    compatible: z.boolean(),
    incompatibilityReason: z.string().optional(),
    projectedImpact: z.object({
      xpMultiplier: z.number().default(1),
      coinMultiplier: z.number().default(1),
      streakProtection: z.boolean().default(false),
      bossDamageBonus: z.number().default(0),
      extraPauses: z.number().default(0),
    }),
  })
  .strict();

export const ActiveBuffSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    iconUrl: z.string().optional(),
    expiresAt: z.number().nullable(),
    effects: z.object({
      xpMultiplier: z.number().default(1),
      coinMultiplier: z.number().default(1),
      streakProtection: z.boolean().default(false),
      bossDamageBonus: z.number().default(0),
      extraPauses: z.number().default(0),
    }),
  })
  .strict();

export const LoadoutSummarySchema = z
  .object({
    totalItems: z.number().int().min(0),
    usableItems: z.number().int().min(0),
    activeBuffs: z.number().int().min(0),
    projectedXpMultiplier: z.number().default(1),
    projectedCoinMultiplier: z.number().default(1),
    hasStreakProtection: z.boolean().default(false),
    totalExtraPauses: z.number().default(0),
  })
  .strict();

export const LoadoutOptionsSchema = z
  .object({
    available: z.array(LoadoutItemSchema),
    activeBuffs: z.array(ActiveBuffSchema),
    summary: LoadoutSummarySchema,
    offlineRestrictions: z.array(z.string()),
  })
  .strict();

export const UseItemResultSchema = z
  .object({
    success: z.boolean(),
    itemId: z.string().uuid(),
    effectApplied: z.boolean(),
    effectType: z.string().nullable(),
    quantityConsumed: z.number().int().min(0),
    remainingQuantity: z.number().int().min(0),
    message: z.string(),
  })
  .strict();

export const EquipItemResultSchema = z
  .object({
    success: z.boolean(),
    itemId: z.string().uuid(),
    previousItemId: z.string().uuid().nullable(),
    slot: EquipmentSlotSchema,
    bonusesApplied: z.array(z.string()),
  })
  .strict();

export const UnequipItemResultSchema = z
  .object({
    success: z.boolean(),
    itemId: z.string().uuid(),
    slot: EquipmentSlotSchema,
    bonusesRemoved: z.array(z.string()),
  })
  .strict();

export const DestroyItemResultSchema = z
  .object({
    success: z.boolean(),
    itemId: z.string().uuid(),
    quantityDestroyed: z.number().int().min(1),
    materialsRecovered: z.array(
      z
        .object({
          itemDefinitionId: z.string().uuid(),
          quantity: z.number().int().min(1),
        })
        .strict(),
    ),
  })
  .strict();

export const InventoryFilterSchema = z
  .object({
    types: z.array(ItemTypeSchema).optional(),
    rarities: z.array(ItemRaritySchema).optional(),
    status: z.array(ItemStatusSchema).optional(),
    slots: z.array(EquipmentSlotSchema).optional(),
    searchQuery: z.string().optional(),
    minQuantity: z.number().int().min(1).optional(),
    acquiredAfter: z.number().int().optional(),
    acquiredBefore: z.number().int().optional(),
    sortBy: z.enum(['acquiredAt', 'name', 'rarity', 'quantity']).default('acquiredAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();