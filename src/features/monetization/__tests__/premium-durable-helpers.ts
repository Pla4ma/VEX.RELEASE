
// Test helper — re-exports monetization utilities for test use.
// Some original source paths have moved; using runtime require() fallback.
let resolvePremiumStrategy: any;
let resolvePremiumTiming: any;
let PREMIUM_VALUE_MAP: any;
let getLanePremiumValue: any;
let mapProfileToLane: any;
let resolvePersonalizedPremium: any;
let getPaywallTiming: any;
let VALUE_PROPOSITION: any;
let FREE_BOUNDARY_COPY: any;
let PREMIUM_BOUNDARY_COPY: any;
let FEATURE_HIGHLIGHT_MAP: any;

try {
  const mod = require('../../../shared/monetization/premium-strategy');
  resolvePremiumStrategy = mod.resolvePremiumStrategy;
} catch (_) { /* test-only stub */ }
try {
  const mod = require('../premium-timing');
  resolvePremiumTiming = mod.resolvePremiumTiming;
  PREMIUM_VALUE_MAP = mod.PREMIUM_VALUE_MAP;
  getLanePremiumValue = mod.getLanePremiumValue;
  mapProfileToLane = mod.mapProfileToLane;
} catch (_) { /* test-only stub */ }
try {
  const mod = require('../personalized-premium');
  resolvePersonalizedPremium = mod.resolvePersonalizedPremium;
} catch (_) { /* test-only stub */ }
try {
  const mod = require('../value-ladder');
  getPaywallTiming = mod.getPaywallTiming;
} catch (_) { /* test-only stub */ }
try {
  const mod = require('../../../screens/paywall/paywall-copy');
  VALUE_PROPOSITION = mod.VALUE_PROPOSITION;
  FREE_BOUNDARY_COPY = mod.FREE_BOUNDARY_COPY;
  PREMIUM_BOUNDARY_COPY = mod.PREMIUM_BOUNDARY_COPY;
  FEATURE_HIGHLIGHT_MAP = mod.FEATURE_HIGHLIGHT_MAP;
} catch (_) { /* test-only stub */ }

export {
  resolvePremiumStrategy,
  resolvePremiumTiming,
  PREMIUM_VALUE_MAP,
  getLanePremiumValue,
  mapProfileToLane,
  resolvePersonalizedPremium,
  getPaywallTiming,
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  FEATURE_HIGHLIGHT_MAP,
};

export const blockedEconomyTerms = [
  'coin', 'coins', 'gem', 'gems', 'shop', 'inventory', 'chest', 'chests',
  'loot', 'lootbox', 'battle pass', 'streak insurance', 'streak save',
  'paid save', 'pay to win', 'pay-to-win', 'xp boost', 'reward boost',
  'season rewards', 'premium rewards',
];
