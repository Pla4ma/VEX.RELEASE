import { ShopEvent } from "./types";


export function createShopVisitedEvent(userId: string, shopId: string, shopType: string, visitType: 'browse' | 'search' | 'specific' | 'promotion', context: DynamicValue, expectations: DynamicValue): ShopVisitedEvent {
  return {
    id: generateEventId(),
    type: 'shop_visited',
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
    metadata: createEventMetadata('shop'),
  };
}

export function createProductViewedEvent(userId: string, productId: string, productName: string, productType: string, viewDuration: number, context: DynamicValue, interactions: DynamicValue, engagement: DynamicValue): ProductViewedEvent {
  return {
    id: generateEventId(),
    type: 'product_viewed',
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
    metadata: createEventMetadata('shop'),
  };
}

export function createProductAddedToCartEvent(userId: string, productId: string, productName: string, quantity: number, price: number, currency: string, context: DynamicValue, cartState: DynamicValue, decision: DynamicValue): ProductAddedToCartEvent {
  return {
    id: generateEventId(),
    type: 'product_added_to_cart',
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
    metadata: createEventMetadata('shop'),
  };
}

export function createPurchaseCompletedEvent(userId: string, transactionId: string, completedAt: Date, completionTime: number, status: 'success' | 'failed' | 'pending' | 'cancelled', items: DynamicValue[], totals: DynamicValue, payment: DynamicValue, delivery: DynamicValue): PurchaseCompletedEvent {
  return {
    id: generateEventId(),
    type: 'purchase_completed',
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
    metadata: createEventMetadata('shop'),
  };
}

export function createPromotionAppliedEvent(userId: string, promotionId: string, promotionName: string, discount: DynamicValue, context: DynamicValue, impact: DynamicValue): PromotionAppliedEvent {
  return {
    id: generateEventId(),
    type: 'promotion_applied',
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
    metadata: createEventMetadata('shop'),
  };
}

export function validateShopEvent(event: ShopEventType): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'shop_visited':
      return validateShopVisitedEvent(event as ShopVisitedEvent);
    case 'product_viewed':
      return validateProductViewedEvent(event as ProductViewedEvent);
    case 'product_added_to_cart':
      return validateProductAddedToCartEvent(event as ProductAddedToCartEvent);
    case 'purchase_completed':
      return validatePurchaseCompletedEvent(event as PurchaseCompletedEvent);
    case 'promotion_applied':
      return validatePromotionAppliedEvent(event as PromotionAppliedEvent);
    default:
      return true;
  }
}

export function serializeShopEvent(event: ShopEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeShopEvent(data: string): ShopEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}