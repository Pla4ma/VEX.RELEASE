/**
 * RevenueCat Types
 *
 * Type definitions for monetization layer.
 * Strong typing for all RevenueCat operations.
 */

import {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesOffering,
} from 'react-native-purchases';

// ============================================================================
// Environment Configuration
// ============================================================================
// ============================================================================
// Service State Types
// ============================================================================

export type RevenueCatStatus =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'missing_keys'
  | 'error';

export type PurchaseState =
  | 'idle'
  | 'loading_offerings'
  | 'loading_customer'
  | 'purchasing'
  | 'restoring'
  | 'success'
  | 'error';

// ============================================================================
// Result Types
// ============================================================================
// ============================================================================
// Entitlement Types
// ============================================================================
// ============================================================================
// Package Types
// ============================================================================
// ============================================================================
// Offering Types
// ============================================================================
// ============================================================================
// Error Types
// ============================================================================

export type RevenueCatErrorCode =
  | 'UNKNOWN'
  | 'PURCHASE_CANCELLED'
  | 'STORE_PROBLEM'
  | 'PURCHASE_NOT_ALLOWED'
  | 'PURCHASE_INVALID'
  | 'PRODUCT_NOT_AVAILABLE'
  | 'PRODUCT_ALREADY_PURCHASED'
  | 'RECEIPT_ALREADY_IN_USE'
  | 'INVALID_RECEIPT'
  | 'MISSING_RECEIPT_FILE'
  | 'NETWORK_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'UNEXPECTED_BACKEND_ERROR'
  | 'INVALID_APP_USER_ID'
  | 'OPERATION_ALREADY_IN_PROGRESS'
  | 'INVALID_SUBSCRIBER_ATTRIBUTES'
  | 'CONFIGURATION_ERROR'
  | 'UNSUPPORTED'
  | 'EMPTY_OFFERINGS'
  | 'PAYWALL_NOT_LOADED'
  | 'OFFERINGS_NOT_LOADED'
  | 'PURCHASE_PENDING'
  | 'BILLING_ISSUE';
// ============================================================================
// Analytics Types
// ============================================================================
// ============================================================================
// Hook State Types
// ============================================================================
export * from "./revenuecat-types.types";
