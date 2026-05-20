import {
  ShopVisitedEvent,
  ProductViewedEvent,
  ProductAddedToCartEvent,
  PurchaseCompletedEvent,
  PromotionAppliedEvent,
  ShopEventType,
} from "./types";

export function validateShopEvent(event: ShopEventType): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }
  if (!event.type || !event.data || !event.metadata) {
    return false;
  }
  switch (event.type) {
    case "shop_visited":
      return validateShopVisitedEvent(event as ShopVisitedEvent);
    case "product_viewed":
      return validateProductViewedEvent(event as ProductViewedEvent);
    case "product_added_to_cart":
      return validateProductAddedToCartEvent(event as ProductAddedToCartEvent);
    case "purchase_completed":
      return validatePurchaseCompletedEvent(event as PurchaseCompletedEvent);
    case "promotion_applied":
      return validatePromotionAppliedEvent(event as PromotionAppliedEvent);
    default:
      return true;
  }
}
function validateShopVisitedEvent(event: ShopVisitedEvent): boolean {
  const { data } = event;
  return !!(
    data.shopId &&
    data.shopType &&
    data.visitType &&
    data.enteredAt &&
    data.context &&
    data.expectations
  );
}
function validateProductViewedEvent(event: ProductViewedEvent): boolean {
  const { data } = event;
  return !!(
    data.productId &&
    data.productName &&
    data.productType &&
    data.viewedAt &&
    typeof data.viewDuration === "number" &&
    data.context &&
    data.interactions &&
    data.engagement
  );
}
function validateProductAddedToCartEvent(
  event: ProductAddedToCartEvent,
): boolean {
  const { data } = event;
  return !!(
    data.productId &&
    data.productName &&
    typeof data.quantity === "number" &&
    typeof data.price === "number" &&
    data.currency &&
    data.addedAt &&
    data.context &&
    data.cartState &&
    data.decision
  );
}
function validatePurchaseCompletedEvent(
  event: PurchaseCompletedEvent,
): boolean {
  const { data } = event;
  return !!(
    data.transactionId &&
    data.completedAt &&
    typeof data.completionTime === "number" &&
    data.status &&
    data.items &&
    data.totals &&
    data.payment &&
    data.delivery
  );
}
function validatePromotionAppliedEvent(event: PromotionAppliedEvent): boolean {
  const { data } = event;
  return !!(
    data.promotionId &&
    data.promotionName &&
    data.appliedAt &&
    data.discount &&
    data.context &&
    data.impact
  );
}
export function serializeShopEvent(event: ShopEventType): string {
  return JSON.stringify({ ...event, timestamp: event.timestamp.toISOString() });
}
export function deserializeShopEvent(data: string): ShopEventType {
  const parsed = JSON.parse(data);
  return { ...parsed, timestamp: new Date(parsed.timestamp) };
}
