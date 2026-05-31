import React, { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { FocusDuration, DurationOption } from '../schemas';
import { DURATION_OPTIONS } from '../service';
interface FocusTimeScreenProps {
  onSelect: (duration: FocusDuration) => void;
  onSkip: () => void;
}
function DurationCard({
  option,
  isSelected,
  onPress,
  index,
}: {
  option: DurationOption;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSpring(isSelected ? 0.95 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isSelected, scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const backgroundColor = isSelected
    ? theme.colors.accent.purple
    : theme.colors.background.secondary;
  const borderColor = isSelected
    ? theme.colors.accent.purple
    : theme.colors.border.light;
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(200 + index * 100)}
      style={{ flex: 1, minWidth: '45%' }}
    >
      <Pressable
        onPress={onPress}
        accessibilityLabel="Focus time option"
        accessibilityRole="button"
        accessibilityHint="Double tap to select"
      >
        <Animated.View
          style={[
            {
              padding: theme.spacing[6],
              borderRadius: 16,
              borderWidth: 2,
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing[3],
              minHeight: 120,
              backgroundColor,
              borderColor,
            },
            animatedStyle,
          ]}
        >
          <Text fontSize={32}>{option.emoji}</Text>
          <Text
            variant="h3"
            color={isSelected ? 'text.inverse' : 'text.primary'}
            fontWeight="700"
          >
            {option.label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
export function FocusTimeScreen({
  onSelect,
  onSkip,
  onBack,
}: FocusTimeScreenProps & { onBack?: () => void }): JSX.Element {
  const [selectedDuration, setSelectedDuration] =
    useState<FocusDuration | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const handleSelect = (duration: FocusDuration) => {
    if (isAdvancing) {
      return;
    }
    setSelectedDuration(duration);
    setIsAdvancing(true);
    setTimeout(() => {
      onSelect(duration);
    }, 300);
  };
  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      {}
      <Box flexDirection="row" alignItems="center" mb="md">
        {onBack && (
          <Pressable onPress={onBack} style={{ marginRight: 12 }}>
            <Box p="xs">
              <Text variant="h3" color="text.secondary">
                ‹
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>

      {}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="xl">
          <Text variant="label" color="primary.500">
            Step 2 of 4
          </Text>
          <Text variant="h2" color="text.primary">
            How long can you usually focus?
          </Text>
          <Text variant="body" color="text.secondary">
            This sets your default session length.
          </Text>
        </Box>
      </Animated.View>

      {}
      <Box flexDirection="row" flexWrap="wrap" gap="md" justifyContent="center">
        {DURATION_OPTIONS.map((option, index) => (
          <DurationCard
            key={option.value}
            option={option}
            isSelected={selectedDuration === option.value}
            onPress={() => handleSelect(option.value)}
            index={index}
          />
        ))}
      </Box>

      {}
      <Animated.View entering={FadeIn.duration(400).delay(600)}>
        <Box mt="xl" p="md" borderRadius="lg" bg="background.secondary">
          <Text variant="bodySmall" color="text.tertiary" textAlign="center">
            💡 Tip: 25 minutes is the classic Pomodoro length. Great for
            beginners!
          </Text>
        </Box>
      </Animated.View>

      {}
      <Animated.View
        entering={FadeIn.duration(400).delay(700)}
        style={{ marginTop: 'auto' }}
      >
        <Pressable
          onPress={onSkip}
          accessibilityLabel="Skip for now"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">
              Skip for now ›
            </Text>
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
}
export default FocusTimeScreen;
