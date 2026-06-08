import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../components/glass/GlassCard';
import type { User } from '../../types/models';
import { ProfileActionsRow } from './components/ProfileActionsRow';
import { ProfileIdentityBlock } from './components/ProfileIdentityBlock';
import { ProfileXpBar } from './components/ProfileXpBar';

interface ProfileHeaderProps {
  user: User | null;
  streakDays: number;
  level: number;
  xp: number;
  nextLevelThreshold: number;
  xpPercent: number;
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
  onLogout: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  streakDays,
  level,
  xp,
  nextLevelThreshold,
  xpPercent,
  onSettingsPress,
  onNotificationsPress,
  onLogout,
}) => {
  return (
    <View
      style={{
        paddingTop: 4,
        paddingHorizontal: 16,
        paddingBottom: 4,
      }}
    >
      <ProfileActionsRow
        onLogout={onLogout}
        onNotificationsPress={onNotificationsPress}
        onSettingsPress={onSettingsPress}
      />
      <GlassCard padding={16} radius={24} variant="hero">
        <ProfileIdentityBlock
          level={level}
          streakDays={streakDays}
          user={user}
        />
        <ProfileXpBar
          level={level}
          nextLevelThreshold={nextLevelThreshold}
          xp={xp}
          xpPercent={xpPercent}
        />
      </GlassCard>
    </View>
  );
};

export default ProfileHeader;
