/**
 * Inventory Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from '../service';
import type {
  UseItemInput,
  EquipItemInput,
  UnequipItemInput,
  DestroyItemInput,
  StackItemsInput,
  SplitStackInput,
  SetQuickUseSlotInput,
  InventoryFilter,
  InventoryState,
} from '../schemas';

// ============================================================================
// Query Keys
// ============================================================================
// ============================================================================
// Inventory Queries
// ============================================================================
// ============================================================================
// Item Usage Mutations
// ============================================================================
// ============================================================================
// Equipment Mutations
// ============================================================================
// ============================================================================
// Item Management Mutations
// ============================================================================
export * from "./index.part1";
export * from "./index.part2";
