import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../components/glass/GlassCard';
import { VexAssetImage } from '../../components/glass/VexAssetImage';
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
        paddingHorizontal: 12,
        paddingBottom: 4,
      }}
    >
      <ProfileActionsRow
        onLogout={onLogout}
        onNotificationsPress={onNotificationsPress}
        onSettingsPress={onSettingsPress}
      />
      <View
        pointerEvents="none"
        style={{
          opacity: 0.28,
          position: 'absolute',
          right: 8,
          top: 70,
          zIndex: 0,
        }}
      >
        <VexAssetImage name="orangeMastery" opacity={0.78} size={72} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.18,
          position: 'absolute',
          right: 54,
          top: 104,
          zIndex: 0,
        }}
      >
        <VexAssetImage name="streakFlame" opacity={0.64} size={34} />
      </View>
      <GlassCard padding={20} radius={28} variant="hero" glowMint>
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
