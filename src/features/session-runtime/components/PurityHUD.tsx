import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { buttonTap } from '../../../utils/haptics';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { createSheet } from '@/shared/ui/create-sheet';

export interface PurityHUDProps {
  purityScore: number;
  purityLabel: string;
  streakMultiplier: number;
  compact?: boolean;
  onMultiplierPress?: () => void;
}

const formatMultiplier = (value: number): string =>
  value.toFixed(value % 1 === 0 ? 1 : 2).replace(/\.0$/, '');
const withAlpha = (color: string, alpha: number): string =>
  color.startsWith('#')
    ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${alpha})`
    : color;

export const PurityHUD = React.memo(
  function PurityHUD({
    purityScore,
    purityLabel,
    streakMultiplier,
    compact = false,
    onMultiplierPress,
  }: PurityHUDProps) {
    const { theme } = useTheme();
    const display = useMemo(() => {
      if (purityLabel === 'Elite') {
        return {
          icon: '\uD83D\uDD25',
          color: theme.colors.primary[500],
          text: 'ELITE FOCUS',
        };
      }
      if (purityLabel === 'Good') {
        return {
          icon: '\u2728',
          color: theme.colors.success.DEFAULT,
          text: 'GOOD FLOW',
        };
      }
      if (purityLabel === 'Okay') {
        return {
          icon: '\u26A1',
          color: theme.colors.warning.DEFAULT,
          text: 'STAY SHARP',
        };
      }
      return {
        icon: '\u2022',
        color: theme.colors.error.DEFAULT,
        text: 'DISTRACTED',
      };
    }, [
      purityLabel,
      theme.colors.error.DEFAULT,
      theme.colors.primary,
      theme.colors.success.DEFAULT,
      theme.colors.warning.DEFAULT,
    ]);
    if (compact) {
      return (
        <View style={styles.compactWrap}>
          <Animated.View
            key={`${purityLabel}-${Math.round(purityScore)}`}
            entering={FadeIn.duration(200)}
            style={styles.compactRow}
          >
            <Text
              variant="label"
              style={{ color: display.color }}
            >{`${display.icon} ${display.text}`}</Text>
            <Text variant="caption" color="text.secondary">
              {'\u2022'}
            </Text>
            <Pressable
              disabled={!onMultiplierPress}
              onPress={() => { buttonTap(); onMultiplierPress?.(); }}
              accessibilityLabel={`${formatMultiplier(streakMultiplier)}x multiplier`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view multiplier details"
            >
              <View
                style={[
                  styles.multiplierPill,
                  {
                    backgroundColor: withAlpha(display.color, 0.14),
                    borderColor: withAlpha(display.color, 0.24),
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={{ color: theme.colors.text.primary }}
                >{`${formatMultiplier(streakMultiplier)}x`}</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.light,
          },
        ]}
      >
        <Animated.View
          key={`${purityLabel}-${Math.round(purityScore)}`}
          entering={FadeIn.duration(200)}
          style={styles.defaultRow}
        >
          <Text
            variant="label"
            style={{ color: display.color }}
          >{`${display.icon} ${display.text}`}</Text>
          <Text
            variant="label"
            color="text.primary"
          >{`${Math.round(purityScore)}%`}</Text>
        </Animated.View>
        <Pressable
          disabled={!onMultiplierPress}
          onPress={() => { buttonTap(); onMultiplierPress?.(); }}
          accessibilityLabel={`${formatMultiplier(streakMultiplier)}x streak multiplier`}
          accessibilityRole="button"
          accessibilityHint="Double tap to view streak multiplier details"
        >
          <View
            style={[
              styles.multiplierPill,
              {
                backgroundColor: withAlpha(theme.colors.primary[500], 0.12),
                borderColor: withAlpha(theme.colors.primary[500], 0.24),
              },
            ]}
          >
            <Text
              variant="caption"
              color="text.primary"
            >{`${formatMultiplier(streakMultiplier)}x streak`}</Text>
          </View>
        </Pressable>
      </View>
    );
  },
  (prev, next) =>
    prev.purityScore === next.purityScore &&
    prev.purityLabel === next.purityLabel &&
    prev.streakMultiplier === next.streakMultiplier &&
    prev.compact === next.compact,
);

const styles = createSheet({
  compactWrap: { marginTop: 18, alignItems: 'center' },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 18,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  multiplierPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});

export default PurityHUD;
