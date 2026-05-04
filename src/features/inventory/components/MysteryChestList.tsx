/**
 * MysteryChestList Component
 *
 * Home screen section showing unopened chests.
 * Chest icons pulse gently. Tap to open.
 * Wood → Silver → Gold → Purple → Orange glow by rarity.
 *
 * @phase 3E.2
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { MysteryChest, ChestRarity } from '../../rewards/service';
import { getChestAppearance } from '../../rewards/service';

export interface MysteryChestListProps {
  /** Unopened chests */
  chests: MysteryChest[];
  /** Tap chest to open */
  onOpenChest: (chestId: string) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Individual chest item
 */
function ChestItem({
  chest,
  onPress,
  index,
}: {
  chest: MysteryChest;
  onPress: () => void;
  index: number;
}): JSX.Element {
  const { theme } = useTheme();
  const appearance = getChestAppearance(chest.rarity);

  // Gentle pulse animation
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1, { duration: 1500 }),
            withTiming(1.05, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  // Glow effect for epic/legendary
  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: appearance.color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: appearance.glow
      ? withRepeat(
          withSequence(
            withTiming(0.5, { duration: 1000 }),
            withTiming(0.8, { duration: 1000 })
          ),
          -1,
          true
        )
      : 0.3,
    shadowRadius: appearance.glow ? 15 : 5,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(index * 100)}
      style={[{ marginRight: 16 }, pulseStyle]}
    >
      <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Animated.View
          style={[
            {
              width: 80,
              height: 80,
              borderRadius: 16,
              backgroundColor: `${appearance.color}20`,
              borderWidth: 2,
              borderColor: appearance.color,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 5,
            },
            glowStyle,
          ]}
        >
          <Text fontSize={40}>{appearance.emoji}</Text>
          <Box
            position="absolute"
            bottom={-8}
            px="sm"
            py="xs"
            borderRadius="full"
            bg={appearance.color}
          >
            <Text
              variant="caption"
              color="text.inverse"
              fontWeight="700"
              fontSize={10}
            >
              {appearance.label}
            </Text>
          </Box>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Empty state when no chests
 */
function EmptyChests(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box
      p="lg"
      borderRadius="xl"
      bg="background.tertiary"
      borderWidth={1}
      borderColor="border.light"
      alignItems="center"
    >
      <Text fontSize={32} color="text.tertiary" mb="sm">
        📦
      </Text>
      <Text variant="body" color="text.tertiary" textAlign="center">
        No chests yet. Complete sessions for a chance to earn them!
      </Text>
    </Box>
  );
}

/**
 * Mystery chest list component
 */
export function MysteryChestList({
  chests,
  onOpenChest,
  isLoading = false,
}: MysteryChestListProps): JSX.Element | null {
  const { theme } = useTheme();

  // Only show unopened chests
  const unopenedChests = chests.filter((c) => !c.opened);

  // Don't render if no chests (but show empty state if explicitly loaded)
  if (!isLoading && unopenedChests.length === 0) {
    return null; // Hide section entirely when no chests
  }

  return (
    <Box px="lg" py="md">
      {/* Header */}
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="md">
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Text fontSize={20}>🎁</Text>
          <Text variant="h4" color="text.primary">
            Unopened Chests
          </Text>
          {unopenedChests.length > 0 && (
            <Box
              px="sm"
              py="xs"
              borderRadius="full"
              bg="accent.orange"
            >
              <Text variant="caption" color="text.inverse" fontWeight="700">
                {unopenedChests.length}
              </Text>
            </Box>
          )}
        </Box>
        <Text variant="caption" color="text.tertiary">
          Tap to open
        </Text>
      </Box>

      {/* Chest List */}
      {unopenedChests.length > 0 ? (
        <Box flexDirection="row" flexWrap="wrap">
          {unopenedChests.map((chest, index) => (
            <ChestItem
              key={chest.id}
              chest={chest}
              onPress={() => onOpenChest(chest.id)}
              index={index}
            />
          ))}
        </Box>
      ) : (
        <EmptyChests />
      )}
    </Box>
  );
}

export default MysteryChestList;
