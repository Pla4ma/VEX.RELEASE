import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { GlassPill } from '../../../components/glass/GlassPill';
import { Icon } from '../../../icons/components/Icon';
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

export interface ProfileStatItem {
  icon: string;
  iconOrb: 'mint' | 'cyan' | 'fire' | 'amber' | 'lavender' | 'pearl';
  label: string;
  value: string;
  change?: string;
}

export interface ProfileStatTileProps {
  item: ProfileStatItem;
  loading?: boolean;
}

export const ProfileStatTile: React.FC<ProfileStatTileProps> = ({
  item,
  loading,
}) => {
  if (loading) {
    return (
      <GlassCard
        padding={14}
        radius={22}
        style={{
          alignItems: 'center',
          gap: 8,
          justifyContent: 'center',
          minHeight: 100,
          minWidth: 100,
        }}
        variant="default"
      >
        <ActivityIndicator color={vexLightGlass.mint[500]} />
      </GlassCard>
    );
  }

  return (
    <GlassCard
      padding={14}
      radius={22}
      style={{
        alignItems: 'center',
        gap: 8,
        minWidth: 100,
      }}
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
        <FloatingDroplets count={2} opacity={0.65} size={22} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          left: 4,
          bottom: 4,
          zIndex: 0,
        }}
      >
        <WaterBubble size={16} opacity={0.65} />
      </View>
      <LiquidGlassSphere
        color={mapOrbToSphereColor(item.iconOrb)}
        icon={
          <Icon color={vexLightGlass.mint[700]} name={item.icon} size="sm" variant="solid" />
        }
        intensity={0.88}
        size={48}
      />
      <View style={{ alignItems: 'center', gap: 3 }}>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 18,
            fontWeight: '900',
            letterSpacing: -0.3,
          }}
        >
          {item.value}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 12,
            fontWeight: '500',
          }}
        >
          {item.label}
        </Text>
      </View>
      {item.change ? (
        <GlassPill
          label={item.change}
          size="sm"
          variant={item.change.startsWith('+') ? 'mint' : 'fire'}
        />
      ) : null}
    </GlassCard>
  );
};
