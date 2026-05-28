import React, { useEffect } from "react";
import { View, Text, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { launchColors } from "@theme/tokens/launch-colors";
import { styles } from "./progress-state.styles";

interface ProgressBarProps {
  progress: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  animated?: boolean;
  style?: ViewStyle;
  showPercentage?: boolean;
}

export function ProgressBar({
  progress,
  height = 8,
  backgroundColor = launchColors.hex_e1e4e8,
  fillColor = launchColors.hex_4ecdc4,
  animated = true,
  style,
  showPercentage = false,
}: ProgressBarProps) {
  const progressAnim = useSharedValue(0);
  useEffect(() => {
    progressAnim.value = animated
      ? withTiming(Math.max(0, Math.min(100, progress)) / 100, {
          duration: 500,
          easing: Easing.out(Easing.ease),
        })
      : Math.max(0, Math.min(100, progress)) / 100;
  }, [progress, animated, progressAnim]);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));
  return (
    <View style={style}>
      <View
        style={[
          styles.progressContainer,
          { height, backgroundColor, borderRadius: height / 2 },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: fillColor, borderRadius: height / 2 },
            fillStyle,
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
}

interface SegmentedProgressProps {
  segments: number;
  completed: number;
  height?: number;
  gap?: number;
}

export function SegmentedProgress({
  segments,
  completed,
  height = 8,
  gap = 4,
}: SegmentedProgressProps) {
  return (
    <View style={[styles.segmentedContainer, { gap }]}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              height,
              borderRadius: height / 2,
              backgroundColor:
                i < completed
                  ? launchColors.hex_4ecdc4
                  : launchColors.hex_e1e4e8,
              flex: 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
}

export function CircularProgress({
  progress,
  size = 64,
  strokeWidth = 6,
  color = launchColors.hex_4ecdc4,
  backgroundColor = launchColors.hex_e1e4e8,
  showText = true,
}: CircularProgressProps) {
  const progressAnim = useSharedValue(0);
  useEffect(() => {
    progressAnim.value = withSpring(
      Math.max(0, Math.min(100, progress)) / 100,
      { damping: 15, stiffness: 100 },
    );
  }, [progress, progressAnim]);
  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={styles.circularSvg}>
        <View
          style={[
            styles.circularBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.circularProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: color,
              borderRightColor: progress > 25 ? color : backgroundColor,
              borderBottomColor: progress > 50 ? color : backgroundColor,
              borderLeftColor: progress > 75 ? color : backgroundColor,
            },
            useAnimatedStyle(() => ({
              transform: [{ rotate: `${progressAnim.value * 360}deg` }],
            })),
          ]}
        />
      </View>
      {showText && (
        <Text style={[styles.circularText, { fontSize: size * 0.25 }]}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
}
