import { z } from "zod";


export const ItemRaritySchema = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);

export const ItemTypeSchema = z.enum([
  'CONSUMABLE',
  'EQUIPMENT',
  'COSMETIC',
  'CRAFTING',
  'COLLECTIBLE',
]);

export const EquipmentSlotSchema = z.enum([
  'HEAD',
  'BODY',
  'HANDS',
  'FEET',
  'ACCESSORY_1',
  'ACCESSORY_2',
  'FOCUS_TOOL',
  'PET',
]);

export const ItemEffectTypeSchema = z.enum([
  'HEAL',
  'BOOST_XP',
  'BOOST_COINS',
  'BOOST_STREAK',
  'SHIELD',
  'REVIVE',
  'BONUS_DAMAGE',
  'BONUS_DEFENSE',
  'TIME_EXTENSION',
  'FOCUS_ENHANCEMENT',
  'STREAK_PROTECTION',
  'BOOST_DAMAGE',
  'BOOST_DEFENSE',
]);

export const ItemEffectSchema = z.object({
  type: ItemEffectTypeSchema,
  value: z.number(),
  duration: z.number().int().min(0).default(0), // 0 = instant
  durationUnit: z.enum(['SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'SESSIONS']).default('SECONDS'),
  target: z.enum(['SELF', 'SQUAD', 'ALL']).default('SELF'),
}).strict();

export const PassiveEffectSchema = z.object({
  type: z.string(),
  value: z.number(),
  condition: z.string().optional(), // e.g., "during_boss_fight"
}).strict();

export const IngredientSchema = z.object({
  itemDefinitionId: z.string().uuid(),
  quantity: z.number().int().min(1),
}).strict();

export const CraftingRecipeSchema = z.object({
  ingredients: z.array(IngredientSchema).min(1),
  requiredLevel: z.number().int().min(1).default(1),
  craftingTime: z.number().int().min(0).default(0), // seconds
  successRate: z.number().min(0).max(1).default(1),
}).strict();

export const ItemDefinitionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),

  // Classification
  type: ItemTypeSchema,
  rarity: ItemRaritySchema,

  // Visual
  iconUrl: z.string().url().nullable(),
  animationUrl: z.string().url().nullable(),

  // Properties
  stackable: z.boolean().default(true),
  maxStackSize: z.number().int().min(1).default(99),
  unique: z.boolean().default(false), // Can only own one
  tradable: z.boolean().default(true),

  // For consumables
  maxUses: z.number().int().min(1).nullable(),
  effects: z.array(ItemEffectSchema).default([]),

  // For equipment
  equipmentSlot: EquipmentSlotSchema.nullable(),
  passiveEffects: z.array(PassiveEffectSchema).default([]),

  // For crafting
  craftingRecipe: CraftingRecipeSchema.nullable(),

  // Pricing
  baseValue: z.number().int().min(0).default(0), // For selling/dismantling
  shopPrice: z.object({
    currency: z.enum(['COINS', 'GEMS']),
    amount: z.number().int().min(0),
  }).nullable(),

  // Requirements
  requiredLevel: z.number().int().min(1).default(1),
  requiredItems: z.array(z.string().uuid()).default([]), // Must own these items

  // Metadata
  tags: z.array(z.string()).default([]),
  category: z.string().default('general'),

  // Availability
  isAvailable: z.boolean().default(true),
  availableFrom: z.number().int().nullable(),
  availableUntil: z.number().int().nullable(),

  createdAt: z.number().int(),
  updatedAt: z.number().int(),
}).strict();

export const EffectResultSchema = z.object({
  success: z.boolean(),
  effectType: z.string().nullable(),
  message: z.string(),
  appliedEffects: z.array(z.record(z.unknown())).default([]),
  failedEffects: z.array(z.object({
    type: z.string(),
    reason: z.string(),
  })).default([]),
  conflicts: z.array(z.record(z.unknown())).default([]),
}).strict();

export const GetItemDefinitionInputSchema = z.object({
  itemDefinitionId: z.string().uuid(),
}).strict();

export const ApplyItemEffectInputSchema = z.object({
  itemDefinitionId: z.string().uuid(),
  userId: z.string().uuid(),
  targetId: z.string().uuid().optional(),
}).strict();

export const GetItemsByTypeInputSchema = z.object({
  type: ItemTypeSchema,
  includeUnavailable: z.boolean().default(false),
}).strict();

export const GetItemsByRarityInputSchema = z.object({
  rarity: ItemRaritySchema,
  includeUnavailable: z.boolean().default(false),
}).strict();

export const DropEntrySchema = z.object({
  itemDefinitionId: z.string().uuid(),
  weight: z.number().int().min(1),
  minQuantity: z.number().int().min(1).default(1),
  maxQuantity: z.number().int().min(1).default(1),
}).strict();

export const DropTableSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  entries: z.array(DropEntrySchema),
  totalWeight: z.number().int().min(1),
  rollCount: z.number().int().min(1).default(1),
  guaranteedDrops: z.array(z.string().uuid()).default([]),
}).strict();