/**
 * Item Service
 * Business logic for item definitions and effects
 *
 * Dependencies:
 * - Inventory (items are stored in inventory)
 * - Economy (items have value, can be bought/sold)
 * - Events (effects can trigger events)
 */

import { getSupabaseClient } from "../../config/supabase";
import * as analytics from "./analytics";
import { ItemDefinitionSchema, EffectResultSchema, GetItemDefinitionInputSchema, ApplyItemEffectInputSchema, GetItemsByTypeInputSchema, GetItemsByRarityInputSchema, DropTableSchema, type ItemDefinition, type EffectResult, type ItemEffect, type GetItemDefinitionInput, type ApplyItemEffectInput, type GetItemsByTypeInput, type GetItemsByRarityInput, type DropTable } from "./schemas";
import type { ActiveEffect, EffectType } from "./effects";

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : "Unknown error"}`);
    this.name = "RepositoryError";
  }
}

const supabase = getSupabaseClient();

// ============================================================================
// Item Definition Cache
// ============================================================================

const itemCache = new Map<string, ItemDefinition>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const cacheTimestamps = new Map<string, number>();

function isCacheValid(itemId: string): boolean {
  const timestamp = cacheTimestamps.get(itemId);
  if (!timestamp) {
    return false;
  }
  return Date.now() - timestamp < CACHE_TTL;
}

function cacheItem(item: ItemDefinition): void {
  itemCache.set(item.id, item);
  cacheTimestamps.set(item.id, Date.now());
}

// ============================================================================
// Item Definition Queries
// ============================================================================

export async function getItemDefinition(itemDefinitionId: string): Promise<ItemDefinition | null> {
  // Check cache
  if (isCacheValid(itemDefinitionId)) {
    return itemCache.get(itemDefinitionId) ?? null;
  }

  const { data, error } = await supabase.from("item_definitions").select("*").eq("id", itemDefinitionId).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new RepositoryError("getItemDefinition", error);
  }

  const definition = ItemDefinitionSchema.parse(data);
  cacheItem(definition);
  return definition;
}

export async function getItemDefinitionByName(name: string): Promise<ItemDefinition | null> {
  const { data, error } = await supabase.from("item_definitions").select("*").eq("name", name).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new RepositoryError("getItemDefinitionByName", error);
  }

  return ItemDefinitionSchema.parse(data);
}

export async function getItemsByType(input: GetItemsByTypeInput): Promise<ItemDefinition[]> {
  const validated = GetItemsByTypeInputSchema.parse(input);

  let query = supabase.from("item_definitions").select("*").eq("type", validated.type);

  if (!validated.includeUnavailable) {
    query = query.eq("is_available", true);
  }

  const { data, error } = await query.order("rarity", { ascending: false });

  if (error) {
    throw new RepositoryError("getItemsByType", error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getItemsByRarity(input: GetItemsByRarityInput): Promise<ItemDefinition[]> {
  const validated = GetItemsByRarityInputSchema.parse(input);

  let query = supabase.from("item_definitions").select("*").eq("rarity", validated.rarity);

  if (!validated.includeUnavailable) {
    query = query.eq("is_available", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new RepositoryError("getItemsByRarity", error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getAllAvailableItems(): Promise<ItemDefinition[]> {
  const { data, error } = await supabase.from("item_definitions").select("*").eq("is_available", true).order("type", { ascending: true }).order("rarity", { ascending: false });

  if (error) {
    throw new RepositoryError("getAllAvailableItems", error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getShopItems(): Promise<ItemDefinition[]> {
  const { data, error } = await supabase.from("item_definitions").select("*").eq("is_available", true).not("shop_price", "is", null).order("shop_price->>amount", { ascending: true });

  if (error) {
    throw new RepositoryError("getShopItems", error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getCraftableItems(): Promise<ItemDefinition[]> {
  const { data, error } = await supabase.from("item_definitions").select("*").eq("is_available", true).not("crafting_recipe", "is", null).order("required_level", { ascending: true });

  if (error) {
    throw new RepositoryError("getCraftableItems", error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getItemsByLevel(maxLevel: number, minLevel: number = 1): Promise<ItemDefinition[]> {
  const { data, error } = await supabase.from("item_definitions").select("*").eq("is_available", true).gte("required_level", minLevel).lte("required_level", maxLevel);

  if (error) {
    throw new RepositoryError("getItemsByLevel", error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

// ============================================================================
// Item Effects
// ============================================================================

export async function applyItemEffect(definition: ItemDefinition, userId: string, targetId?: string): Promise<EffectResult> {
  const { effectStore, applyImmediateEffect, applyDurationEffect, applyChargeEffect } = await import("./effects");

  const appliedEffects: ActiveEffect[] = [];
  const failedEffects: Array<{ type: string; reason: string }> = [];

  for (const effect of definition.effects) {
    try {
      let result;

      // Convert duration unit to seconds
      let durationSeconds = effect.duration;
      if (effect.durationUnit === "MINUTES") {
        durationSeconds = effect.duration * 60;
      } else if (effect.durationUnit === "HOURS") {
        durationSeconds = effect.duration * 3600;
      } else if (effect.durationUnit === "DAYS") {
        durationSeconds = effect.duration * 86400;
      }

      // Determine effect category and apply appropriately
      switch (effect.type) {
        case "HEAL":
        case "REVIVE":
        case "TIME_EXTENSION":
          // Immediate effects
          result = await applyImmediateEffect(userId, effect.type as EffectType, effect.value, definition.id);
          break;

        case "SHIELD":
        case "STREAK_PROTECTION":
          // Charge-based effects
          result = await applyChargeEffect(userId, effect.type as EffectType, Math.floor(effect.value), definition.id);
          break;

        case "BOOST_XP":
        case "BOOST_COINS":
        case "BOOST_DAMAGE":
        case "BONUS_DEFENSE":
        case "FOCUS_ENHANCEMENT":
        default:
          // Duration-based effects
          result = await applyDurationEffect(
            userId,
            effect.type as EffectType,
            effect.value,
            durationSeconds || 1800, // Default 30 minutes
            definition.id,
          );
          break;
      }

      if (result.success && result.appliedEffects.length > 0) {
        appliedEffects.push(...result.appliedEffects);
      } else {
        failedEffects.push({
          type: effect.type,
          reason: result.message || "Unknown failure",
        });
      }
    } catch (error) {
      failedEffects.push({
        type: effect.type,
        reason: error instanceof Error ? error.message : "Exception",
      });
    }
  }

  analytics.trackItemEffectApplied(
    userId,
    definition.id,
    appliedEffects.map((e) => e.type),
  );

  return {
    success: appliedEffects.length > 0,
    effectType: appliedEffects.length > 0 ? appliedEffects[0].type : null,
    message: appliedEffects.length > 0 ? `Applied ${appliedEffects.length} effect${appliedEffects.length > 1 ? "s" : ""}` : failedEffects.length > 0 ? `Failed: ${failedEffects.map((f) => f.type).join(", ")}` : "No effects applied",
    appliedEffects,
    failedEffects: failedEffects.map((f) => ({ type: f.type, reason: f.reason })),
    conflicts: [],
  };
}

export async function getActiveEffects(userId: string): Promise<ActiveEffect[]> {
  const { effectStore } = await import("./effects");
  return effectStore.getByUser(userId);
}

export async function hasActiveEffect(userId: string, effectType: string): Promise<boolean> {
  const { effectStore } = await import("./effects");
  return effectStore.getByType(userId, effectType as EffectType).length > 0;
}

export async function getEffectMultiplier(userId: string, type: "XP" | "COINS" | "DAMAGE"): Promise<number> {
  const { getEffectMultiplier } = await import("./effects");
  return getEffectMultiplier(userId, type);
}

export async function consumeShieldCharge(userId: string): Promise<boolean> {
  const { useShieldCharge } = await import("./effects");
  return useShieldCharge(userId);
}

export async function consumeStreakProtection(userId: string): Promise<boolean> {
  const { useStreakProtection } = await import("./effects");
  return useStreakProtection(userId);
}

// ============================================================================
// Crafting
// ============================================================================

export async function canCraftItem(
  itemDefinitionId: string,
  userId: string,
  hasIngredients: (itemDefId: string, quantity: number) => Promise<boolean>,
): Promise<{
  canCraft: boolean;
  missingIngredients: Array<{ itemDefinitionId: string; quantity: number; available: number }>;
  requiredLevel: number;
}> {
  const definition = await getItemDefinition(itemDefinitionId);

  if (!definition || !definition.craftingRecipe) {
    return {
      canCraft: false,
      missingIngredients: [],
      requiredLevel: 0,
    };
  }

  const missingIngredients: Array<{ itemDefinitionId: string; quantity: number; available: number }> = [];

  for (const ingredient of definition.craftingRecipe.ingredients) {
    const hasEnough = await hasIngredients(ingredient.itemDefinitionId, ingredient.quantity);
    if (!hasEnough) {
      missingIngredients.push({
        itemDefinitionId: ingredient.itemDefinitionId,
        quantity: ingredient.quantity,
        available: 0, // Would get actual available count
      });
    }
  }

  return {
    canCraft: missingIngredients.length === 0,
    missingIngredients,
    requiredLevel: definition.craftingRecipe.requiredLevel,
  };
}

// ============================================================================
// Drop Tables
// ============================================================================

export async function getDropTable(tableId: string): Promise<DropTable | null> {
  const { data, error } = await supabase.from("drop_tables").select("*").eq("id", tableId).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new RepositoryError("getDropTable", error);
  }

  return DropTableSchema.parse(data);
}

export function rollDropTable(table: DropTable): Array<{ itemDefinitionId: string; quantity: number }> {
  const results: Array<{ itemDefinitionId: string; quantity: number }> = [];

  // Add guaranteed drops
  for (const itemId of table.guaranteedDrops) {
    results.push({ itemDefinitionId: itemId, quantity: 1 });
  }

  // Roll for random drops
  for (let i = 0; i < table.rollCount; i++) {
    const roll = Math.random() * table.totalWeight;
    let cumulativeWeight = 0;

    for (const entry of table.entries) {
      cumulativeWeight += entry.weight;
      if (roll <= cumulativeWeight) {
        const quantity = Math.floor(Math.random() * (entry.maxQuantity - entry.minQuantity + 1)) + entry.minQuantity;
        results.push({ itemDefinitionId: entry.itemDefinitionId, quantity });
        break;
      }
    }
  }

  return results;
}

// ============================================================================
// Item Pricing
// ============================================================================

export function calculateItemValue(definition: ItemDefinition, quantity: number = 1, enhancementLevel: number = 0): number {
  let value = definition.baseValue * quantity;

  // Enhancement multiplier
  if (enhancementLevel > 0) {
    value *= 1 + enhancementLevel * 0.2; // 20% per level
  }

  return Math.floor(value);
}

export function canPurchase(definition: ItemDefinition, userLevel: number): { canPurchase: boolean; reason: string | null } {
  if (!definition.isAvailable) {
    return { canPurchase: false, reason: "Item not available" };
  }

  if (definition.availableFrom && Date.now() < definition.availableFrom) {
    return { canPurchase: false, reason: "Item not yet available" };
  }

  if (definition.availableUntil && Date.now() > definition.availableUntil) {
    return { canPurchase: false, reason: "Item no longer available" };
  }

  if (userLevel < definition.requiredLevel) {
    return { canPurchase: false, reason: `Requires level ${definition.requiredLevel}` };
  }

  if (!definition.shopPrice) {
    return { canPurchase: false, reason: "Item not for sale" };
  }

  return { canPurchase: true, reason: null };
}

// ============================================================================
// Item Comparison
// ============================================================================

export function compareItems(
  itemA: ItemDefinition,
  itemB: ItemDefinition,
): {
  betterStats: string[];
  worseStats: string[];
  equalStats: string[];
} {
  const betterStats: string[] = [];
  const worseStats: string[] = [];
  const equalStats: string[] = [];

  // Compare base value
  if (itemA.baseValue > itemB.baseValue) {
    betterStats.push("Value");
  } else if (itemA.baseValue < itemB.baseValue) {
    worseStats.push("Value");
  } else {
    equalStats.push("Value");
  }

  // Compare passive effects (for equipment)
  if (itemA.type === "EQUIPMENT" && itemB.type === "EQUIPMENT") {
    const effectSumA = itemA.passiveEffects.reduce((sum, e) => sum + e.value, 0);
    const effectSumB = itemB.passiveEffects.reduce((sum, e) => sum + e.value, 0);

    if (effectSumA > effectSumB) {
      betterStats.push("Effects");
    } else if (effectSumA < effectSumB) {
      worseStats.push("Effects");
    } else {
      equalStats.push("Effects");
    }
  }

  // Compare rarity
  const rarityOrder = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];
  const rarityA = rarityOrder.indexOf(itemA.rarity);
  const rarityB = rarityOrder.indexOf(itemB.rarity);

  if (rarityA > rarityB) {
    betterStats.push("Rarity");
  } else if (rarityA < rarityB) {
    worseStats.push("Rarity");
  } else {
    equalStats.push("Rarity");
  }

  return { betterStats, worseStats, equalStats };
}
