import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { TIER_CONFIG } from '../tier-config';
import type { MysteryChest } from '../VaultScreen';

interface ChestCardProps {
  chest: MysteryChest;
  index: number;
  onPress: () => void;
}

export function ChestCard({ chest, index, onPress }: ChestCardProps): JSX.Element {
  const { theme } = useTheme();
  const config = TIER_CONFIG[chest.tier];

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={{ flex: 1, minWidth: 140, maxWidth: '48%' }}
    >
      <Pressable
        onPress={onPress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Box
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={2}
          borderColor={config.glow}
          style={{
            shadowColor: config.glow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Box
            width={80}
            height={80}
            borderRadius="lg"
            bg={`${config.glow}20`}
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
            mb="md"
            style={{
              backgroundColor: chest.isOpened
                ? `${config.glow}30`
                : theme.colors.background.tertiary,
            }}
          >
            <Text fontSize={40}>{chest.isOpened ? config.emoji : '❓'}</Text>
          </Box>

          <Text
            variant="bodySmall"
            color={chest.isOpened ? 'text.secondary' : config.glow}
            textAlign="center"
            fontWeight="600"
          >
            {chest.isOpened ? config.label : 'Mystery Chest'}
          </Text>

          <Box
            mt="xs"
            px="sm"
            py="xs"
            borderRadius="full"
            bg={theme.colors.background.tertiary}
            alignSelf="center"
          >
            <Text variant="caption" color="text.tertiary">
              {chest.source}
            </Text>
          </Box>

          {chest.isOpened && (
            <Box
              mt="sm"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap="xs"
            >
              <Text fontSize={12}>✓</Text>
              <Text variant="caption" color="success.DEFAULT">
                Opened
              </Text>
            </Box>
          )}
        </Box>
      </Pressable>
    </Animated.View>
  );
}
