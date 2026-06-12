import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassPill } from '../../../components/glass/GlassPill';
import { CrystalAvatar } from '../../../components/glass/CrystalAvatar';
import { Icon } from '../../../icons';
import type { User } from '../../../types/models';
import { useTheme } from '../../../theme';
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
  const { theme } = useTheme();
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
      <View style={{ width: 96, height: 96 }}>
        <CrystalAvatar active={streakDays > 0} size={96} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            color: theme.colors.text.primary,
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
            color: theme.colors.text.secondary,
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
              <Icon
                color={vexLightGlass.semantic.fire}
                name="flame"
                size="xs"
                variant="solid"
              />
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
