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
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 12,
      }}
    >
      <ProfileActionsRow
        onLogout={onLogout}
        onNotificationsPress={onNotificationsPress}
        onSettingsPress={onSettingsPress}
      />
      <GlassCard padding={16} radius={24} variant="hero">
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(95, 230, 197, 0.20)',
            borderRadius: 200,
            height: 150,
            left: 80,
            position: 'absolute',
            top: -40,
            width: 150,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(132, 228, 229, 0.18)',
            borderRadius: 160,
            height: 120,
            position: 'absolute',
            right: 30,
            top: 50,
            width: 120,
          }}
        />
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
