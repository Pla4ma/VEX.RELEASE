import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as service from "../service";
import type { UseItemInput, EquipItemInput, UnequipItemInput, DestroyItemInput, StackItemsInput, SplitStackInput, SetQuickUseSlotInput, InventoryFilter, InventoryState } from "../schemas";


export function useSetQuickUseSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetQuickUseSlotInput) => service.setQuickUseSlot(input),
    onSuccess: (result, input) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.quickUse(input.userId),
      });
    },
  });
}