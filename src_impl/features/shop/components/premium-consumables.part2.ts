import type { ItemDefinition } from "../../items/schemas";


export function getPremiumConsumableDefinition(itemId: string): ItemDefinition | undefined {
  return PREMIUM_CONSUMABLES.find((item) => item.id === itemId);
}

export function isPremiumConsumable(itemId: string): boolean {
  return PREMIUM_CONSUMABLES.some((item) => item.id === itemId);
}

export function getPremiumConsumableIds(): string[] {
  return PREMIUM_CONSUMABLES.map((item) => item.id);
}

export function getPremiumConsumablePrice(itemId: string): { currency: 'COINS' | 'GEMS'; amount: number } | null {
  const item = PREMIUM_CONSUMABLES.find((i) => i.id === itemId);
  return item?.shopPrice ?? null;
}