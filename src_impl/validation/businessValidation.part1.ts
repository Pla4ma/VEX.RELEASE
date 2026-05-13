

export const validateECommerceOrder = (order: DynamicValue, _context: BusinessContext): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];

  // Order structure validation
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  // Customer validation
  if (!order.customer) {
    errors.push('Customer information is required');
  } else {
    if (!order.customer.email) {
      errors.push('Customer email is required');
    }

    if (!order.customer.shippingAddress) {
      errors.push('Shipping address is required');
    }

    if (!order.customer.billingAddress && order.paymentMethod !== 'cash') {
      warnings.push('Billing address recommended for payment processing');
    }
  }

  // Payment validation
  if (!order.paymentMethod) {
    errors.push('Payment method is required');
  } else {
    const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'];
    if (!validPaymentMethods.includes(order.paymentMethod)) {
      errors.push('Invalid payment method');
    }
  }

  // Items validation
  let totalAmount = 0;
  let totalWeight = 0;

  if (order.items) {

    for (const item of order.items) {
      if (!item.productId) {
        errors.push('Item product ID is required');
      }

      if (!item.quantity || item.quantity <= 0) {
        errors.push('Item quantity must be positive');
      }

      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push('Item unit price must be positive');
      }

      if (item.quantity > 100) {
        warnings.push(`Large quantity for item ${item.productId}: ${item.quantity}`);
      }

      totalAmount += item.quantity * item.unitPrice;
      totalWeight += (item.weight || 0) * item.quantity;
    }

    // Order amount validation
    if (order.totalAmount && Math.abs(order.totalAmount - totalAmount) > 0.01) {
      errors.push('Order total amount does not match calculated total');
    }

    // Large order validation
    if (totalAmount > 10000) {
      businessRules.push('Large order detected - requires manager approval');
      recommendations.push('Consider splitting large orders into multiple shipments');
    }

    // Weight validation for shipping
    if (totalWeight > 50) {
      warnings.push('Order weight exceeds standard shipping limits');
      recommendations.push('Consider freight shipping for heavy orders');
    }
  }

  // Shipping validation
  if (order.shippingMethod) {
    const validShippingMethods = ['standard', 'express', 'overnight', 'freight'];
    if (!validShippingMethods.includes(order.shippingMethod)) {
      errors.push('Invalid shipping method');
    }

    if (order.shippingMethod === 'overnight' && totalWeight > 10) {
      errors.push('Overnight shipping not available for orders over 10kg');
    }
  }

  // Discount validation
  if (order.discountCode) {
    if (!order.discountAmount || order.discountAmount <= 0) {
      errors.push('Discount amount must be positive when discount code is provided');
    }

    if (order.discountAmount > totalAmount * 0.5) {
      businessRules.push('Discount exceeds 50% of order total');
      warnings.push('Large discount applied - review required');
    }
  }

  // Business hours validation
  const now = new Date();
  const hour = now.getHours();

  if (order.shippingMethod === 'overnight' && (hour < 9 || hour > 17)) {
    warnings.push('Overnight shipping ordered outside business hours');
    recommendations.push('Order may be processed next business day');
  }

  // Inventory validation (simulated)
  if (order.items) {
    for (const item of order.items) {
      if (item.quantity > 10) {
        businessRules.push(`High quantity for ${item.productId} - check inventory`);
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

export const validateFinancialTransaction = (transaction: DynamicValue, context: BusinessContext): BusinessValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];

  // Transaction basic validation
  if (!transaction.type) {
    errors.push('Transaction type is required');
  } else {
    const validTypes = ['deposit', 'withdrawal', 'transfer', 'payment', 'refund'];
    if (!validTypes.includes(transaction.type)) {
      errors.push('Invalid transaction type');
    }
  }

  if (!transaction.amount || transaction.amount <= 0) {
    errors.push('Transaction amount must be positive');
  }

  if (transaction.amount > 1000000) {
    businessRules.push('Large transaction amount detected - compliance review required');
    warnings.push('Transaction exceeds standard limits');
  }

  // Account validation
  if (!transaction.fromAccount) {
    errors.push('Source account is required');
  }

  if (transaction.type === 'transfer' && !transaction.toAccount) {
    errors.push('Destination account is required for transfers');
  }

  // Currency validation
  if (transaction.currency) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    if (!validCurrencies.includes(transaction.currency)) {
      errors.push('Invalid currency');
    }
  } else if (context.currency) {
    transaction.currency = context.currency;
    warnings.push('Using default currency from context');
  }

  // Daily limits validation
  if (transaction.amount > 10000) {
    businessRules.push('Transaction exceeds daily limit');
    recommendations.push('Consider breaking into smaller transactions');
  }

  // AML (Anti-Money Laundering) checks
  if (transaction.amount > 50000) {
    businessRules.push('High-value transaction - AML check required');
    warnings.push('Transaction requires compliance review');
  }

  // Frequency validation
  if (transaction.frequency === 'recurring') {
    if (!transaction.interval || !transaction.endDate) {
      errors.push('Recurring transactions require interval and end date');
    }

    if (transaction.interval === 'daily' && transaction.amount > 1000) {
      warnings.push('High-frequency recurring transaction detected');
    }
  }

  // Business hours validation
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  if (transaction.amount > 50000 && (hour < 9 || hour > 17 || dayOfWeek === 0 || dayOfWeek === 6)) {
    businessRules.push('Large transaction outside business hours');
    warnings.push('Transaction will be reviewed next business day');
  }

  // International transaction validation
  if (transaction.toAccount && transaction.toAccount.country !== transaction.fromAccount.country) {
    businessRules.push('International transaction detected');
    warnings.push('International transfers may have additional fees');

    if (transaction.amount > 10000) {
      businessRules.push('International transaction exceeds reporting threshold');
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