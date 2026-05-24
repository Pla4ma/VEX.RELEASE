import { z } from 'zod';

export const FlashSaleConfigSchema = z.object({
  enabled: z.boolean().default(true),
  minFlashSalesPerWeek: z.number().min(1).max(7).default(1),
  maxFlashSalesPerWeek: z.number().min(1).max(7).default(3),
  saleDurationMinutes: z.number().min(30).max(180).default(60),
  discountPercent: z.number().min(10).max(90).default(50),
  eligibleItemCategories: z.array(z.string()).default(['CONSUMABLE', 'EQUIPMENT', 'COSMETIC']),
  minItemLevel: z.number().min(1).default(1),
  maxItemLevel: z.number().min(1).default(100),
  notificationEnabled: z.boolean().default(true),
  notificationMinutesBefore: z.number().min(0).max(30).default(5),
});

export const FlashSaleSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  itemName: z.string(),
  itemIcon: z.string(),
  itemDescription: z.string(),
  originalPrice: z.number(),
  discountedPrice: z.number(),
  currency: z.enum(['COINS', 'GEMS']),
  discountPercent: z.number(),
  startsAt: z.number(),
  endsAt: z.number(),
  isActive: z.boolean(),
  totalQuantity: z.number().optional(),
  soldQuantity: z.number().default(0),
  isFlashSale: z.literal(true),
});

export type FlashSaleConfig = z.infer<typeof FlashSaleConfigSchema>;
export type FlashSale = z.infer<typeof FlashSaleSchema>;

export interface ShopItemInput {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseValue: number;
  currency: 'COINS' | 'GEMS';
}

export function generateFlashSaleTime(
  config: FlashSaleConfig,
  weekStart: Date = new Date(),
): { startsAt: number; endsAt: number } {
  const startOfWeek = new Date(weekStart);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = startOfWeek.getUTCDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysToSubtract);
  const randomDay = Math.floor(Math.random() * 7);
  const randomHour = 10 + Math.floor(Math.random() * 10);
  const randomMinute = Math.floor(Math.random() * 60);
  const startsAt = new Date(startOfWeek);
  startsAt.setUTCDate(startOfWeek.getUTCDate() + randomDay);
  startsAt.setUTCHours(randomHour, randomMinute, 0, 0);
  const endsAt = new Date(startsAt);
  endsAt.setUTCMinutes(startsAt.getUTCMinutes() + config.saleDurationMinutes);
  return { startsAt: startsAt.getTime(), endsAt: endsAt.getTime() };
}

export function isFlashSaleActive(flashSale: FlashSale): boolean {
  const now = Date.now();
  return now >= flashSale.startsAt && now < flashSale.endsAt;
}

export function getFlashSaleTimeRemaining(flashSale: FlashSale): number {
  const now = Date.now();
  return Math.max(0, flashSale.endsAt - now);
}

export function formatFlashSaleCountdown(ms: number): string {
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function shouldSendNotification(
  flashSale: FlashSale,
  config: FlashSaleConfig,
): boolean {
  if (!config.notificationEnabled) {return false;}
  const now = Date.now();
  const notificationTime = flashSale.startsAt - config.notificationMinutesBefore * 60 * 1000;
  return now >= notificationTime && now < flashSale.startsAt;
}
