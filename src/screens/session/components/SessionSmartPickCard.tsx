import React from 'react';
import { Image, Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { LiquidGlassCard } from '../../../shared/ui/liquid-glass';

type SessionSmartPickCardProps = {
  description: string;
  onSelect: () => void;
};

export function SessionSmartPickCard({
  description,
  onSelect,
}: SessionSmartPickCardProps): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <LiquidGlassCard emphasized>
      <Box flexDirection="row" gap="md" alignItems="center">
        <Box
          width={64}
          height={64}
          borderRadius={24}
          bg="semantic.surfaceElevated"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            source={require('../../../assets/generated/session/focus-talisman.png')}
            resizeMode="contain"
            style={{ height: 72, width: 72 }}
            accessibilityLabel="Liquid glass focus talisman"
          />
        </Box>
        <Box flex={1}>
          <Text variant="label" color="text.primary">
            Smart Pick
          </Text>
          <Text variant="body" color="text.secondary" mt="xs">
            {description}
          </Text>
        </Box>
      </Box>
      <Pressable
        onPress={onSelect}
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.semantic.primary,
          borderRadius: 999,
          marginTop: theme.spacing[4],
          minHeight: 48,
          justifyContent: 'center',
        }}
        accessibilityLabel="Use smart pick"
        accessibilityRole="button"
        accessibilityHint="Applies the recommended session preset"
      >
        <Text variant="button" color="text.inverse">
          Use this
        </Text>
      </Pressable>
    </LiquidGlassCard>
  );
}
