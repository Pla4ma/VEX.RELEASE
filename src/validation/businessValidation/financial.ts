import type { BusinessContext, BusinessValidationResult } from "./types";

export const validateFinancialTransaction = (
  transaction: Record<string, unknown>,
  context: BusinessContext,
): BusinessValidationResult => {
  const t = transaction as Record<string, unknown>;
  const txAmount = t.amount as number | undefined;
  const fromAccount = t.fromAccount as Record<string, unknown> | undefined;
  const toAccount = t.toAccount as Record<string, unknown> | undefined;
  const errors: string[] = [];
  const warnings: string[] = [];
  const businessRules: string[] = [];
  const recommendations: string[] = [];
  if (!t.type) {
    errors.push("Transaction type is required");
  } else {
    const validTypes = [
      "deposit",
      "withdrawal",
      "transfer",
      "payment",
      "refund",
    ];
    if (!validTypes.includes(t.type as string)) {
      errors.push("Invalid transaction type");
    }
  }
  if (!txAmount || txAmount <= 0) {
    errors.push("Transaction amount must be positive");
  }
  if (txAmount && txAmount > 1000000) {
    businessRules.push(
      "Large transaction amount detected - compliance review required",
    );
    warnings.push("Transaction exceeds standard limits");
  }
  if (!fromAccount) {
    errors.push("Source account is required");
  }
  if (t.type === "transfer" && !toAccount) {
    errors.push("Destination account is required for transfers");
  }
  if (t.currency) {
    const validCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
    if (!validCurrencies.includes(t.currency as string)) {
      errors.push("Invalid currency");
    }
  } else if (context.currency) {
    t.currency = context.currency;
    warnings.push("Using default currency from context");
  }
  if (txAmount && txAmount > 10000) {
    businessRules.push("Transaction exceeds daily limit");
    recommendations.push("Consider breaking into smaller transactions");
  }
  if (txAmount && txAmount > 50000) {
    businessRules.push("High-value transaction - AML check required");
    warnings.push("Transaction requires compliance review");
  }
  if (t.frequency === "recurring") {
    if (!t.interval || !t.endDate) {
      errors.push("Recurring transactions require interval and end date");
    }
    if (t.interval === "daily" && txAmount && txAmount > 1000) {
      warnings.push("High-frequency recurring transaction detected");
    }
  }
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  if (
    txAmount &&
    txAmount > 50000 &&
    (hour < 9 || hour > 17 || dayOfWeek === 0 || dayOfWeek === 6)
  ) {
    businessRules.push("Large transaction outside business hours");
    warnings.push("Transaction will be reviewed next business day");
  }
  if (toAccount && toAccount.country !== fromAccount?.country) {
    businessRules.push("International transaction detected");
    warnings.push("International transfers may have additional fees");
    if (txAmount && txAmount > 10000) {
      businessRules.push(
        "International transaction exceeds reporting threshold",
      );
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
