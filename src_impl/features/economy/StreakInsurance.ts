import { captureSilentFailure } from "../../utils/silent-failure";
/**
 * Streak Insurance System
 *
 * Users can buy "7-Day Streak Insurance" for 500 gems.
 * If streak breaks during the 7-day window, auto-restore to day before break.
 *
 * @phase 5.1
 *
 * Dependencies:
 * - Economy/Wallet (atomic transactions)
 * - Streaks (restore functionality)
 * - Analytics (tracking)
 */

import { z } from "zod";
import { spendCurrency } from "./spending-service";
import { addCurrency } from "./wallet-service";
import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { trackInsurancePurchased, trackInsuranceConsumed } from "./analytics";

// ============================================================================
// Constants
// ============================================================================

export const INSURANCE_COST_GEMS = 500;
export const INSURANCE_DURATION_DAYS = 7;
export const INSURANCE_DURATION_MS = INSURANCE_DURATION_DAYS * 24 * 60 * 60 * 1000;

// ============================================================================
// Schemas
// ============================================================================

export const StreakInsuranceSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    purchasedAt: z.number(),
    expiresAt: z.number(),
    costGems: z.number().int().min(0),
    consumed: z.boolean().default(false),
    consumedAt: z.number().nullable(),
    streakDaysAtPurchase: z.number().int().min(0),
    restoredStreakDays: z.number().int().min(0).nullable(),
  })
  .strict();

export const PurchaseInsuranceInputSchema = z
  .object({
    userId: z.string().uuid(),
    currentStreakDays: z.number().int().min(0),
  })
  .strict();

export const CheckInsuranceStatusInputSchema = z
  .object({
    userId: z.string().uuid(),
  })
  .strict();

export const ConsumeInsuranceInputSchema = z
  .object({
    userId: z.string().uuid(),
    streakToRestore: z.number().int().min(0),
  })
  .strict();

// ============================================================================
// Types
// ============================================================================

export type StreakInsurance = z.infer<typeof StreakInsuranceSchema>;
export type PurchaseInsuranceInput = z.infer<typeof PurchaseInsuranceInputSchema>;
export type CheckInsuranceStatusInput = z.infer<typeof CheckInsuranceStatusInputSchema>;
export type ConsumeInsuranceInput = z.infer<typeof ConsumeInsuranceInputSchema>;

export interface InsuranceStatus {
  hasActiveInsurance: boolean;
  expiresAt: number | null;
  daysRemaining: number;
  hoursRemaining: number;
  canPurchase: boolean;
  reasonCannotPurchase: string | null;
}

export interface PurchaseResult {
  success: boolean;
  insuranceId: string | null;
  expiresAt: number | null;
  error: { code: string; message: string } | null;
}

// ============================================================================
// Storage (MMKV-based for client-side insurance tracking)
// ============================================================================

/**
 * Insurance records are stored per-user with expiration tracking
 */

const INSURANCE_STORAGE_KEY = (userId: string) => `streak_insurance:${userId}`;

function getStorage() {
  // Dynamic import to avoid issues if MMKV is not available
  try {
    const { storage } = require("../../store/mmkv-storage");
    return storage;
  } catch (error) {
    captureSilentFailure(error, { feature: "economy", operation: "ui-fallback", type: "ui" });
    return null;
  }
}

function saveInsurance(userId: string, insurance: StreakInsurance): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.set(INSURANCE_STORAGE_KEY(userId), JSON.stringify(insurance));
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "streak-insurance", operation: "save" },
      extra: { userId },
    });
  }
}

function loadInsurance(userId: string): StreakInsurance | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const data = storage.getString(INSURANCE_STORAGE_KEY(userId));
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);
    return StreakInsuranceSchema.parse(parsed);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "streak-insurance", operation: "load" },
      extra: { userId },
    });
    return null;
  }
}

function clearInsurance(userId: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.delete(INSURANCE_STORAGE_KEY(userId));
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "streak-insurance", operation: "clear" },
      extra: { userId },
    });
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Check if user has active streak insurance
 */
export async function checkInsuranceStatus(input: CheckInsuranceStatusInput): Promise<InsuranceStatus> {
  const validated = CheckInsuranceStatusInputSchema.parse(input);
  const now = Date.now();

  const insurance = loadInsurance(validated.userId);

  // Check if insurance is active and not consumed
  const hasActiveInsurance = !!(insurance && !insurance.consumed && insurance.expiresAt > now);

  const msRemaining = hasActiveInsurance && insurance ? insurance.expiresAt - now : 0;
  const daysRemaining = Math.max(0, Math.floor(msRemaining / (24 * 60 * 60 * 1000)));
  const hoursRemaining = Math.max(0, Math.floor(msRemaining / (60 * 60 * 1000)));

  // Determine if can purchase new insurance
  let canPurchase = true;
  let reasonCannotPurchase: string | null = null;

  if (hasActiveInsurance) {
    canPurchase = false;
    reasonCannotPurchase = "You already have active insurance";
  }

  return {
    hasActiveInsurance,
    expiresAt: insurance?.expiresAt ?? null,
    daysRemaining,
    hoursRemaining,
    canPurchase,
    reasonCannotPurchase,
  };
}

/**
 * Purchase 7-day streak insurance
 * Atomic transaction - either full success or full failure
 */
export async function purchaseInsurance(input: PurchaseInsuranceInput): Promise<PurchaseResult> {
  const validated = PurchaseInsuranceInputSchema.parse(input);
  const now = Date.now();

  // Check current status first
  const status = await checkInsuranceStatus({ userId: validated.userId });
  if (!status.canPurchase) {
    return {
      success: false,
      insuranceId: null,
      expiresAt: null,
      error: {
        code: "ALREADY_ACTIVE",
        message: status.reasonCannotPurchase || "Cannot purchase insurance at this time",
      },
    };
  }

  // Attempt atomic spend
  const spendResult = await spendCurrency({
    userId: validated.userId,
    currency: "GEMS",
    amount: INSURANCE_COST_GEMS,
    sink: "STREAK_INSURANCE",
    description: "7-Day Streak Insurance purchase",
    metadata: {
      streakDaysAtPurchase: validated.currentStreakDays,
      durationDays: INSURANCE_DURATION_DAYS,
    },
  });

  if (!spendResult.success) {
    return {
      success: false,
      insuranceId: null,
      expiresAt: null,
      error: {
        code: spendResult.error?.code || "PURCHASE_FAILED",
        message: spendResult.error?.message || "Failed to purchase insurance",
      },
    };
  }

  // Create insurance record
  const insurance: StreakInsurance = {
    id: crypto.randomUUID(),
    userId: validated.userId,
    purchasedAt: now,
    expiresAt: now + INSURANCE_DURATION_MS,
    costGems: INSURANCE_COST_GEMS,
    consumed: false,
    consumedAt: null,
    streakDaysAtPurchase: validated.currentStreakDays,
    restoredStreakDays: null,
  };

  // Save insurance
  saveInsurance(validated.userId, insurance);

  // Emit event
  eventBus.publish("economy:insurance_purchased", {
    userId: validated.userId,
    insuranceId: insurance.id,
    costGems: INSURANCE_COST_GEMS,
    expiresAt: insurance.expiresAt,
    streakDaysAtPurchase: validated.currentStreakDays,
  });

  // Analytics
  trackInsurancePurchased(validated.userId, INSURANCE_COST_GEMS, validated.currentStreakDays);

  return {
    success: true,
    insuranceId: insurance.id,
    expiresAt: insurance.expiresAt,
    error: null,
  };
}

/**
 * Consume insurance to restore a broken streak
 * Called automatically when streak breaks with active insurance
 */
export async function consumeInsurance(input: ConsumeInsuranceInput): Promise<{ success: boolean; restoredDays: number | null; error: string | null }> {
  const validated = ConsumeInsuranceInputSchema.parse(input);
  const now = Date.now();

  const insurance = loadInsurance(validated.userId);

  // Validate insurance can be consumed
  if (!insurance) {
    return { success: false, restoredDays: null, error: "No insurance found" };
  }

  if (insurance.consumed) {
    return { success: false, restoredDays: null, error: "Insurance already consumed" };
  }

  if (insurance.expiresAt < now) {
    return { success: false, restoredDays: null, error: "Insurance expired" };
  }

  // Mark as consumed
  const consumedInsurance: StreakInsurance = {
    ...insurance,
    consumed: true,
    consumedAt: now,
    restoredStreakDays: validated.streakToRestore,
  };

  saveInsurance(validated.userId, consumedInsurance);

  // Emit event for streak restoration
  eventBus.publish("economy:insurance_consumed", {
    userId: validated.userId,
    insuranceId: insurance.id,
    restoredStreakDays: validated.streakToRestore,
    streakDaysAtPurchase: insurance.streakDaysAtPurchase,
  });

  // Analytics
  trackInsuranceConsumed(validated.userId, validated.streakToRestore);

  return {
    success: true,
    restoredDays: validated.streakToRestore,
    error: null,
  };
}

/**
 * Calculate insurance cost (could be dynamic based on streak length)
 * Currently flat 500 gems
 */
export function getInsuranceCost(_currentStreakDays: number): number {
  // Future: could scale cost with streak length
  // e.g., higher streak = higher cost to protect
  return INSURANCE_COST_GEMS;
}

/**
 * Clean up expired/consumed insurance records
 */
export function cleanupInsurance(userId: string): void {
  const insurance = loadInsurance(userId);

  if (!insurance) {
    return;
  }

  const now = Date.now();

  // Clear if expired and not consumed (wasted insurance)
  // Or keep consumed records for analytics? Clear for now.
  if (insurance.expiresAt < now || insurance.consumed) {
    clearInsurance(userId);
  }
}

/**
 * Get detailed insurance info for UI display
 */
export function getInsuranceDetails(userId: string): StreakInsurance | null {
  return loadInsurance(userId);
}
