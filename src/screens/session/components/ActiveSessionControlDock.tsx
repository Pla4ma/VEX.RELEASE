import React from 'react';

import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Icon } from '../../../icons';
import { formatMultiplier, withAlpha } from '../utils/active-session';
import { lightColors } from '@/theme/tokens/colors';

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

export const ActiveSessionControlDock: React.FC<
  ActiveSessionControlDockProps
> = ({
  completionPercentage,
  isPaused,
  multiplierDays,
  _phaseAccent,
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
        <Pressable
          onPress={onComplete}
          accessibilityLabel={
            completionPercentage >= 100
              ? 'Complete focus session'
              : 'Finish focus session early'
          }
          accessibilityRole="button"
          accessibilityHint="Ends this session and opens the completion reward screen"
        >
          <Box
            mb="md"
            px="lg"
            py="md"
            borderRadius="full"
            alignItems="center"
            style={{
              backgroundColor: 'rgba(0,229,255,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(0,229,255,0.25)',
            }}
          >
            <Text variant="label" style={{ color: lightColors.semantic.vexCyan }}>
              {completionPercentage >= 100
                ? 'Complete Session'
                : 'Finish Early'}
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
        <Pressable
          onPress={onEnd}
          accessibilityLabel="Quit focus session"
          accessibilityRole="button"
          accessibilityHint="Opens the confirmation to quit this focus session"
        >
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
        <Pressable
          onPress={onPauseResume}
          accessibilityLabel={
            isPaused ? 'Resume session' : 'Pause session'
          }
          accessibilityRole="button"
          accessibilityHint={
            isPaused
              ? 'Restarts the active session'
              : 'Pauses the active session'
          }
        >
          <Box
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: lightColors.semantic.vexCyan,
            }}
          >
            <Icon
              name={isPaused ? 'play' : 'minus'}
              size="lg"
              color={themeColors.inverse}
            />
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
          <Pressable
            onPress={onToggleMultiplierInfo}
            accessibilityLabel="Show streak multiplier details"
            accessibilityRole="button"
            accessibilityHint="Explains how your current streak changes session rewards"
          >
            <Box
              style={{
                minWidth: 84,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 18,
                borderWidth: 1,
                paddingHorizontal: 18,
                paddingVertical: 14,
               backgroundColor: 'rgba(0,229,255,0.08)',
               borderColor: 'rgba(0,229,255,0.18)',
             }}
           >
             <Text variant="label" style={{ color: lightColors.semantic.vexCyan }}>
                {`${formatMultiplier(streakMultiplier)}x`}
              </Text>
            </Box>
          </Pressable>
        </Box>
      </Box>
    </Box>
  </Animated.View>
);
