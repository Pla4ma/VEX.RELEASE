import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

interface ChestCardProps {
  label: string;
  icon: string;
  glow: string;
  index: number;
  source: string;
  isOpened: boolean;
  onPress: () => void;
}

export function ChestCard({ label, icon, glow, index, source, isOpened, onPress }: ChestCardProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={{ flex: 1, minWidth: 140, maxWidth: '48%' }}
    >
      <Pressable
        onPress={onPress}
        accessibilityLabel={isOpened ? 'Opened chest' : 'Mystery chest'}
        accessibilityRole="button"
        accessibilityHint="View chest details"
      >
        <Box
          p="lg"
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          borderWidth={2}
          borderColor={glow}
          style={{
            shadowColor: glow,
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
            bg={`${glow}20`}
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
            mb="md"
            style={{
              backgroundColor: isOpened ? `${glow}30` : theme.colors.background.tertiary,
            }}
          >
            <Text fontSize={40}>{icon}</Text>
          </Box>

          <Text
            variant="bodySmall"
            color={isOpened ? 'text.secondary' : glow}
            textAlign="center"
            fontWeight="600"
          >
            {label}
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
              {source}
            </Text>
          </Box>

          {isOpened && (
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
