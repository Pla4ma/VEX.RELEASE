import { z } from "zod";


export const AddItemToInventoryInputSchema = z
  .object({
    userId: z.string().uuid(),
    itemDefinitionId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    acquiredFrom: AcquisitionSourceSchema,
    purchaseId: z.string().uuid().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const RemoveItemFromInventoryInputSchema = z
  .object({
    userId: z.string().uuid(),
    inventoryItemId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    reason: z.string().min(1).max(200),
  })
  .strict();

export const UseItemInputSchema = z
  .object({
    userId: z.string().uuid(),
    inventoryItemId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    targetId: z.string().uuid().optional(), // For targeted effects
  })
  .strict();

export const EquipItemInputSchema = z
  .object({
    userId: z.string().uuid(),
    inventoryItemId: z.string().uuid(),
    slot: EquipmentSlotSchema,
  })
  .strict();

export const UnequipItemInputSchema = z
  .object({
    userId: z.string().uuid(),
    inventoryItemId: z.string().uuid(),
  })
  .strict();

export const DestroyItemInputSchema = z
  .object({
    userId: z.string().uuid(),
    inventoryItemId: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    reason: z.string().min(1).max(200),
  })
  .strict();

export const StackItemsInputSchema = z
  .object({
    userId: z.string().uuid(),
    targetItemId: z.string().uuid(),
    sourceItemIds: z.array(z.string().uuid()).min(1),
  })
  .strict();

export const SplitStackInputSchema = z
  .object({
    userId: z.string().uuid(),
    inventoryItemId: z.string().uuid(),
    splitQuantity: z.number().int().min(1),
  })
  .strict();

export const SetQuickUseSlotInputSchema = z
  .object({
    userId: z.string().uuid(),
    slotIndex: z.number().int().min(0).max(3),
    inventoryItemId: z.string().uuid().nullable(),
  })
  .strict();

export const ItemStackSchema = z
  .object({
    itemDefinitionId: z.string().uuid(),
    totalQuantity: z.number().int().min(0),
    instances: z.array(InventoryItemSchema),
    canStackMore: z.boolean(),
    maxStackSize: z.number().int().min(1),
  })
  .strict();