import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { VexCompanionAura } from '../../../features/companion/components/VexCompanionAura';
import { ELEMENT_THEMES } from '../../../features/companion/types';
import type { CompanionState } from '../../../features/companion/types';

export function CompanionCard({
  state,
  onPress,
}: {
  state: CompanionState;
  onPress?: () => void;
}): JSX.Element {
  const elementTheme = ELEMENT_THEMES[state.element];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel="Companion status"
      accessibilityRole="button"
      accessibilityHint="View companion details"
    >
      <Animated.View entering={FadeInUp.duration(300)}>
        <GlassCard variant="default" padding={16} radius={22}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <VexCompanionAura
              size={48}
              laneColor={elementTheme.primary}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 14,
                  fontWeight: '700',
                }}
              >
                Ready when you are
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 12,
                }}
              >
                {Math.floor(state.totalFocusMinutes)}m protected
              </Text>
            </View>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: vexLightGlass.mint[400],
              }}
            />
          </View>
        </GlassCard>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function SkeletonCard(): JSX.Element {
  return (
    <GlassCard variant="default" padding={16} radius={22}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(16, 35, 31, 0.06)',
          }}
        />
        <View style={{ flex: 1, gap: 8 }}>
          <View
            style={{
              height: 16,
              width: 120,
              borderRadius: 4,
              backgroundColor: 'rgba(16, 35, 31, 0.06)',
            }}
          />
          <View
            style={{
              height: 12,
              width: 180,
              borderRadius: 4,
              backgroundColor: 'rgba(16, 35, 31, 0.04)',
            }}
          />
        </View>
      </View>
    </GlassCard>
  );
}
