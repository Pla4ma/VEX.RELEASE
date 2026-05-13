/**
 * Contextual Paywall System
 *
 * Phase 4.1 - Paywall Strategy Redesign
 * Contextual paywall moments that appear at the right time
 * (not randomly, not during onboarding, not during first session)
 *
 * Contextual Moments:
 * - When trying to create 2nd study plan
 * - When boss bounty requires premium
 * - When streak breaks and no insurance (offer subscription)
 * - When study analytics requested
 *
 * Dependencies:
 * - PremiumTierSystem (feature gating)
 * - PaywallStateMachine (presentation)
 * - Content Study (plan creation)
 * - Boss (bounty system)
 * - Streaks (insurance)
 */

import { type SubscriptionTier, type PaywallContextType, shouldShowPaywall, getPaywallContext, isPremium, type PaywallContextData } from './PremiumTierSystem';

// ============================================================================
// Contextual Paywall Rules
// ============================================================================
// Define when each paywall context can trigger
// ============================================================================
// Paywall History Tracking
// ============================================================================

interface PaywallShowRecord {
  context: PaywallContextType;
  shownAt: number;
  dismissed: boolean;
  converted: boolean;
}

const paywallHistory = new Map<string, PaywallShowRecord[]>();
// ============================================================================
// Trigger Conditions Evaluation
// ============================================================================
// ============================================================================
// Smart Paywall Selection
// ============================================================================
// ============================================================================
// Conversion Tracking
// ============================================================================

interface ConversionMetrics {
  userId: string;
  context: PaywallContextType;
  shownAt: number;
  converted: boolean;
  convertedAt?: number;
  dismissed: boolean;
  timeToDecide: number; // ms
}

const conversionMetrics: ConversionMetrics[] = [];
// ============================================================================
// Paywall Prevention Rules
// ============================================================================
// ============================================================================
// Exports
// ============================================================================

// Types are already exported via 'export interface' declarations above
export * from "./ContextualPaywall.types";
export * from "./ContextualPaywall.types";
export * from "./ContextualPaywall.part1";
export * from "./ContextualPaywall.part2";
