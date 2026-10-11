import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { SessionGlyph } from '../../../shared/ui/liquid-glass/SessionGlyphs';
import { vexFire } from '../../../theme/tokens/vex-fire';

    
export function EmptyStakesMessage(): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        borderRadius: theme.borderRadius.lg,
        backgroundColor: vexFire.panel,
        borderWidth: 1,
        borderColor: vexFire.border,
      }}
    >
      <SessionGlyph name="stake" size={36} />
      <View style={{ flex: 1 }}>
        <Text variant="body" fontWeight="500" color={vexFire.cream}>
          Every session builds your streak
        </Text>
        <Text variant="caption" color={vexFire.textSecondary}>
          Start focusing and create momentum
        </Text>
      </View>
    </View>
  );
}
