import * as repo from "./repository";
import { eventBus } from "../../events";
import type { Friend, FriendProfile, DuelChallenge, DuelResult, DuelMode, VictoryCard, VictoryCardType, Referral } from "./types";
import { DUEL_REWARDS, REFERRAL_REWARDS, SOCIAL_LIMITS, VICTORY_CARD_COLORS } from "./types";
import { v4 as uuidv4 } from "../../utils/uuid";


export async function sendFriendRequest(userId: string, friendId: string): Promise<Friend> {
  if (userId === friendId) {throw new Error('Cannot add yourself');}
  const existing = await repo.getFriendship(userId, friendId);
  if (existing) {throw new Error('Already friends or request pending');}
  const count = await repo.getFriendCount(userId);
  if (count >= SOCIAL_LIMITS.MAX_FRIENDS) {throw new Error('Friend limit reached');}
  const friend: Friend = {
    id: uuidv4(), userId, friendId, status: 'PENDING', createdAt: Date.now(),
  };
  await repo.saveFriend(friend);
  eventBus.publish('social:friend_request', { userId, friendId, timestamp: Date.now() });
  return friend;
}

export async function acceptFriendRequest(userId: string, friendId: string): Promise<void> {
  await repo.updateFriendStatus(userId, friendId, 'ACCEPTED');
  await repo.updateFriendStatus(friendId, userId, 'ACCEPTED');
  eventBus.publish('social:friend_accepted', { userId, friendId, timestamp: Date.now() });
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  await repo.removeFriend(userId, friendId);
  await repo.removeFriend(friendId, userId);
}

export async function getFriends(userId: string): Promise<FriendProfile[]> {
  return repo.getFriendProfiles(userId);
}

export async function getPendingRequests(userId: string): Promise<Friend[]> {
  return repo.getPendingRequests(userId);
}

export async function createDuel(
  challengerId: string,
  challengerName: string,
  mode: DuelMode,
  durationMinutes: number,
): Promise<DuelChallenge> {
  const activeDuels = await repo.getActiveDuels(challengerId);
  if (activeDuels.length >= SOCIAL_LIMITS.MAX_ACTIVE_DUELS) {
    throw new Error('Too many active duels');
  }
  const duel: DuelChallenge = {
    id: uuidv4(),
    challengerId,
    challengerName,
    opponentId: null,
    opponentName: null,
    status: 'PENDING',
    mode,
    durationMinutes,
    challengerScore: null,
    opponentScore: null,
    winnerId: null,
    shareCode: generateShareCode(),
    expiresAt: Date.now() + SOCIAL_LIMITS.DUEL_CHALLENGE_EXPIRY_HOURS * 3600 * 1000,
    createdAt: Date.now(),
    completedAt: null,
  };
  await repo.saveDuel(duel);
  eventBus.publish('social:duel_created', {
    userId: challengerId, duelId: duel.id, shareCode: duel.shareCode, timestamp: Date.now(),
  });
  return duel;
}

export async function acceptDuel(shareCode: string, opponentId: string, opponentName: string): Promise<DuelChallenge> {
  const duel = await repo.getDuelByShareCode(shareCode);
  if (!duel) {throw new Error('Duel not found');}
  if (duel.status !== 'PENDING') {throw new Error('Duel already accepted or expired');}
  if (duel.challengerId === opponentId) {throw new Error('Cannot duel yourself');}
  if (Date.now() > duel.expiresAt) {
    await repo.updateDuelStatus(duel.id, 'EXPIRED');
    throw new Error('Duel expired');
  }
  duel.opponentId = opponentId;
  duel.opponentName = opponentName;
  duel.status = 'ACCEPTED';
  await repo.updateDuel(duel);
  eventBus.publish('social:duel_accepted', {
    userId: opponentId, duelId: duel.id, challengerId: duel.challengerId, timestamp: Date.now(),
  });
  return duel;
}

export async function submitDuelScore(
  duelId: string,
  userId: string,
  score: number,
): Promise<DuelResult | null> {
  const duel = await repo.getDuelById(duelId);
  if (!duel) {throw new Error('Duel not found');}
  if (duel.status !== 'ACCEPTED') {throw new Error('Duel not active');}
  const isChallenger = duel.challengerId === userId;
  const isOpponent = duel.opponentId === userId;
  if (!isChallenger && !isOpponent) {throw new Error('Not a participant');}
  if (isChallenger) {duel.challengerScore = score;}
  if (isOpponent) {duel.opponentScore = score;}
  const bothSubmitted = duel.challengerScore !== null && duel.opponentScore !== null;
  if (bothSubmitted) {
    return completeDuel(duel);
  }
  await repo.updateDuel(duel);
  return null;
}

export async function getDuelByShareCode(code: string): Promise<DuelChallenge | null> {
  return repo.getDuelByShareCode(code);
}

export async function getActiveDuels(userId: string): Promise<DuelChallenge[]> {
  return repo.getActiveDuels(userId);
}

export async function getDuelHistory(userId: string, limit: number = 20): Promise<DuelChallenge[]> {
  return repo.getDuelHistory(userId, limit);
}

export async function createVictoryCard(
  userId: string,
  type: VictoryCardType,
  title: string,
  subtitle: string,
  stats: Array<{ label: string; value: string }>,
): Promise<VictoryCard> {
  const card: VictoryCard = {
    id: uuidv4(),
    userId,
    type,
    title,
    subtitle,
    stats,
    accentColor: VICTORY_CARD_COLORS[type],
    shareText: buildShareText(type, title, subtitle, stats),
    createdAt: Date.now(),
  };
  await repo.saveVictoryCard(card);
  return card;
}

export async function getUserVictoryCards(userId: string, limit: number = 10): Promise<VictoryCard[]> {
  return repo.getVictoryCards(userId, limit);
}

export async function createReferralCode(userId: string): Promise<string> {
  const existing = await repo.getReferralByReferrer(userId);
  if (existing) {return existing.code;}
  const referral: Referral = {
    id: uuidv4(),
    referrerId: userId,
    referredId: null,
    code: generateShareCode(),
    status: 'PENDING',
    rewardClaimed: false,
    createdAt: Date.now(),
    completedAt: null,
  };
  await repo.saveReferral(referral);
  return referral.code;
}

export async function claimReferral(code: string, referredUserId: string): Promise<Referral> {
  const referral = await repo.getReferralByCode(code);
  if (!referral) {throw new Error('Invalid referral code');}
  if (referral.referrerId === referredUserId) {throw new Error('Cannot refer yourself');}
  if (referral.status === 'COMPLETED') {throw new Error('Referral already used');}
  referral.referredId = referredUserId;
  referral.status = 'COMPLETED';
  referral.completedAt = Date.now();
  await repo.updateReferral(referral);
  eventBus.publish('social:referral_completed', {
    referrerId: referral.referrerId,
    referredId: referredUserId,
    referralId: referral.id,
    timestamp: Date.now(),
  });
  return referral;
}