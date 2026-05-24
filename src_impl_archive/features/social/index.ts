/**
 * Social Feature Barrel Export
 *
 * @phase 10
 */

// Types
export * from './types';

// Service
export * from './service';
export * as socialRepository from './repository';

// Hooks
export * from './hooks';

// Phase 10.3 - Victory Cards
export {
  VictoryCard,
  VictoryCardWithShare,
  generateShareCaption,
  type VictoryCardType,
  type VictoryCardData,
} from './components/VictoryCard';

// Phase 10.4 - Referral System
export {
  ReferralSystem,
  ReferralBanner,
  type ReferralData,
} from './components/ReferralSystem';
