import * as repo from "./repository";
import { eventBus } from "../../events";
import type { Friend, FriendProfile, DuelChallenge, DuelResult, DuelMode, VictoryCard, VictoryCardType, Referral } from "./types";
import { DUEL_REWARDS, REFERRAL_REWARDS, SOCIAL_LIMITS, VICTORY_CARD_COLORS } from "./types";
import { v4 as uuidv4 } from "../../utils/uuid";


export async function getReferralStats(userId: string): Promise<{
  code: string;
  totalReferred: number;
  pendingReward: boolean;
}> {
  const referral = await repo.getReferralByReferrer(userId);
  const totalReferred = await repo.getReferralCount(userId);
  return {
    code: referral?.code ?? '',
    totalReferred,
    pendingReward: referral?.status === 'COMPLETED' && !referral.rewardClaimed,
  };
}