import React, { useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence, FadeIn, FadeOut } from "react-native-reanimated";
import { Box, Text } from "@/components/primitives";
import { useTheme } from "@/theme";
import { CritStatus, getCritStatusText, bossCritService } from "../critical-hit-system";


export const NearMissDisplay: React.FC<NearMissDisplayProps> = ({ nearMissPercent, baseDamage, potentialCritDamage }) => {
  const { theme } = useTheme();

  // Animation values
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(20);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 400 });
    slideUp.value = withSpring(0, { damping: 12, stiffness: 100 });
  }, [fadeIn, slideUp]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  return (
    <Animated.View style={containerStyle}>
      <Box
        p={4}
        borderRadius={16}
        bg={theme.colors.background.secondary}
        style={{
          borderWidth: 2,
          borderColor: theme.colors.accent.purple,
        }}
      >
        <Box alignItems="center">
          <Text style={{ fontSize: 32 }}>💫</Text>
          <Text variant="h3" color={theme.colors.accent.purple} mt={1}>
            Almost a Critical Hit!
          </Text>
          <Text variant="body" color={theme.colors.text.secondary} textAlign="center" mt={1}>
            Rolled {nearMissPercent}% - just missed the crit window!
          </Text>
        </Box>

        {/* Damage comparison */}
        <Box
          flexDirection="row"
          justifyContent="space-around"
          mt={4}
          pt={3}
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
          }}
        >
          <Box alignItems="center">
            <Text variant="caption" color={theme.colors.text.tertiary}>
              Dealt
            </Text>
            <Text variant="h4" color={theme.colors.text.primary}>
              {baseDamage.toLocaleString()}
            </Text>
          </Box>
          <Box alignItems="center" justifyContent="center">
            <Text style={{ fontSize: 20 }}>→</Text>
          </Box>
          <Box alignItems="center">
            <Text variant="caption" color={theme.colors.warning.DEFAULT}>
              Could Have Been
            </Text>
            <Text variant="h4" color={theme.colors.warning.DEFAULT}>
              {potentialCritDamage.toLocaleString()}
            </Text>
          </Box>
        </Box>

        <Box mt={3} alignItems="center">
          <Text variant="caption" color={theme.colors.text.tertiary} textAlign="center">
            "So close! Next session might be the one..."
          </Text>
        </Box>
      </Box>
    </Animated.View>
  );
};

export const CritStatsBadge: React.FC<CritStatsBadgeProps> = ({ userId }) => {
  const { theme } = useTheme();
  const stats = bossCritService.getWeeklyStats(userId);
  const displayText = bossCritService.getCritsThisWeekText(userId);

  // Animation for number change
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    if (stats.totalCrits > 0) {
      scaleAnim.value = withSequence(withSpring(1.2, { damping: 10 }), withTiming(1, { duration: 200 }));
    }
  }, [scaleAnim, stats.totalCrits]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View style={badgeStyle}>
      <Box
        flexDirection="row"
        alignItems="center"
        gap={2}
        px={3}
        py={2}
        borderRadius={12}
        style={{
          backgroundColor: `${theme.colors.warning.DEFAULT}15`,
          borderWidth: 1,
          borderColor: `${theme.colors.warning.DEFAULT}40`,
        }}
      >
        <Text style={{ fontSize: 16 }}>⚡</Text>
        <Text variant="caption" color={theme.colors.warning.DEFAULT} fontWeight="semibold">
          {displayText}
        </Text>
        {stats.totalSessions > 0 && (
          <Text variant="caption" color={theme.colors.text.tertiary}>
            ({stats.critRate.toFixed(0)}% rate)
          </Text>
        )}
      </Box>
    </Animated.View>
  );
};

export function useCriticalHit(sessionId: string, hasBossActive: boolean) {
  const [showOverlay, setShowOverlay] = React.useState(false);
  const [critResult, setCritResult] = React.useState<{
    wasCrit: boolean;
    wasNearMiss: boolean;
    nearMissPercent?: number;
  } | null>(null);

  // Check if overlay should show
  React.useEffect(() => {
    if (hasBossActive) {
      const status = getCritStatusText(sessionId);
      setShowOverlay(status.showOverlay);
    }
  }, [sessionId, hasBossActive]);

  const dismissOverlay = () => {
    setShowOverlay(false);
    bossCritService.markOverlayShown(sessionId);
  };

  const applyDamage = (baseDamage: number) => {
    const result = bossCritService.applyCritDamage(sessionId, baseDamage);
    setCritResult({
      wasCrit: result.wasCrit,
      wasNearMiss: result.wasNearMiss,
      nearMissPercent: result.nearMissPercent,
    });
    return result.finalDamage;
  };

  return {
    showOverlay,
    dismissOverlay,
    applyDamage,
    critResult,
    isCritActive: critResult?.wasCrit ?? false,
    isNearMiss: critResult?.wasNearMiss ?? false,
  };
}