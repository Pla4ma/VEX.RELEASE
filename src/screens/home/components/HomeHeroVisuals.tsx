/**
 * Shared visual atoms for the home hero (goal ring + stat chips).
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

const RING_SIZE = 72;
const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function HomeGoalRing({ percent }: { percent: number }): React.ReactNode {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = (clamped / 100) * RING_CIRCUMFERENCE;
  return (
    <View
      accessibilityLabel={`Daily goal ${clamped} percent complete`}
      accessibilityRole="text"
      style={{
        alignItems: 'center',
        height: RING_SIZE,
        justifyContent: 'center',
        width: RING_SIZE,
      }}
    >
      <Svg height={RING_SIZE} width={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          fill="none"
          r={RING_RADIUS}
          stroke="rgba(12, 118, 95, 0.16)"
          strokeWidth={7}
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          fill="none"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          r={RING_RADIUS}
          rotation={-90}
          stroke={vexLightGlass.mint[600]}
          strokeDasharray={`${filled}, ${RING_CIRCUMFERENCE}`}
          strokeLinecap="round"
          strokeWidth={7}
        />
      </Svg>
      <View style={{ alignItems: 'center', position: 'absolute' }}>
        <Text
          style={{
            color: vexLightGlass.mint[800],
            fontSize: 16,
            fontWeight: '900',
          }}
        >
          {clamped}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.8,
          }}
        >
          Goal
        </Text>
      </View>
    </View>
  );
}

export function HomeStatChip({
  icon,
  value,
  label,
  tone,
}: {
  icon: 'flame' | 'target' | 'star';
  value: string;
  label: string;
  tone: 'fire' | 'mint' | 'amber';
}): React.ReactNode {
  const color =
    tone === 'fire'
      ? vexLightGlass.semantic.fireDeep
      : tone === 'amber'
        ? vexLightGlass.semantic.warning
        : vexLightGlass.mint[800];
  return (
    <GlassCard
      glowMint={tone === 'mint'}
      glowFire={tone === 'fire'}
      padding={8}
      radius={999}
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}
      variant="default"
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: tone === 'fire'
            ? 'rgba(255, 132, 39, 0.18)'
            : tone === 'amber'
              ? 'rgba(223, 164, 74, 0.16)'
              : 'rgba(66, 207, 174, 0.16)',
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 999,
          borderWidth: 1,
          height: 22,
          justifyContent: 'center',
          width: 22,
        }}
      >
        <Icon color={color} name={icon} size="xs" variant="solid" />
      </View>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 14,
          fontWeight: '900',
          letterSpacing: -0.2,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.tertiary,
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
    </GlassCard>
  );
}

export function homeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
