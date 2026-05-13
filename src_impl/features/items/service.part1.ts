import { getSupabaseClient } from "../../config/supabase";
import * as analytics from "./analytics";
import { ItemDefinitionSchema, EffectResultSchema, GetItemDefinitionInputSchema, ApplyItemEffectInputSchema, GetItemsByTypeInputSchema, GetItemsByRarityInputSchema, DropTableSchema, type ItemDefinition, type EffectResult, type ItemEffect, type GetItemDefinitionInput, type ApplyItemEffectInput, type GetItemsByTypeInput, type GetItemsByRarityInput, type DropTable } from "./schemas";
import type { ActiveEffect, EffectType } from "./effects";


export async function getItemDefinition(itemDefinitionId: string): Promise<ItemDefinition | null> {
  // Check cache
  if (isCacheValid(itemDefinitionId)) {
    return itemCache.get(itemDefinitionId) ?? null;
  }

  const { data, error } = await supabase['from']('item_definitions').select('*').eq('id', itemDefinitionId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('getItemDefinition', error);
  }

  const definition = ItemDefinitionSchema.parse(data);
  cacheItem(definition);
  return definition;
}

export async function getItemDefinitionByName(name: string): Promise<ItemDefinition | null> {
  const { data, error } = await supabase['from']('item_definitions').select('*').eq('name', name).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('getItemDefinitionByName', error);
  }

  return ItemDefinitionSchema.parse(data);
}

export async function getItemsByType(input: GetItemsByTypeInput): Promise<ItemDefinition[]> {
  const validated = GetItemsByTypeInputSchema.parse(input);

  let query = supabase['from']('item_definitions').select('*').eq('type', validated.type);

  if (!validated.includeUnavailable) {
    query = query.eq('is_available', true);
  }

  const { data, error } = await query.order('rarity', { ascending: false });

  if (error) {
    throw new RepositoryError('getItemsByType', error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getItemsByRarity(input: GetItemsByRarityInput): Promise<ItemDefinition[]> {
  const validated = GetItemsByRarityInputSchema.parse(input);

  let query = supabase['from']('item_definitions').select('*').eq('rarity', validated.rarity);

  if (!validated.includeUnavailable) {
    query = query.eq('is_available', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new RepositoryError('getItemsByRarity', error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getAllAvailableItems(): Promise<ItemDefinition[]> {
  const { data, error } = await supabase['from']('item_definitions').select('*').eq('is_available', true).order('type', { ascending: true }).order('rarity', { ascending: false });

  if (error) {
    throw new RepositoryError('getAllAvailableItems', error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getShopItems(): Promise<ItemDefinition[]> {
  const { data, error } = await supabase['from']('item_definitions').select('*').eq('is_available', true).not('shop_price', 'is', null).order('shop_price->>amount', { ascending: true });

  if (error) {
    throw new RepositoryError('getShopItems', error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getCraftableItems(): Promise<ItemDefinition[]> {
  const { data, error } = await supabase['from']('item_definitions').select('*').eq('is_available', true).not('crafting_recipe', 'is', null).order('required_level', { ascending: true });

  if (error) {
    throw new RepositoryError('getCraftableItems', error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function getItemsByLevel(maxLevel: number, minLevel: number = 1): Promise<ItemDefinition[]> {
  const { data, error } = await supabase['from']('item_definitions').select('*').eq('is_available', true).gte('required_level', minLevel).lte('required_level', maxLevel);

  if (error) {
    throw new RepositoryError('getItemsByLevel', error);
  }
  return ItemDefinitionSchema.array().parse(data ?? []);
}

export async function applyItemEffect(definition: ItemDefinition, userId: string, targetId?: string): Promise<EffectResult> {
  const { effectStore, applyImmediateEffect, applyDurationEffect, applyChargeEffect } = await import('./effects');

  const appliedEffects: ActiveEffect[] = [];
  const failedEffects: Array<{ type: string; reason: string }> = [];

  for (const effect of definition.effects) {
    try {
      let result;

      // Convert duration unit to seconds
      let durationSeconds = effect.duration;
      if (effect.durationUnit === 'MINUTES') {
        durationSeconds = effect.duration * 60;
      } else if (effect.durationUnit === 'HOURS') {
        durationSeconds = effect.duration * 3600;
      } else if (effect.durationUnit === 'DAYS') {
        durationSeconds = effect.duration * 86400;
      }

      // Determine effect category and apply appropriately
      switch (effect.type) {
        case 'HEAL':
        case 'REVIVE':
        case 'TIME_EXTENSION':
          // Immediate effects
          result = await applyImmediateEffect(userId, effect.type as EffectType, effect.value, definition.id);
          break;

        case 'SHIELD':
        case 'STREAK_PROTECTION':
          // Charge-based effects
          result = await applyChargeEffect(userId, effect.type as EffectType, Math.floor(effect.value), definition.id);
          break;

        case 'BOOST_XP':
        case 'BOOST_COINS':
        case 'BOOST_DAMAGE':
        case 'BONUS_DEFENSE':
        case 'FOCUS_ENHANCEMENT':
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
          reason: result.message || 'Unknown failure',
        });
      }
    } catch (error) {
      failedEffects.push({
        type: effect.type,
        reason: error instanceof Error ? error.message : 'Exception',
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
    message: appliedEffects.length > 0 ? `Applied ${appliedEffects.length} effect${appliedEffects.length > 1 ? 's' : ''}` : failedEffects.length > 0 ? `Failed: ${failedEffects.map((f) => f.type).join(', ')}` : 'No effects applied',
    appliedEffects,
    failedEffects: failedEffects.map((f) => ({ type: f.type, reason: f.reason })),
    conflicts: [],
  };
}