import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

interface NameAvatarPreviewProps {
  name: string;
}

export function NameAvatarPreview({ name }: NameAvatarPreviewProps) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={{ marginTop: theme.spacing[8] }}
    >
      <Box alignItems="center" gap="md">
        <Box
          width={80}
          height={80}
          borderRadius="full"
          bg={theme.colors.primary[500]}
          justifyContent="center"
          alignItems="center"
        >
          <Text
            fontSize={32}
            color={theme.colors.text.inverse}
            fontWeight="700"
          >
            {name.charAt(0).toUpperCase()}
          </Text>
        </Box>
        <Text variant="body" color="text.secondary">
          Nice to meet you, {name.trim()}!
        </Text>
      </Box>
    </Animated.View>
  );
}
