import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

interface ProfileXpBarProps {
  level: number;
  xp: number;
  nextLevelThreshold: number;
  xpPercent: number;
}

export function ProfileXpBar({
  level,
  xp,
  nextLevelThreshold,
  xpPercent,
}: ProfileXpBarProps): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View style={{ marginTop: theme.spacing[3] }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing[2],
        }}
      >
        <Text variant="label">
          {`Level ${level} | ${xp.toLocaleString()}/${nextLevelThreshold.toLocaleString()} XP`}
        </Text>
        <Text color={vexFire.textSecondary} variant="label">{`${Math.round(xpPercent)}%`}</Text>
      </View>
      <View style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.full, height: 8, overflow: 'hidden' }}>
        <View style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.full, height: 8, width: `${Math.max(0, Math.min(100, xpPercent))}%` }} />
      </View>
    </View>
  );
}
