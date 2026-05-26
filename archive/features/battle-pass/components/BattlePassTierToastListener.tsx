import { useMemo, useRef } from 'react';
import { useToast } from '../../../shared/ui/components/Toast';
import { useAuthStore } from '../../../store';
import { useActiveSeason } from '../../seasons/hooks';
import { useBattlePassTiers } from '../hooks';
import { useEventSubscription } from '../../../events/hooks/useEventBus';

function getRewardPreview(rewardType: string | null, amount: number | null): string {
  if (!rewardType) {
    return 'New rewards are ready to claim.';
  }

  if (typeof amount === 'number' && amount > 0) {
    return `${amount} ${rewardType.toLowerCase()} waiting on this tier.`;
  }

  return `${rewardType} reward ready to claim.`;
}

export function BattlePassTierToastListener(): JSX.Element | null {
  const { show } = useToast();
  const { user } = useAuthStore();
  const { data: activeSeason } = useActiveSeason();
  const { data: tiers } = useBattlePassTiers(activeSeason?.id ?? '');
  const shownEventKeys = useRef<Set<string>>(new Set());
  const tierMap = useMemo(
    () => new Map((tiers ?? []).map((tier) => [tier.tierNumber, tier])),
    [tiers]
  );

  useEventSubscription(
    'season:tier_unlocked',
    (event) => {
      if (!user?.id || event.userId !== user.id || event.seasonId !== activeSeason?.id) {
        return;
      }

      const dedupeKey = `${event.seasonId}:${event.tier}`;
      if (shownEventKeys.current.has(dedupeKey)) {
        return;
      }
      shownEventKeys.current.add(dedupeKey);

      const unlockedTier = tierMap.get(event.tier);
      show({
        type: 'success',
        title: `Battle Pass Tier ${event.tier} Unlocked!`,
        message: getRewardPreview(
          unlockedTier?.freeRewardType ?? unlockedTier?.premiumRewardType ?? null,
          unlockedTier?.freeRewardAmount ?? unlockedTier?.premiumRewardAmount ?? null
        ),
        duration: 3500,
      });
    },
    [activeSeason?.id, show, tierMap, user?.id]
  );

  return null;
}

export default BattlePassTierToastListener;
