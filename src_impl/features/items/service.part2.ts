import { getSupabaseClient } from "../../config/supabase";
import * as analytics from "./analytics";
import { ItemDefinitionSchema, EffectResultSchema, GetItemDefinitionInputSchema, ApplyItemEffectInputSchema, GetItemsByTypeInputSchema, GetItemsByRarityInputSchema, DropTableSchema, type ItemDefinition, type EffectResult, type ItemEffect, type GetItemDefinitionInput, type ApplyItemEffectInput, type GetItemsByTypeInput, type GetItemsByRarityInput, type DropTable } from "./schemas";
import type { ActiveEffect, EffectType } from "./effects";


export async function getActiveEffects(userId: string): Promise<ActiveEffect[]> {
  const { effectStore } = await import('./effects');
  return effectStore.getByUser(userId);
}

export async function hasActiveEffect(userId: string, effectType: string): Promise<boolean> {
  const { effectStore } = await import('./effects');
  return effectStore.getByType(userId, effectType as EffectType).length > 0;
}

export async function getEffectMultiplier(userId: string, type: 'XP' | 'COINS' | 'DAMAGE'): Promise<number> {
  const { getEffectMultiplier } = await import('./effects');
  return getEffectMultiplier(userId, type);
}

export async function consumeShieldCharge(userId: string): Promise<boolean> {
  const { useShieldCharge } = await import('./effects');
  return useShieldCharge(userId);
}

export async function consumeStreakProtection(userId: string): Promise<boolean> {
  const { useStreakProtection } = await import('./effects');
  return useStreakProtection(userId);
}

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

export async function getDropTable(tableId: string): Promise<DropTable | null> {
  const { data, error } = await supabase['from']('drop_tables').select('*').eq('id', tableId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('getDropTable', error);
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
    return { canPurchase: false, reason: 'Item not available' };
  }

  if (definition.availableFrom && Date.now() < definition.availableFrom) {
    return { canPurchase: false, reason: 'Item not yet available' };
  }

  if (definition.availableUntil && Date.now() > definition.availableUntil) {
    return { canPurchase: false, reason: 'Item no longer available' };
  }

  if (userLevel < definition.requiredLevel) {
    return { canPurchase: false, reason: `Requires level ${definition.requiredLevel}` };
  }

  if (!definition.shopPrice) {
    return { canPurchase: false, reason: 'Item not for sale' };
  }

  return { canPurchase: true, reason: null };
}

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
    betterStats.push('Value');
  } else if (itemA.baseValue < itemB.baseValue) {
    worseStats.push('Value');
  } else {
    equalStats.push('Value');
  }

  // Compare passive effects (for equipment)
  if (itemA.type === 'EQUIPMENT' && itemB.type === 'EQUIPMENT') {
    const effectSumA = itemA.passiveEffects.reduce((sum, e) => sum + e.value, 0);
    const effectSumB = itemB.passiveEffects.reduce((sum, e) => sum + e.value, 0);

    if (effectSumA > effectSumB) {
      betterStats.push('Effects');
    } else if (effectSumA < effectSumB) {
      worseStats.push('Effects');
    } else {
      equalStats.push('Effects');
    }
  }

  // Compare rarity
  const rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  const rarityA = rarityOrder.indexOf(itemA.rarity);
  const rarityB = rarityOrder.indexOf(itemB.rarity);

  if (rarityA > rarityB) {
    betterStats.push('Rarity');
  } else if (rarityA < rarityB) {
    worseStats.push('Rarity');
  } else {
    equalStats.push('Rarity');
  }

  return { betterStats, worseStats, equalStats };
}