import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import type { BossEncounterSummary, BossTemplate } from '../schemas';
import { BossAvatar } from './BossAvatar';
import { BossHealthBar } from './BossHealthBar';
import { createSheet } from '@/shared/ui/create-sheet';

interface BossBattleHUDProps {
  encounter: BossEncounterSummary;
  bossTemplate?: BossTemplate;
  tierLabel: string;
  isLocked: boolean;
  lockReason?: string;
}

const TIER_TONES = { NORMAL: 'info', ELITE: 'warning', LEGENDARY: 'error' } as const;
const fill = { bottom: 0, left: 0, position: 'absolute' as const, right: 0, top: 0 };

export function BossBattleHUD({
  encounter,
  bossTemplate,
  tierLabel,
  isLocked,
  lockReason,
}: BossBattleHUDProps): JSX.Element {
  const { theme } = useTheme();
  const pulse = useSharedValue(1);
  const tone = TIER_TONES[tierLabel as keyof typeof TIER_TONES] ?? 'info';
  const accent = theme.colors[tone].DEFAULT;
  const accentSoft = theme.colors[tone].light;

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [pulse]);

  const avatarStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.background.secondary }]}>
      <View style={[styles.radialBase, { backgroundColor: theme.colors.background.primary }]}>
        <View style={[styles.radialMid, { backgroundColor: `${accent}22` }]}>
          <View style={[styles.radialCore, { backgroundColor: `${accentSoft}1A` }]} />
        </View>
      </View>

      <View style={[styles.badge, { backgroundColor: `${accent}26`, borderColor: `${accent}55` }]}>
        <Text variant="caption" color={accent} style={styles.badgeText}>{tierLabel}</Text>
      </View>

      <Animated.View style={[styles.avatarWrap, avatarStyle]}>
        <BossAvatar bossName={encounter.bossName} primaryColor={accent} secondaryColor={accentSoft} glowColor={theme.colors.text.inverse} />
      </Animated.View>

      <Text variant="h2" color={theme.colors.text.inverse} style={styles.title}>{encounter.bossName}</Text>
      <View style={styles.healthWrap}><BossHealthBar currentHealth={encounter.healthRemaining} maxHealth={encounter.maxHealth} /></View>
      {bossTemplate?.description ? <Text variant="bodySmall" color={theme.colors.text.secondary} style={styles.description}>{bossTemplate.description}</Text> : null}

      {isLocked ? (
        <View style={[styles.lockOverlay, { backgroundColor: theme.colors.background.overlay }]}>
          <Text variant="h4" color={theme.colors.text.inverse}>LOCKED</Text>
          <Text variant="body" color={theme.colors.text.inverse} style={styles.lockText}>{lockReason ?? 'You are not strong enough to fight this boss yet.'}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = createSheet({
  card: {
    borderRadius: 28,
    minHeight: 360,
    overflow: 'hidden',
    padding: 24,
  },
  radialBase: {
    ...fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialMid: {
    borderRadius: 240,
    height: 320,
    opacity: 0.95,
    width: 320,
  },
  radialCore: {
    borderRadius: 180,
    height: 220,
    left: 50,
    opacity: 0.85,
    position: 'absolute',
    top: 50,
    width: 220,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 2,
  },
  badgeText: {
    fontWeight: '800',
    letterSpacing: 1,
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    marginTop: 12,
    textAlign: 'center',
  },
  healthWrap: {
    marginTop: 16,
  },
  description: {
    marginTop: 12,
    textAlign: 'center',
  },
  lockOverlay: {
    ...fill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  lockText: {
    marginTop: 10,
    textAlign: 'center',
  },
});

export default BossBattleHUD;
