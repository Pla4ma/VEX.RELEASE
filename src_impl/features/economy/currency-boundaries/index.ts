/**
 * Currency Boundaries - Barrel File
 *
 * Phase 6.03 - Currency And Monetization Boundaries
 * Exports all currency boundary validation functionality
 */

// Schemas and types
export type {
  CurrencyLimits,
  BoundaryViolation,
  BoundaryViolationType,
  MonetizationBoundary,
  TransactionValidationRequest,
  TransactionValidationResult,
  EconomyProtectionRule,
  BoundaryAnalytics,
  CurrencyBoundariesConfig,
} from './schemas';

// Configuration
export {
  DEFAULT_CURRENCY_LIMITS,
  DEFAULT_MONETIZATION_BOUNDARIES,
  DEFAULT_PROTECTION_RULES,
  DEFAULT_CURRENCY_BOUNDARIES_CONFIG,
} from './config';

// Service
export { currencyBoundariesValidationService } from './validation-service';

// Hooks
export {
  useValidateTransaction,
  useTransactionValidation,
  useBoundaryViolations,
  useCurrencyLimits,
  useBoundaryAnalytics,
  usePremiumUpgradePrompt,
  useTransactionWarning,
  useBoundaryStatus,
  useCurrencyBoundaryEvents,
  currencyBoundariesKeys,
} from './hooks';
