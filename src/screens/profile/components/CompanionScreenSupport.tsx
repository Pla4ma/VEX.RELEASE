import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Box, Card, Text } from '../../../components/primitives';
import {
  type CompanionElement,
  type CompanionMood,
  type CompanionPhase,
  type CompanionState,
} from '../../../features/companion/types';
import { getEvolutionProgress } from '../../../features/companion/session-storage';

export const PHASE_NAMES: Record<CompanionPhase, string> = {
  AWAKENED: 'Awakened',
  EGG: 'Egg',
  HATCHING: 'Hatching',
  MATURE: 'Mature',
  TRANSCENDENT: 'Transcendent',
  YOUNG: 'Young',
};

export const PHASE_ORDER: CompanionPhase[] = [
  'EGG',
  'HATCHING',
  'YOUNG',
  'MATURE',
  'AWAKENED',
  'TRANSCENDENT',
];

export const ELEMENT_LORE: Record<CompanionElement, string> = {
  FLAME:
    'Born from determination. Flame companions thrive on intense focus sessions.',
  LUMINA:
    'Pure and exacting. Lumina companions illuminate the path to mastery.',
  TERRA: 'Grounded in steady progress. Terra companions reward patient focus.',
  VOID: 'Mysterious and intensive. Void companions draw power from deep focus states.',
  WAVE: 'Flowing with consistency. Wave companions excel in sustained calm focus.',
  ZEPHYR: 'Swift and adaptable. Zephyr companions shine in quick focus bursts.',
};

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <Card size="sm" style={{ flex: 1 }}>
      <Box alignItems="center" gap="xs">
        <Text
          variant="h4"
          color="text.primary"
          fontWeight="700"
          textAlign="center"
        >
          {value}
        </Text>
        <Text variant="caption" color="text.tertiary" textAlign="center">
          {label}
        </Text>
      </Box>
    </Card>
  );
}

export function PhaseProgressBar({
  currentPhase,
}: {
  currentPhase: CompanionPhase;
}): JSX.Element {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  return (
    <Box flexDirection="row" justifyContent="space-between" alignItems="center">
      {PHASE_ORDER.map((phase, index) => (
        <Box key={phase} alignItems="center" flex={1}>
          <Box
            width={32}
            height={32}
            borderRadius="full"
            bg={index <= currentIndex ? 'primary.500' : 'background.tertiary'}
          />
          <Text
            variant="caption"
            color="text.tertiary"
            mt="xs"
            textAlign="center"
          >
            {PHASE_NAMES[phase]}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

export function ProgressToNext({
  companion,
}: {
  companion: CompanionState;
}): JSX.Element {
  if (companion.phase === 'TRANSCENDENT') {
    return (
      <Text variant="bodySmall" color="text.secondary">
        Maximum evolution reached.
      </Text>
    );
  }
  return (
    <Text variant="bodySmall" color="text.secondary">
      {Math.floor(getEvolutionProgress(companion) * 100)}% to{' '}
      {PHASE_NAMES[getNextPhase(companion.phase)]}
    </Text>
  );
}

export function MoodDot({ mood }: { mood: CompanionMood }): JSX.Element {
  const scale = useSharedValue(0);
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      accessibilityLabel={`Recent mood ${mood}`}
      style={animatedStyle}
    >
      <Box width={24} height={24} borderRadius="full" bg="primary.500" />
    </Animated.View>
  );
}

export function CompanionScreenSkeleton({
  heroHeight,
}: {
  heroHeight: number;
}): JSX.Element {
  return (
    <Box flex={1} bg="background.primary">
      <Box
        height={heroHeight}
        bg="background.secondary"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          width={200}
          height={200}
          borderRadius="full"
          bg="background.tertiary"
        />
      </Box>
      <Box p="lg" gap="lg">
        <Box
          height={32}
          width={200}
          borderRadius="md"
          bg="background.tertiary"
        />
        <Box height={100} borderRadius="lg" bg="background.secondary" />
      </Box>
    </Box>
  );
}

function getNextPhase(currentPhase: CompanionPhase): CompanionPhase {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  return (
    PHASE_ORDER[Math.min(currentIndex + 1, PHASE_ORDER.length - 1)] ??
    currentPhase
  );
}
