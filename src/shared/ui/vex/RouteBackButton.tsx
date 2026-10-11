import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';

export function RouteBackButton({ onPress }: { onPress: () => void }): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityHint="Returns to the previous VEX screen"
      accessibilityLabel="Go back"
      accessibilityRole="button"
      hitSlop={theme.spacing[2]}
      onPress={onPress}
      style={{ justifyContent: 'center', minHeight: theme.spacing[12], marginBottom: theme.spacing[2] }}
    >
      <Text style={{ color: vexFire.amber, fontSize: theme.typography.ui.label.fontSize, fontWeight: '800', letterSpacing: 1.2 }}>
        ← BACK
      </Text>
    </Pressable>
  );
}
