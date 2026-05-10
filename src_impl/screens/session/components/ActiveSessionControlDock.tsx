import React from 'react';

import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Icon } from '../../../icons';
import { formatMultiplier, withAlpha } from '../utils/active-session';

type ActiveSessionControlDockProps = {
  completionPercentage: number;
  isPaused: boolean;
  multiplierDays: number;
  phaseAccent: string;
  showMultiplierInfo: boolean;
  streakMultiplier: number;
  themeColors: {
    backgroundElevated: string;
    border: string;
    error: string;
    info: string;
    inverse: string;
    success: string;
  };
  onComplete: () => void;
  onEnd: () => void;
  onPauseResume: () => void;
  onToggleMultiplierInfo: () => void;
};

export const ActiveSessionControlDock: React.FC<ActiveSessionControlDockProps> = ({
  completionPercentage,
  isPaused,
  multiplierDays,
  phaseAccent,
  showMultiplierInfo,
  streakMultiplier,
  themeColors,
  onComplete,
  onEnd,
  onPauseResume,
  onToggleMultiplierInfo,
}) => (
  <Animated.View entering={FadeIn.delay(300)}>
    <Box px="lg" pb="xl">
      {completionPercentage >= 80 ? (
        <Pressable onPress={onComplete}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          <Box
            mb="md"
            px="lg"
            py="md"
            borderRadius="full"
            alignItems="center"
            style={{
              backgroundColor: withAlpha(themeColors.success, 0.14),
              borderWidth: 1,
              borderColor: withAlpha(themeColors.success, 0.28),
            }}
          >
            <Text variant="label" style={{ color: themeColors.success }}>
              {completionPercentage >= 100 ? 'Complete Session' : 'Finish Early'}
            </Text>
          </Box>
        </Pressable>
      ) : null}
      <Box
        style={{
          ...getPremiumCardStyle('large'),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: withAlpha(themeColors.backgroundElevated, 0.88),
          borderColor: withAlpha(themeColors.border, 0.7),
        }}
      >
        <Pressable onPress={onEnd}
  accessibilityLabel="Quit focus session"
  accessibilityRole="button"
  accessibilityHint="Opens the confirmation to quit this focus session">
          <Box
            style={{
              minWidth: 104,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 18,
              borderWidth: 1,
              paddingHorizontal: 18,
              paddingVertical: 14,
              backgroundColor: withAlpha(themeColors.error, 0.14),
              borderColor: withAlpha(themeColors.error, 0.32),
            }}
          >
            <Text variant="label" style={{ color: themeColors.error }}>
              Quit
            </Text>
          </Box>
        </Pressable>
        <Pressable onPress={onPauseResume}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          <Box
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: phaseAccent,
            }}
          >
            <Icon name={isPaused ? 'play' : 'minus'} size="lg" color={themeColors.inverse} />
          </Box>
        </Pressable>
        <Box style={{ position: 'relative' }}>
          {showMultiplierInfo ? (
            <Animated.View
              entering={FadeIn.duration(180)}
              style={{
                position: 'absolute',
                right: 0,
                bottom: 72,
                width: 190,
                borderRadius: 16,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: themeColors.backgroundElevated,
                borderColor: withAlpha(themeColors.border, 0.9),
              }}
            >
              <Text variant="caption" color="text.primary">
                {`Your ${formatMultiplier(streakMultiplier)}x multiplier comes from your current ${multiplierDays}-day streak and applies to session rewards.`}
              </Text>
            </Animated.View>
          ) : null}
          <Pressable onPress={onToggleMultiplierInfo}
  accessibilityLabel="x`} button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Box
              style={{
                minWidth: 84,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 18,
                borderWidth: 1,
                paddingHorizontal: 18,
                paddingVertical: 14,
                backgroundColor: withAlpha(themeColors.info, 0.1),
                borderColor: withAlpha(themeColors.info, 0.22),
              }}
            >
              <Text variant="label" style={{ color: themeColors.info }}>
                {`${formatMultiplier(streakMultiplier)}x`}
              </Text>
            </Box>
          </Pressable>
        </Box>
      </Box>
    </Box>
  </Animated.View>
);
