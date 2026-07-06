import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface EncourageActionProps {
  memberName: string;
  onEncourage: () => void;
  onCancel: () => void;
}

export function EncourageAction({ memberName, onEncourage, onCancel }: EncourageActionProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();

  return (
    <Animated.View
      entering={isReducedMotion ? undefined : FadeInUp.duration(200)}
      style={{ marginTop: 8 }}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        px="sm"
        py="xs"
        borderRadius="lg"
        bg={`${theme.colors.primary[500]}15`}
      >
        <Pressable
          onPress={onEncourage}
          accessibilityLabel={`Encourage ${memberName}`}
          accessibilityRole="button"
          accessibilityHint="Sends this squad member encouragement"
        >
          <Box px="md" py="sm" borderRadius="md" bg="primary.500">
            <Text variant="caption" color="text.inverse" fontWeight="600">
              💪 Encourage {memberName}
            </Text>
          </Box>
        </Pressable>
        <Pressable
          onPress={onCancel}
          accessibilityLabel="Cancel encouragement"
          accessibilityRole="button"
          accessibilityHint="Closes the encouragement action"
        >
          <Box px="sm" py="sm">
            <Text variant="caption" color="text.tertiary">
              Cancel
            </Text>
          </Box>
        </Pressable>
      </Box>
    </Animated.View>
  );
}
