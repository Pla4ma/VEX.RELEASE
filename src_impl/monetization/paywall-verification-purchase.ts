/**
 * Paywall Verification - Purchase Flow & Subscription Validator
 */

import Purchases, {
  type PurchasesPackage,
  type PurchasesOffering,
  type PurchasesOfferings,
} from "react-native-purchases";
import { createDebugger } from "../utils/debug";
import { revenueCatService } from "../shared/monetization/revenuecat-service";
import type { PurchaseResult } from "../shared/monetization/revenuecat-types";

const debug = createDebugger("paywall-verification:purchase");

export async function verifyPurchaseFlow(): Promise<{
  valid: boolean;
  issues: string[];
  warnings: string[];
}> {
  debug.info("Verifying purchase flow...");

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

    const currentOffering = offeringsResult.offerings?.current;
    if (!currentOffering || currentOffering.availablePackages.length === 0) {
      warnings.push("No packages available for purchase flow test");
      return { valid: true, issues, warnings };
    }

    const testPackage = currentOffering.availablePackages[0]!;
    const purchaseIssues = await testPurchaseFlow(testPackage);
    issues.push(...purchaseIssues);

    const valid = issues.length === 0;
    return { valid, issues, warnings };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error("Purchase flow verification failed:", error);

    return {
      valid: false,
      issues: [`Purchase flow verification failed: ${errorMessage}`],
      warnings: [`Verification error: ${errorMessage}`],
    };
  }
}

async function testPurchaseFlow(pkg: PurchasesPackage): Promise<string[]> {
  const issues: string[] = [];

  try {
    const purchaseResult = await revenueCatService.purchasePackage(pkg);
    const resultIssues = validatePurchaseResult(purchaseResult);
    issues.push(...resultIssues);
  } catch {
    issues.push("Purchase flow test threw an unexpected error");
  }

  return issues;
}

function validatePurchaseResult(result: PurchaseResult): string[] {
  const issues: string[] = [];

  if (!result.success) {
    issues.push("Purchase result indicates failure");
  }

  if (!result.customerInfo) {
    issues.push("Purchase result missing customer info");
  }

  return issues;
}

export async function verifySubscriptionManagement(): Promise<{
  valid: boolean;
  issues: string[];
  warnings: string[];
}> {
  debug.info("Verifying subscription management...");

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

    if (currentOffering) {
      const subscriptionIssues = validateSubscriptionOffering(currentOffering);
      issues.push(...subscriptionIssues);
    }

    const configIssues = validateSubscriptionConfiguration(offerings);
    issues.push(...configIssues);

    const valid = issues.length === 0;
    return { valid, issues, warnings };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error("Subscription management verification failed:", error);

    return {
      valid: false,
      issues: [`Subscription management verification failed: ${errorMessage}`],
      warnings: [`Verification error: ${errorMessage}`],
    };
  }
}

function validateSubscriptionOffering(offering: PurchasesOffering): string[] {
  const issues: string[] = [];

  for (const pkg of offering.availablePackages) {
    const { product } = pkg;

    if (product.subscriptionPeriod) {
      const introPrice = product.introPrice;
      if (introPrice && introPrice.price < 0.99 && introPrice.price > 0) {
        issues.push(
          `Intro price too low for ${pkg.identifier}: $${introPrice.price}`,
        );
      }
    }
  }

  return issues;
}

function validateSubscriptionConfiguration(
  offerings: PurchasesOfferings | undefined,
): string[] {
  const issues: string[] = [];

  if (!offerings) {
    issues.push("Offerings object is undefined");
    return issues;
  }

  if (!offerings.current) {
    issues.push("No current offering configured");
  }

  if (Object.keys(offerings.all).length === 0) {
    issues.push("No offerings available");
  }

  return issues;
}
