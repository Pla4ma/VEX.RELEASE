import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassPill } from '../../../components/glass/GlassPill';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { Icon } from '../../../icons';
import type { User } from '../../../types/models';

interface ProfileIdentityBlockProps {
  user: User | null;
  streakDays: number;
  level: number;
}

export const ProfileIdentityBlock: React.FC<ProfileIdentityBlockProps> = ({
  user,
  streakDays,
  level,
}) => {
  const displayName = user?.displayName ?? user?.firstName ?? 'Player';

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: 14,
        marginBottom: 14,
        zIndex: 2,
      }}
    >
      <View style={{ width: 72, height: 72 }}>
        <LiquidGlassSphere
          color="mint"
          icon={
            <Icon color="#0C765F" name="user" size="sm" strokeWidth="thin" variant="outline" />
          }
          intensity={0.85}
          size={72}
        />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            color: '#0A1F1A',
            fontSize: 20,
            fontWeight: '800',
            letterSpacing: -0.4,
            lineHeight: 26,
          }}
        >
          {displayName}
        </Text>
        <Text
          style={{
            color: '#3D5A52',
            fontSize: 12,
            fontWeight: '400',
          }}
        >
          Level {level} focus player
        </Text>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
            marginTop: 4,
          }}
        >
          <GlassPill
            label={`${streakDays} streak`}
            leftIcon={
              <Icon color="#F08A4B" name="flame" size="xs" variant="solid" />
            }
            size="sm"
            variant="fire"
          />
          <GlassPill label="2.0x" size="sm" variant="mint" />
        </View>
      </View>
    </View>
  );
};

export default ProfileIdentityBlock;
