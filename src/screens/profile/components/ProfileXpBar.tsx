import React from 'react';
import { View } from 'react-native';
import { LiquidProgressBar } from '../../../components/glass/LiquidProgressBar';
import { Text } from '../../../components/primitives/Text';

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
    <View style={{ marginTop: 12, zIndex: 2 }}>
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
            fontSize: 12,
            fontWeight: '800',
          }}
        >
          {`Level ${level} | ${xp.toLocaleString()}/${nextLevelThreshold.toLocaleString()} XP`}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 12,
            fontWeight: '700',
          }}
        >
          {`${Math.round(xpPercent)}%`}
        </Text>
      </View>
      <LiquidProgressBar height={8} progress={xpPercent / 100} />
    </View>
  );
}

export default ProfileXpBar;
