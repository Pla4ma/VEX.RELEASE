/**
 * Purchase Trust Utilities
 *
 * Handles secure purchase verification and trust signals.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('monetization:purchase-trust');

// Purchase verification result
// Trust signal types
// Trust signal configuration
// Trust signals for paywall
// Purchase receipt schema
// Verify purchase receipt
// Restore previous purchases
// Check if purchase is still valid (not expired)
// Get remaining days for subscription
// Format trust signals for display
// Calculate price display trust score
// Generate price display explanation
// Verify purchase security hash
// Check for suspicious purchase patterns
// Log purchase attempt for fraud detection
// Get refund eligibility
export * from "./purchase-trust.types";
export * from "./purchase-trust.part1";
export * from "./purchase-trust.part2";
