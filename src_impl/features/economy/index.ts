/**
 * Economy Feature
 * Export all economy-related modules
 *
 * Note: Types are exported from schemas.ts (inferred from Zod)
 * types.ts contains pure TypeScript interfaces for reference only
 */

// Schemas (exports types via z.infer<typeof Schema>)
export * from './schemas';

// Repository
export * from './repository';

// Service
export * from './service';

// Hooks
export * from './hooks';

// Analytics (only exports used)
export { trackCurrencyEarned, trackCurrencySpent, trackWalletCreated } from './analytics';

// Components
export * from './components/SimpleWalletBadge';
export * from './components/EarnMoreSheet';
// components removed - use direct imports

export * from './anti-duplication';
