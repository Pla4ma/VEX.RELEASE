import React from 'react';
import { View, Dimensions } from 'react-native';
import { GlassCard } from '../../components/glass/GlassCard';
import { WaterBubble } from '../../components/glass/WaterBubble';
import { LiquidGlassSphere } from '../../components/glass/LiquidGlassSphere';
import { LiquidLens } from '../../components/glass/LiquidLens';
import { CrystalAvatar } from '../../components/glass/CrystalAvatar';
import { FloatingDroplets } from '../../components/glass/FloatingDroplets';
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

const { width: SCREEN_W } = Dimensions.get('window');

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
      {/* Cinematic water-filled capsule atmosphere */}
      <View
        pointerEvents="none"
        style={{
          left: -28,
          opacity: 0.85,
          position: 'absolute',
          top: 32,
          zIndex: 0,
        }}
      >
        <LiquidLens size={140} opacity={0.65} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: -12,
          top: 48,
          zIndex: 0,
        }}
      >
        <WaterBubble size={72} opacity={0.65} />
      </View>
      <View
        pointerEvents="none"
        style={{
          left: SCREEN_W * 0.58,
          opacity: 0.85,
          position: 'absolute',
          top: 28,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={6} opacity={0.65} size={60} />
      </View>
      <View
        pointerEvents="none"
        style={{
          left: SCREEN_W * 0.72,
          opacity: 0.85,
          position: 'absolute',
          top: 52,
          zIndex: 0,
        }}
      >
        <LiquidGlassSphere color="pearl" size={18} intensity={0.58} />
      </View>
      {/* Crystal avatar orb floating near identity block */}
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 28,
          top: 72,
          zIndex: 0,
        }}
      >
        <CrystalAvatar size={64} isOnline />
      </View>
      <GlassCard padding={18} radius={28} variant="hero" glowMint>
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
