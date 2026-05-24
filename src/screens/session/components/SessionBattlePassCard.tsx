import React, { useEffect, useMemo, useState } from 'react';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Box, Text } from '../../../components/primitives';
import { useBattlePassDisplay, useUserBattlePassSummary } from '../../../features/battle-pass/hooks';
import { useActiveSeason } from '../../../features/seasons/hooks';
import { useTheme } from '../../../theme';
import { useFeatureAccess } from '../../../features/liveops-config';
import { getFeatureAvailability } from '../../../features/liveops-config/feature-availability';

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function SessionBattlePassCard({ sessionBattlePassXp, userId }: { sessionBattlePassXp: number; userId: string }) {
  const featureAccess = useFeatureAccess();
  const battlePassAvail = getFeatureAvailability(featureAccess.features.battle_pass);
  if (!battlePassAvail.canRenderEntryPoint) {
    return null;
  }

  const { theme } = useTheme();
  const { data: activeSeason, isLoading: isSeasonLoading } = useActiveSeason();
  const summaryQuery = useUserBattlePassSummary(userId, activeSeason?.id ?? '');
  const displayQuery = useBattlePassDisplay(userId, activeSeason?.id ?? '');
  const progressRatio = useSharedValue(0);
  const [trackWidth, setTrackWidth] = useState(0);

  const state = useMemo(() => {
    if (!activeSeason || !displayQuery.data || !summaryQuery.data) {return null;}
    let previousTier = displayQuery.data.currentTier;
    let previousTierXp = displayQuery.data.tierXp - sessionBattlePassXp;
    while (previousTierXp < 0 && previousTier > 0) {
      previousTier -= 1;
      previousTierXp += activeSeason.xpPerTier;
    }
    return {
      currentTier: summaryQuery.data.currentTier,
      tierCount: activeSeason.tierCount,
      previousTier,
      previousProgress: clamp(previousTierXp / activeSeason.xpPerTier),
      currentProgress: clamp(displayQuery.data.tierXp / activeSeason.xpPerTier),
      tierUp: summaryQuery.data.currentTier > previousTier,
    };
  }, [activeSeason, displayQuery.data, sessionBattlePassXp, summaryQuery.data]);

  useEffect(() => {
    progressRatio.value = state ? state.previousProgress : 0;
    if (state) {progressRatio.value = withTiming(state.currentProgress, { duration: 800 });}
  }, [progressRatio, state]);

  const fillStyle = useAnimatedStyle(() => ({ width: trackWidth * progressRatio.value }));

  if (isSeasonLoading || summaryQuery.isLoading || displayQuery.isLoading) {
    return <Animated.View entering={FadeInUp.delay(240).springify()}><Box p={18} borderRadius={20} style={{ backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.border.light }}><Text variant="body" color={theme.colors.text.secondary}>Syncing battle pass progress...</Text></Box></Animated.View>;
  }
  if (!activeSeason) {
    return <Animated.View entering={FadeInUp.delay(240).springify()}><Box p={18} borderRadius={20} style={{ backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.border.light }}><Text variant="label" color={theme.colors.text.secondary}>Battle Pass</Text><Text variant="body" color={theme.colors.text.secondary} mt={8}>No active season right now.</Text></Box></Animated.View>;
  }
  if (summaryQuery.error || displayQuery.error || !state) {
    return <Animated.View entering={FadeInUp.delay(240).springify()}><Box p={18} borderRadius={20} style={{ backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.border.light }}><Text variant="label" color={theme.colors.text.secondary}>Battle Pass</Text><Text variant="body" color={theme.colors.error.DEFAULT} mt={8}>Battle pass progress could not be loaded.</Text></Box></Animated.View>;
  }

  return (
    <Animated.View entering={FadeInUp.delay(240).springify()}>
      <Box p={18} borderRadius={20} style={{ backgroundColor: theme.colors.background.secondary, borderWidth: 1, borderColor: theme.colors.border.light }}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="label" color={theme.colors.text.secondary}>Battle Pass</Text>
          <Text variant="body" color={theme.colors.text.primary} fontWeight="700">Tier {state.currentTier}/{state.tierCount}</Text>
        </Box>
        <Box mt={12} height={12} borderRadius={999} overflow="hidden" onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)} style={{ backgroundColor: theme.colors.background.primary }}>
          <Animated.View style={[{ height: '100%', borderRadius: 999, backgroundColor: theme.colors.warning.DEFAULT }, fillStyle]} />
        </Box>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" mt={10}>
          <Text variant="caption" color={theme.colors.text.secondary}>+{sessionBattlePassXp} XP this session</Text>
          {state.tierUp ? <Text variant="caption" color={theme.colors.warning.DEFAULT}>TIER UP! -&gt; Tier {state.currentTier}</Text> : null}
        </Box>
      </Box>
    </Animated.View>
  );
}

export default SessionBattlePassCard;
