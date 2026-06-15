import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedMascot } from '../../../screens/onboarding/components/ethereal/AnimatedMascot';
import type { MascotMood } from '../../../screens/onboarding/components/ethereal/VexMascotGuide.tokens';

export type BriefingType = 'morning' | 'evening' | 'session_prep' | 'streak_at_risk';

export interface DailyBriefingProps {
  type: BriefingType;
  headline: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  streakDays?: number;
  todayFocusMinutes?: number;
  planCount?: number;
  captureCount?: number;
}

function briefingIcon(type: BriefingType): MascotMood {
  const map: Record<BriefingType, MascotMood> = {
    morning: 'wave',
    evening: 'celebrate',
    session_prep: 'pointing',
    streak_at_risk: 'encouraging',
  };
  return map[type];
}

function briefingColor(type: BriefingType, theme: ReturnType<typeof useTheme>['theme']): string {
  const map: Record<BriefingType, string> = {
    morning: theme.colors.semantic.info,
    evening: theme.colors.semantic.success,
    session_prep: theme.colors.semantic.secondary,
    streak_at_risk: theme.colors.semantic.warning,
  };
  return map[type];
}

export function DailyBriefing({
  type,
  headline,
  body,
  actionLabel,
  onAction,
  onDismiss,
  streakDays,
  todayFocusMinutes,
  planCount,
  captureCount,
}: DailyBriefingProps): React.JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion: reducedMotion } = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withSpring(1, { damping: 20 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const accentColor = briefingColor(type, theme);
  const icon = briefingIcon(type);

  const stats = [
    streakDays !== undefined && `${streakDays} day streak`,
    todayFocusMinutes !== undefined && `${todayFocusMinutes}m focused`,
    planCount !== undefined && `${planCount} plans`,
    captureCount !== undefined && `${captureCount} captures`,
  ].filter(Boolean);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityLabel={`Coach briefing: ${headline}`}
        accessibilityRole="button"
        accessibilityHint={actionLabel ? `Double tap to ${actionLabel}` : undefined}
        onPress={onAction}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Box
          p="md"
          gap="sm"
          bg="semantic.surfaceGlass"
          borderRadius={24}
          style={{
            borderWidth: 1,
            borderColor: accentColor,
            boxShadow: '0px 4px 12px accentColor / 0.12',
          }}
        >
          <Box flexDirection="row" alignItems="center" gap="sm">
            <AnimatedMascot
              mood={icon}
              size={{ width: 48, height: 48 }}
              reducedMotion={reducedMotion}
            />
            <Box flex={1}>
              <Text variant="body" color="text.primary" style={{ fontWeight: '700' }}>
                {headline}
              </Text>
            </Box>
            {onDismiss && (
              <Pressable
                accessibilityLabel="Dismiss briefing"
                accessibilityRole="button"
                onPress={onDismiss}
              >
                <Text variant="caption" color="text.secondary">
                  ✕
                </Text>
              </Pressable>
            )}
          </Box>

          <Text variant="caption" color="text.secondary" style={{ lineHeight: 20 }}>
            {body}
          </Text>

          {stats.length > 0 && (
            <Box flexDirection="row" flexWrap="wrap" gap="xs">
              {stats.map((stat, i) => (
                <Box
                  key={stat.id}
                  px="sm"
                  py="xs"
                  bg="semantic.backgroundElevated"
                  borderRadius={999}
                >
                  <Text variant="caption" color="text.secondary" style={{ fontWeight: '500' }}>
                    {stat}
                  </Text>
                </Box>
              ))}
            </Box>
          )}

          {actionLabel && (
            <Box
              mt="xs"
              px="md"
              py="sm"
              bg="semantic.surfaceElevated"
              borderRadius={16}
              alignItems="center"
              style={{
                borderWidth: 1,
                borderColor: accentColor,
              }}
            >
              <Text variant="label" style={{ color: accentColor, fontWeight: '600' }}>
                {actionLabel}
              </Text>
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
