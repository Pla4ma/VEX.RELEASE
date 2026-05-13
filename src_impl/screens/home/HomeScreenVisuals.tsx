import React, { useEffect, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FocusRing } from '../../components/FocusRing';
import { StreakBadge } from '../../components/StreakBadge';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { Skeleton } from '../../components/ui/Skeleton';
import { SimpleWalletBadge } from '../../features/economy/components/SimpleWalletBadge';
import { getPremiumCardStyle } from '../../components/premiumStyles';
import { useTheme } from '../../theme';
import { createSheet } from '@/shared/ui/create-sheet';
const WHITE = 'rgba(255,255,255,0.96)';
const WHITE_MUTED = 'rgba(255,255,255,0.72)';
const WHITE_SOFT = 'rgba(255,255,255,0.18)';
const CTA_GRADIENT = ['theme.colors.primary[500]', 'theme.colors.primary[500]'] as const;

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
const styles = createSheet({
  ctaGradient: { overflow: 'hidden' },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 1.2 },
  focusValue: { fontSize: 42, fontWeight: '800', lineHeight: 48 },
  hero: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: 'row', gap: 16 },
  heroColumn: { flex: 1 },
  heroRight: { alignItems: 'center', justifyContent: 'center', minWidth: 148 },
  onboardPanel: { borderWidth: 1, gap: 8, padding: 16 },
  sectionAccent: { borderRadius: 2, height: 18, marginRight: 8, width: 3 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row' },
});

export * from "./HomeScreenVisuals.part1";
