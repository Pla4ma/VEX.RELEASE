import React, { useState } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { MotivationProfileType } from '../schemas';

interface MotivationScreenProps {
  onSelect: (style: MotivationProfileType) => void;
  onBack?: () => void;
}

interface MotivationOption {
  description: string;
  key: MotivationProfileType;
  label: string;
  shortLabel: string;
}

const MOTIVATION_OPTIONS: MotivationOption[] = [
  { key: 'calm', label: 'Calm', shortLabel: 'Calm', description: 'Gentle focus, low pressure.' },
  { key: 'student', label: 'Study-focused', shortLabel: 'Study', description: 'Structure and learning tools.' },
  { key: 'game_like', label: 'Game-like', shortLabel: 'Game', description: 'Progress feels visual and alive.' },
  { key: 'coach_led', label: 'Coach-led', shortLabel: 'Coach', description: 'Direct guidance and a clear next move.' },
  { key: 'intense', label: 'Intense', shortLabel: 'Drive', description: 'High drive and fewer soft edges.' },
];

function MotivationCard({
  index,
  isSelected,
  onPress,
  option,
}: {
  index: number;
  isSelected: boolean;
  onPress: () => void;
  option: MotivationOption;
}): JSX.Element {
  const { theme } = useTheme();
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isSelected ? theme.colors.primary[500] : theme.colors.background.secondary,
    borderColor: isSelected ? theme.colors.primary[500] : theme.colors.border.light,
    transform: [{ scale: withSpring(isSelected ? 0.96 : 1, { damping: 15, stiffness: 150 }) }],
  }));

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(100 + index * 60)} style={{ width: '48%' }}>
      <Pressable
        onPress={onPress}
        accessibilityLabel={`${option.label}: ${option.description}`}
        accessibilityRole="button"
        accessibilityHint={`Selects ${option.label} motivation style`}
      >
        <Animated.View
          style={[{
            alignItems: 'center',
            borderRadius: theme.borderRadius.lg,
            borderWidth: 2,
            gap: theme.spacing[1],
            minHeight: 120,
            padding: theme.spacing[4],
          }, animatedStyle]}
        >
          <Text variant="label" color={isSelected ? 'text.inverse' : 'text.secondary'}>
            {option.shortLabel}
          </Text>
          <Text variant="h4" color={isSelected ? 'text.inverse' : 'text.primary'} fontWeight="600">
            {option.label}
          </Text>
          <Text
            variant="caption"
            color={isSelected ? 'text.inverse' : 'text.secondary'}
            textAlign="center"
            numberOfLines={2}
          >
            {option.description}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function MotivationScreen({ onSelect, onBack }: MotivationScreenProps): JSX.Element {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<MotivationProfileType | null>(null);

  const handleSelect = (style: MotivationProfileType): void => {
    if (isAdvancing) { return; }
    setSelectedStyle(style);
    setIsAdvancing(true);
    setTimeout(() => { onSelect(style); }, 400);
  };

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      <Box flexDirection="row" alignItems="center" mb="md">
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the previous onboarding screen"
          >
            <Box p="xs"><Text variant="h3" color="text.secondary">Back</Text></Box>
          </Pressable>
        ) : null}
      </Box>

      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="lg">
          <Text variant="label" color="primary.500">Step 1 of 2</Text>
          <Text variant="h2" color="text.primary">How should VEX motivate you?</Text>
          <Text variant="body" color="text.secondary">
            One choice personalizes Home, your coach tone, and what VEX hints at first.
          </Text>
        </Box>
      </Animated.View>

      <Box flexDirection="row" flexWrap="wrap" gap="md" justifyContent="center">
        {MOTIVATION_OPTIONS.map((option, index) => (
          <MotivationCard
            key={option.key}
            index={index}
            isSelected={selectedStyle === option.key}
            onPress={() => handleSelect(option.key)}
            option={option}
          />
        ))}
      </Box>

      <Box flex={1} minHeight={20} />
      <Animated.View entering={FadeIn.duration(400).delay(300)} style={{ marginTop: 'auto' }}>
        <Pressable
          onPress={() => handleSelect('coach_led')}
          accessibilityLabel="Use coach-led motivation style"
          accessibilityRole="button"
          accessibilityHint="Applies a balanced coach style and continues to the first session"
        >
          <Box alignItems="center" py="md">
            <Text variant="bodySmall" color="text.tertiary">Use the balanced coach style</Text>
          </Box>
        </Pressable>
      </Animated.View>
    </Box>
  );
}

export default MotivationScreen;
