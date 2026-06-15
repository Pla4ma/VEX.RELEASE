import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
import { LiquidProgressBar } from '../../../components/glass/LiquidProgressBar';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { ProgressionStatCard } from './progression-stat-card';

export interface ProgressionDashboardProps {
  level?: number;
  nextLevelThreshold?: number;
  xp?: number;
  xpPercent?: number;
  onStartSession?: () => void;
  userId?: string;
}

export const ProgressionDashboard: React.FC<ProgressionDashboardProps> = ({
  level = 1,
  nextLevelThreshold = 100,
  xp = 0,
  xpPercent = 0,
}) => {
  return (
    <GlassCard glowMint padding={16} radius={24} variant="hero">
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 10,
          top: 10,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={4} opacity={0.65} size={32} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          left: 8,
          bottom: 10,
          zIndex: 0,
        }}
      >
        <WaterBubble size={28} opacity={0.65} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 48,
          bottom: 8,
          zIndex: 0,
        }}
      >
        <LiquidGlassSphere color="pearl" size={14} intensity={0.52} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 2,
          marginBottom: 10,
        }}
      >
        <View style={{ gap: 3 }}>
          <Text
            style={{
              color: vexLightGlass.mint[500],
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 1.0,
              textTransform: 'uppercase',
            }}
          >
            Progression
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 26,
              fontWeight: '800',
              letterSpacing: -1.0,
              lineHeight: 32,
            }}
          >
            Lvl {level}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              fontWeight: '400',
            }}
          >
            {xp} / {nextLevelThreshold} XP
          </Text>
        </View>
        <GlassPill label="2.0x" size="sm" variant="mint" />
      </View>

      <View style={{ zIndex: 2, marginBottom: 12 }}>
        <LiquidProgressBar height={8} progress={xpPercent / 100} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          zIndex: 2,
        }}
      >
        <ProgressionStatCard label="Sessions" orb="mint" value="12" />
        <ProgressionStatCard label="Focus time" orb="cyan" value="4.2h" />
        <ProgressionStatCard label="Streak" orb="fire" value="3" />
      </View>
    </GlassCard>
  );
};

export default ProgressionDashboard;
