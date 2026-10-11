import React from 'react';

import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Icon } from '../../../icons/components/Icon';
import { formatMultiplier, withAlpha } from '../utils/active-session';
import { vexFire } from '../../../theme/tokens/vex-fire';

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
  onPauseResume: () => void;
  onToggleMultiplierInfo: () => void;
};

            
export const ActiveSessionControlDock: React.ComponentType<
  ActiveSessionControlDockProps
> = ({
  completionPercentage,
  isPaused,
  multiplierDays,
  phaseAccent: _phaseAccent,
  showMultiplierInfo,
  streakMultiplier,
  themeColors,
  onComplete,
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
              backgroundColor: vexFire.panelSoft,
              borderWidth: 1,
              borderColor: vexFire.borderStrong,
            }}
          >
            <Text variant="label" style={{ color: vexFire.ember }}>
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
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          borderWidth: 1,
          paddingHorizontal: 14,
          paddingVertical: 12,
          backgroundColor: withAlpha(themeColors.backgroundElevated, 0.88),
          borderColor: withAlpha(themeColors.border, 0.7),
        }}
      >
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
              backgroundColor: vexFire.ember,
            }}
          >
            <Icon
              name={isPaused ? 'play' : 'minus'}
              size="lg"
              color={vexFire.background}
            />
          </Box>
        </Pressable>
        <Box style={{ position: 'absolute', right: 14 }}>
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
              <Text variant="caption" color={vexFire.cream}>
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
              style={{}}
           >
              <Text variant="label" style={{ color: vexFire.ember }}>
                {`${formatMultiplier(streakMultiplier)}x`}
              </Text>
            </Box>
          </Pressable>
        </Box>
      </Box>
    </Box>
  </Animated.View>
);
