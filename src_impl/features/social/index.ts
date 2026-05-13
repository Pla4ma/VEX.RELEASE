/**
 * Social — Minimal, strong, zero-population ready
 *
 * 4 mechanics: Friends, Duels, Victory Cards, Referrals
 * 2 integrations: Social Progression, Retention Nudges
 */

// Service
export {
  sendFriendRequest, acceptFriendRequest, removeFriend,
  getFriends, getPendingRequests,
  createDuel, acceptDuel, submitDuelScore,
  getDuelByShareCode, getActiveDuels, getDuelHistory,
  createVictoryCard, getUserVictoryCards,
  createReferralCode, claimReferral, getReferralStats,
} from './service';

// Repository
export { getFriendProfiles } from './repository';

// Share utilities
export {
  buildVictorySharePayload, buildVictoryClipboardText,
  buildDuelSharePayload, buildDuelInviteLink,
  buildReferralSharePayload, buildReferralInviteLink,
  getShareUrl, getDeepLink,
} from './share';

// Social progression — wires social actions into economy
export { initializeSocialProgression } from './social-progression';

// Retention nudges — accountability from friends
export { initializeRetentionNudges } from './retention-nudges';

// Types
export type {
  Friend, FriendProfile,
  DuelChallenge, DuelResult, DuelStatus, DuelMode,
  VictoryCard, VictoryCardType,
  Referral, NudgeType,
} from './types';

export {
  SOCIAL_LIMITS, DUEL_REWARDS, REFERRAL_REWARDS, VICTORY_CARD_COLORS,
} from './types';
