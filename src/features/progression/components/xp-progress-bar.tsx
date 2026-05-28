import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import { launchColors } from "@theme/tokens/launch-colors";
import { styles } from "./xp-progress-bar.styles";

interface XpProgressBarProps {
  currentXp: number;
  threshold: number;
  level: number;
  totalXp: number;
  isAnimating?: boolean;
  xpJustAdded?: number;
  onLevelUp?: () => void;
}

const { width } = Dimensions.get("window");
const BAR_WIDTH = width - 48;
const BAR_HEIGHT = 24;

export const XpProgressBar: React.FC<XpProgressBarProps> = ({
  currentXp,
  threshold,
  level,
  totalXp,
  isAnimating = false,
  xpJustAdded = 0,
  onLevelUp,
}) => {
  const progressAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const progressPercent = Math.min(100, (currentXp / threshold) * 100);
  const progressWidth = (BAR_WIDTH * progressPercent) / 100;

  useEffect(() => {
    progressAnim.value = withSpring(progressWidth, {
      damping: 12,
      stiffness: 100,
    });
  }, [progressAnim, progressWidth]);

  useEffect(() => {
    if (isAnimating && xpJustAdded > 0) {
      pulseAnim.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 }),
      );
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: progressWidth + Math.random() * 40 - 20,
        y: Math.random() * 20 - 10,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 1000);
    }
  }, [isAnimating, xpJustAdded, progressWidth, pulseAnim]);

  useEffect(() => {
    if (progressPercent >= 100) {
      setShowLevelUp(true);
      onLevelUp?.();
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [progressPercent, onLevelUp]);

  const getTierColor = (lvl: number): [string, string] => {
    if (lvl >= 50) {
      return [launchColors.hex_ffd700, launchColors.hex_ffa500];
    }
    if (lvl >= 25) {
      return [launchColors.hex_c0c0c0, launchColors.hex_808080];
    }
    if (lvl >= 10) {
      return [launchColors.hex_cd7f32, launchColors.hex_8b4513];
    }
    return [launchColors.hex_4caf50, launchColors.hex_2e7d32];
  };

  const [startColor, endColor] = getTierColor(level);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progressAnim.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={styles.levelBadgeContainer}>
        <Svg width={56} height={56}>
          <Circle
            cx={28}
            cy={28}
            r={26}
            fill={launchColors.hex_1a1a2e}
            stroke={startColor}
            strokeWidth={3}
          />
          <G>
            <SvgText
              x={28}
              y={24}
              textAnchor="middle"
              fill={launchColors.hex_fff}
              fontSize={10}
              fontWeight="600"
            >
              LV
            </SvgText>
            <SvgText
              x={28}
              y={42}
              textAnchor="middle"
              fill={startColor}
              fontSize={18}
              fontWeight="bold"
            >
              {level}
            </SvgText>
          </G>
        </Svg>
      </View>

      <View style={styles.barContainer}>
        <View style={[styles.track, { width: BAR_WIDTH }]}>
          <LinearGradient
            colors={[launchColors.hex_2a2a4a, launchColors.hex_1a1a2e]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <Animated.View style={[styles.progressFill, progressAnimatedStyle]}>
          <LinearGradient
            colors={[startColor, endColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.shine} />
          <View style={[styles.tipGlow, { shadowColor: startColor }]} />
        </Animated.View>

        {particles.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: BAR_HEIGHT / 2 + particle.y,
                backgroundColor: startColor,
              },
            ]}
          />
        ))}

        <View style={styles.xpTextContainer}>
          <Text style={styles.xpText}>
            <Text style={[styles.xpCurrent, { color: startColor }]}>
              {currentXp}
            </Text>
            <Text style={styles.xpSeparator}> / </Text>
            <Text style={styles.xpThreshold}>{threshold} XP</Text>
          </Text>
        </View>

        {showLevelUp && (
          <Animated.View style={styles.levelUpBadge}>
            <Text style={styles.levelUpText}>LEVEL UP!</Text>
          </Animated.View>
        )}
      </View>

      <Text style={styles.totalXp}>Total: {totalXp.toLocaleString()} XP</Text>
    </Animated.View>
  );
};
