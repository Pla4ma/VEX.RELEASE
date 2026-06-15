import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { SessionGlyph } from '../../../shared/ui/liquid-glass/SessionGlyphs';

export function EmptyStakesMessage(): React.ReactNode {
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
      <SessionGlyph name="stake" size={36} />
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
