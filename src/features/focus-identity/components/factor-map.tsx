import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { GlassProgressBar } from '../../../components/glass/GlassProgressBar';
import { Icon } from '../../../icons';
import type { FocusScoreDashboardModel } from '../types';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

type LiquidSphereColor = 'mint' | 'cyan' | 'teal' | 'coral' | 'amber' | 'pearl';

function mapOrbToSphereColor(orb: string): LiquidSphereColor {
  if (orb === 'fire') return 'coral';
  if (orb === 'lavender') return 'pearl';
  if (orb === 'mint' || orb === 'cyan' || orb === 'teal' || orb === 'coral' || orb === 'amber' || orb === 'pearl') {
    return orb as LiquidSphereColor;
  }
  return 'mint';
}

export interface FactorMapProps {
  model: FocusScoreDashboardModel;
}

export const FactorMap: React.FC<FactorMapProps> = ({ model }) => {
  const factors = model.current?.factors;
  if (!factors) return null;

  const factorItems = [
    { icon: 'clock', label: 'Consistency', orb: 'mint' as const, score: factors.consistency.score },
    { icon: 'fire', label: 'Streak', orb: 'fire' as const, score: factors.streakStability.score },
    { icon: 'sparkles', label: 'Quality', orb: 'pearl' as const, score: factors.sessionQuality.score },
    { icon: 'bolt', label: 'Difficulty', orb: 'cyan' as const, score: factors.intentionalDifficulty.score },
    { icon: 'check', label: 'Contracts', orb: 'amber' as const, score: factors.contractCompletion.score },
    { icon: 'calendar', label: 'Recency', orb: 'lavender' as const, score: factors.recency.score },
  ];

  return (
    <GlassCard padding={18} radius={24} variant="default">
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <LiquidGlassSphere
            color="pearl"
            icon={
              <Icon color="#0C765F" name="chart" size="sm" variant="solid" />
            }
            intensity={0.88}
            size={40}
          />
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 16,
              fontWeight: '900',
              letterSpacing: -0.3,
            }}
          >
            Factors
          </Text>
        </View>
        <View style={{ gap: 10 }}>
          {factorItems.map((factor) => (
            <View
              key={factor.label}
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: 10,
              }}
            >
              <LiquidGlassSphere
                color={mapOrbToSphereColor(factor.orb)}
                icon={
                  <Icon
                    color="#0C765F"
                    name={factor.icon}
                    size="xs"
                    variant="solid"
                  />
                }
                intensity={0.82}
                size={34}
              />
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 13,
                  fontWeight: '600',
                  flex: 1,
                }}
              >
                {factor.label}
              </Text>
              <View style={{ width: 80 }}>
                <GlassProgressBar
                  height={8}
                  value={factor.score}
                  variant="mint"
                />
              </View>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 14,
                  fontWeight: '800',
                  width: 30,
                }}
              >
                {factor.score}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
};

export default FactorMap;
