import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../components/glass/GlassCard';
import { LiquidGlassObject } from '../../components/glass/LiquidGlassObject';
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
      <GlassCard padding={20} radius={32} variant="hero">
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(95, 230, 197, 0.22)',
            borderRadius: 280,
            height: 220,
            position: 'absolute',
            right: -50,
            top: -80,
            width: 220,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(132, 228, 229, 0.20)',
            borderRadius: 200,
            height: 140,
            position: 'absolute',
            right: 40,
            top: 60,
            width: 140,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.50)',
            borderRadius: 220,
            height: 130,
            left: 60,
            position: 'absolute',
            top: -10,
            width: 130,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            bottom: -30,
            left: -20,
            position: 'absolute',
          }}
        >
          <LiquidGlassObject size={130} variant="swirl" />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -10,
            top: 0,
          }}
        >
          <LiquidGlassObject size={120} variant="orb" />
        </View>
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
