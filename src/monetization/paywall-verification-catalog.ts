/**
 * Paywall Verification - Product Catalog Validator
 */

import type { PurchasesOffering } from "../shared/monetization/revenuecat-types";
import { createDebugger } from "../utils/debug";
import { revenueCatService } from "../shared/monetization/revenuecat-service";

const debug = createDebugger("paywall-verification:catalog");

export async function verifyProductCatalog(): Promise<{
  valid: boolean;
  issues: string[];
  warnings: string[];
}> {
  debug.info("Verifying product catalog...");

  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    const offeringsResult = await revenueCatService.getOfferings();

    if (!offeringsResult.success) {
      return {
        valid: false,
        issues: ["Failed to get offerings from RevenueCat"],
        warnings: [],
      };
    }

    const { offerings } = offeringsResult;
    const currentOffering = offerings?.current;

    if (!currentOffering) {
      warnings.push("No current offering configured");
      return { valid: true, issues, warnings };
    }

    const packages = currentOffering.availablePackages;
    if (packages.length === 0) {
      issues.push("Current offering has no available packages");
      return { valid: false, issues, warnings };
    }

    for (const pkg of packages) {
      const productIssues = validateProductPackage(pkg);
      issues.push(...productIssues);

      const pricingIssues = validateProductPricing(pkg);
      issues.push(...pricingIssues);

      const metadataIssues = validateProductMetadata(pkg);
      issues.push(...metadataIssues);
    }

    const valid = issues.length === 0;
    return { valid, issues, warnings };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error("Product catalog verification failed:", error);

    return {
      valid: false,
      issues: [`Product catalog verification failed: ${errorMessage}`],
      warnings: [`Verification error: ${errorMessage}`],
    };
  }
}

function validateProductPackage(
  pkg: PurchasesOffering["availablePackages"][number],
): string[] {
  const issues: string[] = [];

  if (!pkg.identifier) {
    issues.push("Package missing required identifier");
  }

  if (!pkg.product.description) {
    issues.push("Package product missing required description");
  }

  return issues;
}

function validateProductPricing(
  pkg: PurchasesOffering["availablePackages"][number],
): string[] {
  const issues: string[] = [];
  const { price } = pkg.product;

  if (typeof price !== "number" || price <= 0) {
    issues.push(`Package has invalid price: ${price}`);
    return issues;
  }

  if (price < 0.99) {
    issues.push(`Product price too low: $${price}`);
  } else if (price > 999.99) {
    issues.push(`Product price too high: $${price}`);
  }

  if (!pkg.product.currencyCode) {
    issues.push("Package product missing currency code");
  }

  return issues;
}

function validateProductMetadata(
  pkg: PurchasesOffering["availablePackages"][number],
): string[] {
  const issues: string[] = [];
  const requiredFields: (keyof typeof pkg)[] = ["identifier"];

  for (const field of requiredFields) {
    if (!pkg[field]) {
      issues.push(`Package missing required field: ${field}`);
    }
  }

  if (!pkg.product.title) {
    issues.push("Package product missing required title");
  }

  return issues;
}
