import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { CrystalAvatar } from '../../../components/glass/CrystalAvatar';
import { Icon } from '../../../icons/components/Icon';
import type { User } from '../../../types/models';
import { useTheme } from '../../../theme/ThemeContext';


interface ProfileIdentityBlockProps {
  user: User | null;
  streakDays: number;
  level: number;
}

export const ProfileIdentityBlock: React.ComponentType<ProfileIdentityBlockProps> = ({
  user,
  streakDays,
  level,
}) => {
  const { theme } = useTheme();
  const displayName = user?.displayName ?? user?.firstName ?? 'Player';

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14, marginBottom: 14 }}>
      <CrystalAvatar active={streakDays > 0} size={72} />
      <View style={{ flex: 1, gap: theme.spacing[1] }}>
        <Text variant="h3">{displayName}</Text>
        <Text color={vexFire.textSecondary} variant="bodySmall">Level {level} focus player</Text>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[1] }}>
          <View style={{ alignItems: 'center', backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.full, flexDirection: 'row', gap: theme.spacing[1], minHeight: 32, paddingHorizontal: theme.spacing[3] }}>
            <Icon color={vexFire.ember} name="flame" size="xs" variant="solid" />
            <Text color={vexFire.ember} variant="label">{streakDays} streak</Text>
          </View>
          <View style={{ backgroundColor: vexFire.ember, borderRadius: theme.borderRadius.full, minHeight: 32, justifyContent: 'center', paddingHorizontal: theme.spacing[3] }}>
            <Text style={{ color: vexFire.ember, fontWeight: '800' }} variant="label">2.0x</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
