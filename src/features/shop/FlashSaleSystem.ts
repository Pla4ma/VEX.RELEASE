import {
  FlashSaleConfigSchema,
  generateFlashSaleTime,
  shouldSendNotification,
} from './flash-sale-utils';
import type {
  FlashSaleConfig,
  FlashSale,
  ShopItemInput,
} from './flash-sale-utils';

export { FlashSaleConfigSchema, FlashSaleSchema } from './flash-sale-utils';
export type { FlashSaleConfig, FlashSale, ShopItemInput } from './flash-sale-utils';
export {
  generateFlashSaleTime,
  isFlashSaleActive,
  getFlashSaleTimeRemaining,
  formatFlashSaleCountdown,
  shouldSendNotification,
} from './flash-sale-utils';

function pickRandomItem(availableItems: ShopItemInput[]): ShopItemInput | null {
  if (availableItems.length === 0) {return null;}
  return availableItems[Math.floor(Math.random() * availableItems.length)]!;
}

export class FlashSaleManager {
  private config: FlashSaleConfig;
  private currentSale: FlashSale | null = null;
  private scheduledSales: FlashSale[] = [];
  private listeners: Set<(sale: FlashSale | null) => void> = new Set();

  constructor(config: Partial<FlashSaleConfig> = {}) {
    this.config = FlashSaleConfigSchema.parse(config);
  }

  setConfig(config: Partial<FlashSaleConfig>): void {
    this.config = FlashSaleConfigSchema.parse({ ...this.config, ...config });
  }

  getConfig(): FlashSaleConfig {
    return this.config;
  }

  scheduleWeeklySales(availableItems: ShopItemInput[]): FlashSale[] {
    const numSales =
      this.config.minFlashSalesPerWeek +
      Math.floor(
        Math.random() *
          (this.config.maxFlashSalesPerWeek - this.config.minFlashSalesPerWeek + 1),
      );
    this.scheduledSales = [];
    for (let i = 0; i < numSales; i++) {
      const item = pickRandomItem(availableItems);
      if (!item) {continue;}
      const discountedPrice = Math.ceil(
        item.baseValue * (1 - this.config.discountPercent / 100),
      );
      const { startsAt, endsAt } = generateFlashSaleTime(this.config);
      const sale: FlashSale = {
        id: `flash-sale-${i}-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        itemIcon: item.icon,
        itemDescription: item.description,
        originalPrice: item.baseValue,
        discountedPrice,
        currency: item.currency,
        discountPercent: this.config.discountPercent,
        startsAt,
        endsAt,
        isActive: false,
        isFlashSale: true,
        soldQuantity: 0,
      };
      this.scheduledSales.push(sale);
    }
    this.scheduledSales.sort((a, b) => a.startsAt - b.startsAt);
    return this.scheduledSales;
  }

  getCurrentSale(): FlashSale | null {
    const now = Date.now();
    if (
      this.currentSale &&
      now >= this.currentSale.startsAt &&
      now < this.currentSale.endsAt
    ) {
      return this.currentSale;
    }
    const activeSale = this.scheduledSales.find(
      (sale) => now >= sale.startsAt && now < sale.endsAt,
    );
    if (activeSale) {
      this.currentSale = { ...activeSale, isActive: true };
      this.notifyListeners();
      return this.currentSale;
    }
    if (this.currentSale) {
      this.currentSale = null;
      this.notifyListeners();
    }
    return null;
  }

  getUpcomingSales(): FlashSale[] {
    const now = Date.now();
    return this.scheduledSales.filter((sale) => sale.startsAt > now);
  }

  getNextSale(): FlashSale | null {
    const upcoming = this.getUpcomingSales();
    return upcoming[0] ?? null;
  }

  checkNotification(): FlashSale | null {
    const now = Date.now();
    for (const sale of this.scheduledSales) {
      if (
        shouldSendNotification(sale, this.config) &&
        !sale.isActive &&
        now < sale.startsAt
      ) {
        return sale;
      }
    }
    return null;
  }

  onSaleChange(callback: (sale: FlashSale | null) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentSale));
  }

  async purchaseItem(quantity: number = 1): Promise<{
    success: boolean;
    error?: string;
    remainingQuantity?: number;
  }> {
    if (!this.currentSale || !this.currentSale.isActive) {
      return { success: false, error: 'Flash sale is not active' };
    }
    this.currentSale.soldQuantity += quantity;
    return {
      success: true,
      remainingQuantity: this.currentSale.totalQuantity
        ? this.currentSale.totalQuantity - this.currentSale.soldQuantity
        : undefined,
    };
  }
}

export const defaultFlashSaleManager = new FlashSaleManager();
export default FlashSaleManager;
