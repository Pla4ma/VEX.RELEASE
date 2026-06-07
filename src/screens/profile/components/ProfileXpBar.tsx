import React from 'react';
import { View } from 'react-native';
import { GlassProgressBar } from '../../../components/glass/GlassProgressBar';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

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
}: ProfileXpBarProps): JSX.Element {
  return (
    <View style={{ marginTop: 16 }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 11,
            fontWeight: '700',
          }}
        >
          {`Level ${level} | ${xp.toLocaleString()}/${nextLevelThreshold.toLocaleString()} XP`}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 11,
            fontWeight: '600',
          }}
        >
          {`${Math.round(xpPercent)}%`}
        </Text>
      </View>
      <GlassProgressBar height={6} value={xpPercent} variant="premium" />
    </View>
  );
}

export default ProfileXpBar;
