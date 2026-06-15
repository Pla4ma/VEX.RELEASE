import React from 'react';

import { Box, Button, Text } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme/ThemeContext';

type SessionCompleteStateProps = {
  body: string;
  ctaLabel: string;
  onPress: () => void;
  title: string;
  variant: 'empty' | 'error' | 'loading' | 'offline';
};

export function SessionCompleteState({
  body,
  ctaLabel,
  onPress,
  title,
  variant,
}: SessionCompleteStateProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <Box
      flex={1}
      justifyContent="center"
      px="2xl"
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      <Box
        borderRadius={theme.borderRadius.lg}
        p="xl"
        style={{ backgroundColor: theme.colors.background.secondary }}
      >
        <Text variant="label" color={theme.colors.primary[400]}>
          {variant === 'loading' ? 'Building your receipt' : 'Session saved'}
        </Text>
        <Text variant="h3" color={theme.colors.text.primary} mt="sm">
          {title}
        </Text>
        <Text variant="body" color={theme.colors.text.secondary} mt="sm">
          {body}
        </Text>
        <Button
          accessibilityHint={body}
          accessibilityLabel={ctaLabel}
          accessibilityRole="button"
          fullWidth
          mt="xl"
          onPress={onPress}
          variant={variant === 'error' ? 'secondary' : 'primary'}
        >
          {ctaLabel}
        </Button>
      </Box>
    </Box>
  );
}
