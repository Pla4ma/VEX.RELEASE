import {
  resolvePremiumTiming,
  PREMIUM_VALUE_MAP,
  getLanePremiumValue,
  mapProfileToLane,
  EARLY_HIDDEN_THRESHOLD,
  TEASE_START_SESSION,
  VALUE_PROOF_THRESHOLD,
  type PremiumTimingTier,
  type PremiumLane,
} from '../../premium-timing';
import { resolvePremiumStrategy } from '../../../../shared/monetization/premium-strategy';
import { resolvePersonalizedPremium } from '../../personalized-premium';
import {
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  PREMIUM_FEATURES,
  FEATURE_HIGHLIGHT_MAP,
} from '../../../../screens/paywall/paywall-copy';

// ── Blocked economy terms ──────────────────────────────────────
const blockedEconomyTerms = [
  'coin',
  'coins',
  'gem',
  'gems',
  'shop',
  'inventory',
  'chest',
  'chests',
  'loot',
  'lootbox',
  'battle pass',
  'streak insurance',
  'streak save',
  'paid save',
  'pay to win',
  'pay-to-win',
  'xp boost',
  'reward boost',
  'season rewards',
  'premium rewards',
  'boss tier',
  'boss tiers',
  'raid',
];

// ── Required durable personalization terms ─────────────────────
const durableTerms = [
  'memory',
  'focus report',
  'focus intelligence',
  'study import',
  'import depth',
  'project continuity',
  'context restoration',
  'flow window',
  'calendar intelligence',
  'calendar window',
  'friction mode',
  'weekly experiment',
  'memory console',
  'private',
];

export {
  resolvePremiumTiming,
  PREMIUM_VALUE_MAP,
  getLanePremiumValue,
  mapProfileToLane,
  EARLY_HIDDEN_THRESHOLD,
  TEASE_START_SESSION,
  VALUE_PROOF_THRESHOLD,
  resolvePremiumStrategy,
  resolvePersonalizedPremium,
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  PREMIUM_FEATURES,
  FEATURE_HIGHLIGHT_MAP,
  blockedEconomyTerms,
  durableTerms,
  type PremiumTimingTier,
  type PremiumLane,
};
