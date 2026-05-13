/**
 * Social Progression — Wire social actions into economy + progression
 *
 * Duel wins → XP + coins
 * Referral completions → XP + coins  
 * Squad session participation → synergy bonus multiplier
 */

import { eventBus } from '../../events';

const DUEL_XP = { WIN: 100, LOSS: 30, DRAW: 50 };
const DUEL_COINS = { WIN: 50, LOSS: 10, DRAW: 25 };
const REFERRAL_XP = { REFERRER: 200, REFERRED: 150 };
const REFERRAL_COINS = { REFERRER: 100, REFERRED: 75 };

type ProgressionHandler = (userId: string, xp: number) => Promise<void>;
type EconomyHandler = (userId: string, coins: number) => Promise<void>;

let grantXp: ProgressionHandler | null = null;
let grantCoins: EconomyHandler | null = null;

export function initializeSocialProgression(
  xpHandler: ProgressionHandler,
  coinHandler: EconomyHandler,
): () => void {
  grantXp = xpHandler;
  grantCoins = coinHandler;

  const unsubDuel = eventBus.subscribe('social:duel_completed', (raw: unknown) => {
    const data = raw as { winnerId: string | null; challengerId: string; opponentId: string };
    const { winnerId, challengerId, opponentId } = data;
    if (winnerId) {
      void grantXp?.(winnerId, DUEL_XP.WIN);
      void grantCoins?.(winnerId, DUEL_COINS.WIN);
      const loser = winnerId === challengerId ? opponentId : challengerId;
      void grantXp?.(loser, DUEL_XP.LOSS);
      void grantCoins?.(loser, DUEL_COINS.LOSS);
    } else {
      void grantXp?.(challengerId, DUEL_XP.DRAW);
      void grantCoins?.(challengerId, DUEL_COINS.DRAW);
      void grantXp?.(opponentId, DUEL_XP.DRAW);
      void grantCoins?.(opponentId, DUEL_COINS.DRAW);
    }
  });

  const unsubReferral = eventBus.subscribe('social:referral_completed', (raw: unknown) => {
    const data = raw as { referrerId: string; referredId: string };
    void grantXp?.(data.referrerId, REFERRAL_XP.REFERRER);
    void grantCoins?.(data.referrerId, REFERRAL_COINS.REFERRER);
    void grantXp?.(data.referredId, REFERRAL_XP.REFERRED);
    void grantCoins?.(data.referredId, REFERRAL_COINS.REFERRED);
  });

  return () => {
    unsubDuel();
    unsubReferral();
  };
}
