import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export function EmptyStakesMessage(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
        padding: theme.spacing[3],
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      }}
    >
      <Text fontSize={20}>✨</Text>
      <View style={{ flex: 1 }}>
        <Text variant="body" fontWeight="500" color="text.primary">
          Every session builds your streak
        </Text>
        <Text variant="caption" color="text.secondary">
          Start focusing and create momentum
        </Text>
      </View>
    </View>
  );
}
