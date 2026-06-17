import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface ProjectAtlasCardProps {
  title?: string;
  subtitle?: string;
}

export function ProjectAtlasCard({
  title = 'Project Atlas',
  subtitle = 'Continue where you left off.',
}: ProjectAtlasCardProps): React.ReactNode {
  return (
    <GlassCard padding={16} radius={22} variant="default">
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 12,
          top: 12,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={4} opacity={0.65} size={36} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          left: 8,
          bottom: 8,
          zIndex: 0,
        }}
      >
        <WaterBubble size={18} opacity={0.65} />
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <LiquidGlassSphere
          color="cyan"
          icon={
            <Icon color={vexLightGlass.semantic.info} name="book" size="sm" strokeWidth="thin" variant="outline" />
          }
          intensity={0.92}
          size={52}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 15,
              fontWeight: '800',
              letterSpacing: -0.2,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 12,
              fontWeight: '400',
            }}
          >
            {subtitle}
          </Text>
        </View>
        <Icon color={vexLightGlass.text.tertiary} name="chevronRight" size="sm" strokeWidth="thin" variant="outline" />
      </View>
    </GlassCard>
  );
}
