import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { GlassPill } from '../../../components/glass/GlassPill';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface StreakCardProps {
  currentStreak: number;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export function StreakCard({ currentStreak }: StreakCardProps): React.ReactNode {
  return (
    <GlassCard padding={16} radius={22} variant="default">
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
        <LiquidGlassSphere color="pearl" size={12} intensity={0.48} />
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <GlassPill
          label={`${currentStreak} Day Streak`}
          size="sm"
          variant="fire"
        />
        <GlassPill label="2.0x" size="sm" variant="mint" />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        {DAY_LABELS.map((day, index) => (
          <View
            key={`${day}-${index}`}
            style={{ alignItems: 'center', flex: 1, gap: 5 }}
          >
            <View
              style={{
                alignItems: 'center',
                backgroundColor:
                  index < Math.min(currentStreak, 7)
                    ? vexLightGlass.mint[600]
                    : 'rgba(16,35,31,0.10)',
                borderRadius: 999,
                height: 22,
                justifyContent: 'center',
                width: 22,
              }}
            >
              <Icon
                color={vexLightGlass.text.inverse}
                name="check"
                size="xs"
                variant="solid"
              />
            </View>
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
      <Text
        style={{
          color: vexLightGlass.text.tertiary,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        12h 40m until streak risk
      </Text>
    </GlassCard>
  );
}
