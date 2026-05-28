import type { BusinessContext, BusinessValidationResult } from "./types";

export const validateECommerceOrder = (
  order: Record<string, unknown>,
  _context: BusinessContext,
): BusinessValidationResult => {
  const o = order as Record<
    string,
    | Record<string, unknown>
    | Array<Record<string, unknown>>
    | string
    | number
    | boolean
    | null
    | undefined
  >;
  const customer = o.customer as Record<string, unknown> | undefined;
  const items = (o.items as Array<Record<string, unknown>>) ?? [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  if (!items || items.length === 0) {
    errors.push("Order must contain at least one item");
  }
  if (!customer) {
    errors.push("Customer information is required");
  } else {
    if (!customer.email) {
      errors.push("Customer email is required");
    }
    if (!customer.shippingAddress) {
      errors.push("Shipping address is required");
    }
    if (!customer.billingAddress && order.paymentMethod !== "cash") {
      warnings.push("Billing address recommended for payment processing");
    }
  }
  if (!order.paymentMethod) {
    errors.push("Payment method is required");
  } else {
    const validPaymentMethods = [
      "credit_card",
      "debit_card",
      "paypal",
      "cash",
      "bank_transfer",
    ];
    if (!validPaymentMethods.includes(order.paymentMethod as string)) {
      errors.push("Invalid payment method");
    }
  }
  let totalAmount = 0;
  let totalWeight = 0;
  if (items) {
    for (const item of items) {
      if (!item.productId) {
        errors.push("Item product ID is required");
      }
      if (!item.quantity || (item.quantity as number) <= 0) {
        errors.push("Item quantity must be positive");
      }
      if (!item.unitPrice || (item.unitPrice as number) <= 0) {
        errors.push("Item unit price must be positive");
      }
      if ((item.quantity as number) > 100) {
        warnings.push(
          `Large quantity for item ${item.productId}: ${item.quantity}`,
        );
      }
      totalAmount += (item.quantity as number) * (item.unitPrice as number);
      totalWeight += ((item.weight as number) || 0) * (item.quantity as number);
    }
    if (
      order.totalAmount &&
      Math.abs((order.totalAmount as number) - totalAmount) > 0.01
    ) {
      errors.push("Order total amount does not match calculated total");
    }
    if (totalAmount > 10000) {
      businessRules.push("Large order detected - requires manager approval");
      recommendations.push(
        "Consider splitting large orders into multiple shipments",
      );
    }
    if (totalWeight > 50) {
      warnings.push("Order weight exceeds standard shipping limits");
      recommendations.push("Consider freight shipping for heavy orders");
    }
  }
  if (order.shippingMethod) {
    const validShippingMethods = [
      "standard",
      "express",
      "overnight",
      "freight",
    ];
    if (!validShippingMethods.includes(order.shippingMethod as string)) {
      errors.push("Invalid shipping method");
    }
    if (order.shippingMethod === "overnight" && totalWeight > 10) {
      errors.push("Overnight shipping not available for orders over 10kg");
    }
  }
  if (order.discountCode) {
    if (!order.discountAmount || (order.discountAmount as number) <= 0) {
      errors.push(
        "Discount amount must be positive when discount code is provided",
      );
    }
    if ((order.discountAmount as number) > totalAmount * 0.5) {
      businessRules.push("Discount exceeds 50% of order total");
      warnings.push("Large discount applied - review required");
    }
  }
  const now = new Date();
  const hour = now.getHours();
  if (order.shippingMethod === "overnight" && (hour < 9 || hour > 17)) {
    warnings.push("Overnight shipping ordered outside business hours");
    recommendations.push("Order may be processed next business day");
  }
  if (items) {
    for (const item of items) {
      if ((item.quantity as number) > 10) {
        businessRules.push(
          `High quantity for ${item.productId} - check inventory`,
        );
      }
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    businessRules,
    recommendations,
  };
};
