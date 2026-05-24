import {
  ShopVisitedEvent,
  ProductViewedEvent,
  ProductAddedToCartEvent,
  PurchaseCompletedEvent,
  PromotionAppliedEvent,
  EventMetadata,
  DeviceInfo,
} from "./types";

export function createShopVisitedEvent(
  userId: string,
  shopId: string,
  shopType: string,
  visitType: "browse" | "search" | "specific" | "promotion",
  context: ShopVisitedEvent['data']['context'],
  expectations: ShopVisitedEvent['data']['expectations'],
): ShopVisitedEvent {
  return {
    id: generateEventId(),
    type: "shop_visited",
    userId,
    timestamp: new Date(),
    data: {
      shopId,
      shopType,
      visitType,
      enteredAt: new Date(),
      context,
      expectations,
    },
    metadata: createEventMetadata("shop"),
  };
}
export function createProductViewedEvent(
  userId: string,
  productId: string,
  productName: string,
  productType: string,
  viewDuration: number,
  context: ProductViewedEvent['data']['context'],
  interactions: ProductViewedEvent['data']['interactions'],
  engagement: ProductViewedEvent['data']['engagement'],
): ProductViewedEvent {
  return {
    id: generateEventId(),
    type: "product_viewed",
    userId,
    timestamp: new Date(),
    data: {
      productId,
      productName,
      productType,
      viewedAt: new Date(),
      viewDuration,
      context,
      interactions,
      engagement,
    },
    metadata: createEventMetadata("shop"),
  };
}
export function createProductAddedToCartEvent(
  userId: string,
  productId: string,
  productName: string,
  quantity: number,
  price: number,
  currency: string,
  context: ProductAddedToCartEvent['data']['context'],
  cartState: ProductAddedToCartEvent['data']['cartState'],
  decision: ProductAddedToCartEvent['data']['decision'],
): ProductAddedToCartEvent {
  return {
    id: generateEventId(),
    type: "product_added_to_cart",
    userId,
    timestamp: new Date(),
    data: {
      productId,
      productName,
      quantity,
      price,
      currency,
      addedAt: new Date(),
      context,
      cartState,
      decision,
    },
    metadata: createEventMetadata("shop"),
  };
}
export function createPurchaseCompletedEvent(
  userId: string,
  transactionId: string,
  completedAt: Date,
  completionTime: number,
  status: "success" | "failed" | "pending" | "cancelled",
  items: PurchaseCompletedEvent['data']['items'],
  totals: PurchaseCompletedEvent['data']['totals'],
  payment: PurchaseCompletedEvent['data']['payment'],
  delivery: PurchaseCompletedEvent['data']['delivery'],
): PurchaseCompletedEvent {
  return {
    id: generateEventId(),
    type: "purchase_completed",
    userId,
    timestamp: new Date(),
    data: {
      transactionId,
      completedAt,
      completionTime,
      status,
      items,
      totals,
      payment,
      delivery,
    },
    metadata: createEventMetadata("shop"),
  };
}
export function createPromotionAppliedEvent(
  userId: string,
  promotionId: string,
  promotionName: string,
  discount: PromotionAppliedEvent['data']['discount'],
  context: PromotionAppliedEvent['data']['context'],
  impact: PromotionAppliedEvent['data']['impact'],
): PromotionAppliedEvent {
  return {
    id: generateEventId(),
    type: "promotion_applied",
    userId,
    timestamp: new Date(),
    data: {
      promotionId,
      promotionName,
      appliedAt: new Date(),
      discount,
      context,
      impact,
    },
    metadata: createEventMetadata("shop"),
  };
}
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function createEventMetadata(source: string): EventMetadata {
  return { source, version: "1.0.0", platform: getPlatform() };
}
function getPlatform(): string {
  if (typeof window !== "undefined") {
    return "web";
  }
  return "unknown";
}
