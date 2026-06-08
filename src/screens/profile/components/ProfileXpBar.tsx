import React from 'react';
import { View } from 'react-native';
import { GlassProgressBar } from '../../../components/glass/GlassProgressBar';
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
            color: '#0A1F1A',
            fontSize: 12,
            fontWeight: '800',
          }}
        >
          {`Level ${level} | ${xp.toLocaleString()}/${nextLevelThreshold.toLocaleString()} XP`}
        </Text>
        <Text
          style={{
            color: '#3D5A52',
            fontSize: 12,
            fontWeight: '700',
          }}
        >
          {`${Math.round(xpPercent)}%`}
        </Text>
      </View>
      <GlassProgressBar height={8} value={xpPercent} variant="premium" />
    </View>
  );
}

export default ProfileXpBar;
