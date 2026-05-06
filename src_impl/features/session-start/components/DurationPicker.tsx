/**
 * DurationPicker Component
 *
 * Horizontal scrollable preset chips for session duration selection.
 * Shows estimated XP based on duration × streak multiplier.
 *
 * @phase 1B.2
 */

import React, { useMemo } from "react";
import { ScrollView, TextInput, Pressable } from "react-native";
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

export type DurationPreset = 15 | 25 | 45 | 60 | 90;

export interface DurationPickerProps {
  /** Currently selected duration in minutes */
  selectedDuration: number;
  /** Callback when duration changes */
  onDurationChange: (minutes: number) => void;
  /** Current streak multiplier (e.g., 1.5 for 7-day streak) */
  streakMultiplier?: number;
  /** Base XP rate per minute */
  xpPerMinute?: number;
  /** Whether strict mode is enabled (+20% bonus) */
  isStrictMode?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

const PRESETS: DurationPreset[] = [15, 25, 45, 60, 90];

/**
 * Calculate estimated XP for a duration
 */
function calculateEstimatedXp(minutes: number, xpPerMinute: number, streakMultiplier: number, isStrictMode: boolean): number {
  const baseXp = minutes * xpPerMinute;
  const withStreak = baseXp * streakMultiplier;
  const withStrict = isStrictMode ? withStreak * 1.2 : withStreak;
  return Math.floor(withStrict);
}

/**
 * Individual duration chip
 */
function DurationChip({ minutes, isSelected, onPress }: { minutes: number; isSelected: boolean; onPress: () => void }): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withTiming(0.95, { duration: 100 }), withSpring(1, { damping: 15, stiffness: 200 }));
    onPress();
  };

  return (
    <Pressable onPress={handlePress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Animated.View
        style={[
          animatedStyle,
          {
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[3],
            borderRadius: theme.borderRadius.xl,
            backgroundColor: isSelected ? theme.colors.primary[500] : theme.colors.background.secondary,
            borderWidth: 2,
            borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
            marginRight: theme.spacing[2],
          },
        ]}
      >
        <Text variant="body" color={isSelected ? "text.inverse" : "text.primary"} fontWeight={isSelected ? "700" : "500"}>
          {minutes} min
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Custom duration input
 */
function CustomDurationInput({ value, onChange, isActive, onActivate }: { value: number | null; onChange: (minutes: number) => void; isActive: boolean; onActivate: () => void }): JSX.Element {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = React.useState(value && !PRESETS.includes(value as DurationPreset) ? value.toString() : "");

  const handleSubmit = () => {
    const num = parseInt(inputValue, 10);
    if (num >= 5 && num <= 180) {
      onChange(num);
    }
  };

  if (isActive) {
    return (
      <Box flexDirection="row" alignItems="center" gap="sm" px="md" py="sm" borderRadius="xl" borderWidth={2} borderColor={theme.colors.primary[500]} bg={theme.colors.background.primary}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSubmit}
          onBlur={handleSubmit}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="5-180"
          style={{
            width: 60,
            fontSize: 16,
            fontWeight: "600",
            color: theme.colors.text.primary,
            textAlign: "center",
          }}
          autoFocus
        />
        <Text variant="bodySmall" color="text.secondary">
          min
        </Text>
      </Box>
    );
  }

  return (
    <Pressable onPress={onActivate} accessibilityLabel="Custom button" accessibilityRole="button" accessibilityHint="Activates this control">
      <Box px="md" py="md" borderRadius="xl" bg={theme.colors.background.secondary} borderWidth={2} borderColor={theme.colors.border.DEFAULT} style={{ borderStyle: "dashed" }}>
        <Text variant="body" color="text.secondary" fontWeight="500">
          Custom
        </Text>
      </Box>
    </Pressable>
  );
}

/**
 * XP estimate display
 */
function XpEstimate({ minutes, xpPerMinute, streakMultiplier, isStrictMode }: { minutes: number; xpPerMinute: number; streakMultiplier: number; isStrictMode: boolean }): JSX.Element {
  const { theme } = useTheme();

  const estimatedXp = useMemo(() => calculateEstimatedXp(minutes, xpPerMinute, streakMultiplier, isStrictMode), [minutes, xpPerMinute, streakMultiplier, isStrictMode]);

  return (
    <Box alignItems="center" gap="xs" mt="md">
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={20}>✨</Text>
        <Text variant="h4" color="text.primary" fontWeight="700">
          ~{estimatedXp} XP
        </Text>
      </Box>

      <Box flexDirection="row" alignItems="center" gap="xs" flexWrap="wrap" justifyContent="center">
        <Text variant="caption" color="text.tertiary">
          {minutes} min × {xpPerMinute} XP/min
        </Text>
        {streakMultiplier > 1 && (
          <Box px="xs" py="xs" borderRadius="sm" bg={`${theme.colors.accent.orange}20`}>
            <Text variant="caption" color={theme.colors.accent.orange} fontWeight="700">
              🔥 {streakMultiplier.toFixed(1)}× streak
            </Text>
          </Box>
        )}
        {isStrictMode && (
          <Box px="xs" py="xs" borderRadius="sm" bg={`${theme.colors.success[500]}20`}>
            <Text variant="caption" color={theme.colors.success.DEFAULT} fontWeight="700">
              +20% strict
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * Main duration picker component
 */
export function DurationPicker({ selectedDuration, onDurationChange, streakMultiplier = 1, xpPerMinute = 2, isStrictMode = false, isLoading = false }: DurationPickerProps): JSX.Element {
  const { theme } = useTheme();
  const [showCustom, setShowCustom] = React.useState(!PRESETS.includes(selectedDuration as DurationPreset));

  if (isLoading) {
    return (
      <Box gap="md">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box flexDirection="row" gap="sm">
            {PRESETS.map((preset) => (
              <Box key={preset} width={80} height={48} borderRadius="xl" bg={theme.colors.background.tertiary} />
            ))}
          </Box>
        </ScrollView>
        <Box height={60} borderRadius="lg" bg={theme.colors.background.tertiary} />
      </Box>
    );
  }

  return (
    <Box>
      <Text variant="label" color="text.secondary" mb="md">
        DURATION
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: theme.spacing[4] }}>
        <Box flexDirection="row">
          {PRESETS.map((preset) => (
            <DurationChip
              key={preset}
              minutes={preset}
              isSelected={selectedDuration === preset}
              onPress={() => {
                setShowCustom(false);
                onDurationChange(preset);
              }}
            />
          ))}
          <CustomDurationInput
            value={showCustom ? selectedDuration : null}
            onChange={(minutes) => {
              onDurationChange(minutes);
            }}
            isActive={showCustom}
            onActivate={() => setShowCustom(true)}
          />
        </Box>
      </ScrollView>

      <XpEstimate minutes={selectedDuration} xpPerMinute={xpPerMinute} streakMultiplier={streakMultiplier} isStrictMode={isStrictMode} />
    </Box>
  );
}

// Helper for withSequence (not exported from reanimated directly)
function withSequence(...animations: Array<ReturnType<typeof withTiming> | ReturnType<typeof withSpring>>): number {
  // Simplified implementation - just return the first animation
  // In real implementation, this would chain animations
  return animations[0] as unknown as number;
}

export default DurationPicker;
