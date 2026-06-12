import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassPill } from '../../../components/glass/GlassPill';
import { Icon } from '../../../icons';
import type { User } from '../../../types/models';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

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
  const initial = displayName.slice(0, 1).toUpperCase();

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
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(240, 138, 75, 0.16)',
          borderColor: vexLightGlass.semantic.fire,
          borderRadius: 24,
          borderWidth: 1.4,
          height: 82,
          justifyContent: 'center',
          shadowColor: 'rgba(240, 138, 75, 0.22)',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.22,
          shadowRadius: 14,
          width: 82,
        }}
      >
        <Text
          style={{
            color: vexLightGlass.semantic.fireDeep,
            fontSize: 34,
            fontWeight: '900',
            lineHeight: 38,
          }}
        >
          {initial}
        </Text>
        <View
          style={{
            backgroundColor: '#22C55E',
            borderColor: '#FFFFFF',
            borderRadius: 999,
            borderWidth: 2,
            bottom: 6,
            height: 16,
            position: 'absolute',
            right: 6,
            width: 16,
          }}
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
