import React from 'react';
import { View } from 'react-native';
import { GlassPill } from '../../../components/glass/GlassPill';
import { LiquidGlassObject } from '../../../components/glass/LiquidGlassObject';
import { Icon } from '../../../icons';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { User } from '../../../types/models';

interface ProfileIdentityBlockProps {
  user: User | null;
  level: number;
  streakDays: number;
}

export function ProfileIdentityBlock({
  user,
  level,
  streakDays,
}: ProfileIdentityBlockProps): JSX.Element {
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          borderColor: 'rgba(255, 255, 255, 0.92)',
          borderRadius: 999,
          borderWidth: 1.5,
          height: 82,
          justifyContent: 'center',
          shadowColor: 'rgba(13, 76, 65, 0.22)',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.20,
          shadowRadius: 20,
          width: 82,
        }}
      >
        <LiquidGlassObject size={74} variant="orb" />
      </View>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 21,
          fontWeight: '800',
          letterSpacing: -0.5,
        }}
      >
        {user?.displayName ?? 'User'}
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 11,
          fontWeight: '500',
          marginTop: -4,
        }}
      >
        {user?.id ?? 'No email available'}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
        <GlassPill
          label={`Level ${level}`}
          leftIcon={
            <Icon color="#0A5E4D" name="star" size="xs" variant="solid" />
          }
          size="sm"
          variant="premium"
        />
        <GlassPill
          label={`${streakDays} Day Streak`}
          leftIcon={
            <Icon color="#A04A12" name="fire" size="xs" variant="solid" />
          }
          size="sm"
          variant="fire"
        />
      </View>
    </View>
  );
}

export default ProfileIdentityBlock;
