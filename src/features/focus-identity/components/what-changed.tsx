import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { Icon } from '../../../icons';
import type { FocusScoreDashboardModel } from '../types';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export interface WhatChangedProps {
  model: FocusScoreDashboardModel;
  onOpenMonthlyReport: () => void;
}

export const WhatChanged: React.FC<WhatChangedProps> = ({ model }) => {
  const current = model.current;
  if (!current) {return null;}

  const changes = [
    { icon: 'arrowUp', label: 'Consistency', orb: 'mint' as const, value: `+${current.factors.consistency.delta}` },
    { icon: 'arrowDown', label: 'Streak', orb: 'fire' as const, value: `${current.factors.streakStability.delta}` },
    { icon: 'arrowUp', label: 'Quality', orb: 'pearl' as const, value: `+${current.factors.sessionQuality.delta}` },
  ];

  return (
    <GlassCard padding={18} radius={24} variant="default">
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <GlassIconOrb size={36} variant="pearl">
            <Icon
              color="#0C765F"
              name="activity"
              size="sm"
              variant="solid"
            />
          </GlassIconOrb>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 16,
              fontWeight: '900',
              letterSpacing: -0.3,
            }}
          >
            What changed
          </Text>
        </View>
        <View style={{ gap: 10 }}>
          {changes.map((change) => (
            <View
              key={change.label}
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: 10,
              }}
            >
              <GlassIconOrb size={32} variant={change.orb}>
                <Icon
                  color="#0C765F"
                  name={change.icon}
                  size="xs"
                  variant="solid"
                />
              </GlassIconOrb>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 14,
                  fontWeight: '800',
                  flex: 1,
                }}
              >
                {change.label}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.mint[700],
                  fontSize: 14,
                  fontWeight: '800',
                }}
              >
                {change.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
};

export default WhatChanged;
