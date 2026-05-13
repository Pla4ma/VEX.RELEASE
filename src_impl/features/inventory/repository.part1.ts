import { getSupabaseClient } from "../../config/supabase";
import { InventoryItemSchema, type InventoryItem, type ItemStatus, type EquipmentSlot, type AcquisitionSource } from "./schemas";


export async function fetchUserInventory(
  userId: string,
  options: {
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  } = {},
): Promise<InventoryItem[]> {
  let query = supabase.from('inventory_items').select('*').eq('user_id', userId);

  if (!options.includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 100)
    .range(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 100) - 1);

  if (error) {
    throw new RepositoryError('fetchUserInventory', error);
  }
  return InventoryItemSchema.array().parse(data ?? []);
}

export async function fetchInventoryItemById(itemId: string): Promise<InventoryItem | null> {
  const { data, error } = await supabase.from('inventory_items').select('*').eq('id', itemId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchInventoryItemById', error);
  }

  return InventoryItemSchema.parse(data);
}

export async function fetchInventoryItemsByDefinition(userId: string, itemDefinitionId: string, status?: ItemStatus): Promise<InventoryItem[]> {
  let query = supabase.from('inventory_items').select('*').eq('user_id', userId).eq('item_definition_id', itemDefinitionId).is('deleted_at', null);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new RepositoryError('fetchInventoryItemsByDefinition', error);
  }
  return InventoryItemSchema.array().parse(data ?? []);
}

export async function fetchEquippedItems(userId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase.from('inventory_items').select('*').eq('user_id', userId).eq('status', 'EQUIPPED').is('deleted_at', null);

  if (error) {
    throw new RepositoryError('fetchEquippedItems', error);
  }
  return InventoryItemSchema.array().parse(data ?? []);
}

export async function fetchItemInSlot(userId: string, slot: EquipmentSlot): Promise<InventoryItem | null> {
  const { data, error } = await supabase.from('inventory_items').select('*').eq('user_id', userId).eq('slot', slot).eq('status', 'EQUIPPED').is('deleted_at', null).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchItemInSlot', error);
  }

  return InventoryItemSchema.parse(data);
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
  const now = Date.now();
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      user_id: item.userId,
      item_definition_id: item.itemDefinitionId,
      status: item.status,
      quantity: item.quantity,
      acquired_at: item.acquiredAt,
      acquired_from: item.acquiredFrom,
      purchase_id: item.purchaseId,
      equipped_at: item.equippedAt,
      slot: item.slot,
      uses_remaining: item.usesRemaining,
      enhancement_level: item.enhancementLevel,
      metadata: item.metadata,
      deleted_at: item.deletedAt,
      deleted_reason: item.deletedReason,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new RepositoryError('createInventoryItem', error);
  }
  return InventoryItemSchema.parse(data);
}

export async function updateInventoryItem(itemId: string, updates: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'userId'>>): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      status: updates.status,
      quantity: updates.quantity,
      equipped_at: updates.equippedAt,
      slot: updates.slot,
      uses_remaining: updates.usesRemaining,
      enhancement_level: updates.enhancementLevel,
      metadata: updates.metadata,
      deleted_at: updates.deletedAt,
      deleted_reason: updates.deletedReason,
      updated_at: Date.now(),
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('updateInventoryItem', error);
  }
  return InventoryItemSchema.parse(data);
}

export async function updateItemQuantity(itemId: string, newQuantity: number): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({
      quantity: newQuantity,
      updated_at: Date.now(),
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('updateItemQuantity', error);
  }
  return InventoryItemSchema.parse(data);
}

export async function markItemDeleted(itemId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .update({
      status: 'DESTROYED',
      deleted_at: Date.now(),
      deleted_reason: reason,
      updated_at: Date.now(),
    })
    .eq('id', itemId);

  if (error) {
    throw new RepositoryError('markItemDeleted', error);
  }
}