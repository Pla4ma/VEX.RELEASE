import React, { useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, FadeIn, FadeOut } from "react-native-reanimated";
import { Box, Text } from "@/components/primitives";
import { useTheme } from "@/theme";
import { CritStatus, getCritStatusText, bossCritService } from "../critical-hit-system";


export const CriticalHitOverlay: React.FC<CriticalHitOverlayProps> = ({ sessionId, visible, onDismiss: _onDismiss, bossName }) => {
  const { theme } = useTheme();
  const status = getCritStatusText(sessionId);

  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    // Pulsing scale animation
    pulseScale.value = withRepeat(withSequence(withTiming(1.05, { duration: 800 }), withTiming(1, { duration: 800 })), -1, true);

    // Glowing animation
    glowOpacity.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })), -1, true);

    // Electric shake
    shakeX.value = withRepeat(withSequence(withTiming(-3, { duration: 50 }), withTiming(3, { duration: 50 }), withTiming(0, { duration: 50 })), -1, true);

    // Mark overlay as shown
    bossCritService.markOverlayShown(sessionId);
  }, [glowOpacity, pulseScale, sessionId, shakeX]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  if (!visible || !status.showOverlay) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[
        {
          position: 'absolute',
          top: 80,
          left: 16,
          right: 16,
          zIndex: 100,
        },
        containerStyle,
      ]}
    >
      {/* Glow background */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -10,
            left: -10,
            right: -10,
            bottom: -10,
            backgroundColor: theme.colors.warning.DEFAULT,
            borderRadius: 20,
          },
          glowStyle,
        ]}
        pointerEvents="none"
      />

      {/* Main card */}
      <Box
        p={4}
        borderRadius={16}
        bg={theme.colors.background.secondary}
        style={{
          borderWidth: 2,
          borderColor: theme.colors.warning.DEFAULT,
          shadowColor: theme.colors.warning.DEFAULT,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <Box flexDirection="row" alignItems="center" gap={3}>
          {/* Lightning icon */}
          <Animated.View style={textShakeStyle}>
            <Box width={50} height={50} borderRadius={25} bg={theme.colors.warning.DEFAULT} alignItems="center" justifyContent="center">
              <Text style={{ fontSize: 28 }}>⚡</Text>
            </Box>
          </Animated.View>

          {/* Text content */}
          <Box flex={1}>
            <Animated.Text style={textShakeStyle}>
              <Text
                variant="h4"
                color={theme.colors.warning.DEFAULT}
                style={{
                  textShadowColor: theme.colors.warning.DEFAULT,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                }}
              >
                CRITICAL HIT CHANCE!
              </Text>
            </Animated.Text>

            <Text variant="bodySmall" color={theme.colors.text.secondary} mt={1}>
              {bossName ? `Maintain focus to deal CRITICAL damage to ${bossName}!` : 'Maintain focus for 2x damage!'}
            </Text>

            <Text variant="caption" color={theme.colors.warning.DEFAULT} mt={1}>
              Don't pause - stay focused!
            </Text>
          </Box>
        </Box>

        {/* Stats row */}
        <Box
          flexDirection="row"
          justifyContent="space-around"
          mt={3}
          pt={3}
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
          }}
        >
          <Box alignItems="center">
            <Text variant="caption" color={theme.colors.text.tertiary}>
              Normal Damage
            </Text>
            <Text variant="body" color={theme.colors.text.secondary}>
              1x
            </Text>
          </Box>
          <Box alignItems="center">
            <Text variant="caption" color={theme.colors.warning.DEFAULT}>
              Critical Damage
            </Text>
            <Text variant="body" color={theme.colors.warning.DEFAULT} fontWeight="bold">
              2x ⚡
            </Text>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
};