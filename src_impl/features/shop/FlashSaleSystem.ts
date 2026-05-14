/**
 * Flash Sale System
 *
 * Phase 15.6 - Flash sale system with appointments and urgency mechanics.
 *
 * Features:
 * - 1-3 times per week flash sales (configurable via LiveOps)
 * - 1-hour duration for each flash sale
 * - 50% discount on featured item
 * - Push notification support
 * - Shop banner with countdown
 * - Appointment mechanics to drive engagement
 */

import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

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

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a random flash sale time within the week
 * Returns UTC timestamps for start and end
 */
export function generateFlashSaleTime(config: FlashSaleConfig, weekStart: Date = new Date()): { startsAt: number; endsAt: number } {
  // Start from beginning of current week (Monday)
  const startOfWeek = new Date(weekStart);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = startOfWeek.getUTCDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - daysToSubtract);

  // Random day of the week (0-6, where 0 is Monday)
  const randomDay = Math.floor(Math.random() * 7);

  // Random hour between 10:00 and 20:00 UTC (peak activity hours)
  const randomHour = 10 + Math.floor(Math.random() * 10);

  // Random minute
  const randomMinute = Math.floor(Math.random() * 60);

  const startsAt = new Date(startOfWeek);
  startsAt.setUTCDate(startOfWeek.getUTCDate() + randomDay);
  startsAt.setUTCHours(randomHour, randomMinute, 0, 0);

  const endsAt = new Date(startsAt);
  endsAt.setUTCMinutes(startsAt.getUTCMinutes() + config.saleDurationMinutes);

  return {
    startsAt: startsAt.getTime(),
    endsAt: endsAt.getTime(),
  };
}

/**
 * Check if a flash sale is currently active
 */
export function isFlashSaleActive(flashSale: FlashSale): boolean {
  const now = Date.now();
  return now >= flashSale.startsAt && now < flashSale.endsAt;
}

/**
 * Get time remaining in a flash sale
 */
export function getFlashSaleTimeRemaining(flashSale: FlashSale): number {
  const now = Date.now();
  return Math.max(0, flashSale.endsAt - now);
}

/**
 * Format flash sale countdown for display
 */
export function formatFlashSaleCountdown(ms: number): string {
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Check if notification should be sent
 */
export function shouldSendNotification(flashSale: FlashSale, config: FlashSaleConfig): boolean {
  if (!config.notificationEnabled) {
    return false;
  }

  const now = Date.now();
  const notificationTime = flashSale.startsAt - config.notificationMinutesBefore * 60 * 1000;

  // Send notification if we're within the notification window
  return now >= notificationTime && now < flashSale.startsAt;
}

// ============================================================================
// Flash Sale Manager
// ============================================================================

export class FlashSaleManager {
  private config: FlashSaleConfig;
  private currentSale: FlashSale | null = null;
  private scheduledSales: FlashSale[] = [];
  private listeners: Set<(sale: FlashSale | null) => void> = new Set();

  constructor(config: Partial<FlashSaleConfig> = {}) {
    this.config = FlashSaleConfigSchema.parse(config);
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<FlashSaleConfig>): void {
    this.config = FlashSaleConfigSchema.parse({ ...this.config, ...config });
  }

  /**
   * Get current configuration
   */
  getConfig(): FlashSaleConfig {
    return this.config;
  }

  /**
   * Schedule flash sales for the week
   */
  scheduleWeeklySales(
    availableItems: Array<{
      id: string;
      name: string;
      icon: string;
      description: string;
      baseValue: number;
      currency: 'COINS' | 'GEMS';
    }>,
  ): FlashSale[] {
    const numSales = this.config.minFlashSalesPerWeek + Math.floor(Math.random() * (this.config.maxFlashSalesPerWeek - this.config.minFlashSalesPerWeek + 1));

    this.scheduledSales = [];

    for (let i = 0; i < numSales; i++) {
      // Select random item
      const item = availableItems[Math.floor(Math.random() * availableItems.length)];

      // Calculate discounted price
      const discountedPrice = Math.ceil(item.baseValue * (1 - this.config.discountPercent / 100));

      // Generate random sale time
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

    // Sort by start time
    this.scheduledSales.sort((a, b) => a.startsAt - b.startsAt);

    return this.scheduledSales;
  }

  /**
   * Get the currently active flash sale
   */
  getCurrentSale(): FlashSale | null {
    const now = Date.now();

    // Check if current sale is still active
    if (this.currentSale && now >= this.currentSale.startsAt && now < this.currentSale.endsAt) {
      return this.currentSale;
    }

    // Look for a new active sale
    const activeSale = this.scheduledSales.find((sale) => now >= sale.startsAt && now < sale.endsAt);

    if (activeSale) {
      this.currentSale = { ...activeSale, isActive: true };
      this.notifyListeners();
      return this.currentSale;
    }

    // No active sale
    if (this.currentSale) {
      this.currentSale = null;
      this.notifyListeners();
    }

    return null;
  }

  /**
   * Get upcoming flash sales
   */
  getUpcomingSales(): FlashSale[] {
    const now = Date.now();
    return this.scheduledSales.filter((sale) => sale.startsAt > now);
  }

  /**
   * Get next upcoming sale
   */
  getNextSale(): FlashSale | null {
    const upcoming = this.getUpcomingSales();
    return upcoming[0] || null;
  }

  /**
   * Check if a flash sale notification should be sent
   */
  checkNotification(): FlashSale | null {
    const now = Date.now();

    for (const sale of this.scheduledSales) {
      if (shouldSendNotification(sale, this.config) && !sale.isActive && now < sale.startsAt) {
        return sale;
      }
    }

    return null;
  }

  /**
   * Subscribe to flash sale updates
   */
  onSaleChange(callback: (sale: FlashSale | null) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of a change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentSale));
  }

  /**
   * Purchase an item from flash sale
   */
  async purchaseItem(quantity: number = 1): Promise<{
    success: boolean;
    error?: string;
    remainingQuantity?: number;
  }> {
    if (!this.currentSale || !this.currentSale.isActive) {
      return { success: false, error: 'Flash sale is not active' };
    }

    // Simulate purchase (would be replaced with actual API call)
    this.currentSale.soldQuantity += quantity;

    return {
      success: true,
      remainingQuantity: this.currentSale.totalQuantity ? this.currentSale.totalQuantity - this.currentSale.soldQuantity : undefined,
    };
  }
}

// ============================================================================
// Default Instance
// ============================================================================

export const defaultFlashSaleManager = new FlashSaleManager();

export default FlashSaleManager;
