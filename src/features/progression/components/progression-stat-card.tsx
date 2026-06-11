import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

type LiquidSphereColor = 'mint' | 'cyan' | 'teal' | 'coral' | 'amber' | 'pearl';

function mapOrbToSphereColor(orb: string): LiquidSphereColor {
  if (orb === 'fire') {return 'coral';}
  if (orb === 'lavender') {return 'pearl';}
  if (orb === 'mint' || orb === 'cyan' || orb === 'teal' || orb === 'coral' || orb === 'amber' || orb === 'pearl') {
    return orb as LiquidSphereColor;
  }
  return 'mint';
}

interface ProgressionStatCardProps {
  label: string;
  orb: 'mint' | 'cyan' | 'fire' | 'amber' | 'lavender' | 'pearl';
  value: string;
  progress?: number;
}

export const ProgressionStatCard: React.FC<ProgressionStatCardProps> = ({
  label,
  orb,
  value,
  progress = 0.65,
}) => {
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <GlassCard
      padding={12}
      radius={20}
      style={{ flex: 1 }}
      variant="default"
    >
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 6,
          top: 6,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={3} opacity={0.65} size={28} />
      </View>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <LiquidGlassSphere
          color={mapOrbToSphereColor(orb)}
          icon={
            <Icon color={vexLightGlass.mint[700]} name="sparkles" size="sm" strokeWidth="thin" variant="outline" />
          }
          intensity={0.88}
          size={52}
        />
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 16,
            fontWeight: '900',
            letterSpacing: -0.3,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 11,
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
      </View>
    </GlassCard>
  );
};

export default ProgressionStatCard;
