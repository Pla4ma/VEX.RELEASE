/**
 * Inventory Events
 */

export interface InventoryEventDefinitions {
  'inventory:add_item': {
    userId: string;
    itemId: string;
    rarity: string;
    source: string;
  };
  'inventory:remove_item': {
    userId: string;
    itemId: string;
    quantity: number;
    source: string;
  };
  'collection:item_acquired': {
    userId: string;
    setId: string;
    itemId: string;
    itemName: string;
    rarity: string;
    isNew: boolean;
  };
  'collection:completed': {
    userId: string;
    setId: string;
    rewards: unknown;
  };
  'collection:bonus_claimed': {
    userId: string;
    setId: string;
    bonusId: string;
  };
}
