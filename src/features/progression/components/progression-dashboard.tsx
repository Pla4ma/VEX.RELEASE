import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassPill } from '../../../components/glass/GlassPill';
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
              color: '#0A9B8A',
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.0,
              textTransform: 'uppercase',
            }}
          >
            Progression
          </Text>
          <Text
            style={{
              color: '#0A1F1A',
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
              color: '#3D5A52',
              fontSize: 13,
              fontWeight: '400',
            }}
          >
            {xp} / {nextLevelThreshold} XP
          </Text>
        </View>
        <GlassPill label="2.0x" size="sm" variant="mint" />
      </View>

      <View
        style={{
          backgroundColor: 'rgba(10, 155, 138, 0.1)',
          borderRadius: 10,
          height: 8,
          overflow: 'hidden',
          zIndex: 2,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: '#0A9B8A',
            borderRadius: 10,
            height: 8,
            width: `${xpPercent}%`,
          }}
        />
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
