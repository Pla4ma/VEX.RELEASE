import React from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { GlassPill } from '../../../components/glass/GlassPill';
import { LiquidGlassObject } from '../../../components/glass/LiquidGlassObject';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface MasteryState {
  totalMasteryPoints: number;
  techniques: Record<string, number>;
}

interface TechniqueItem {
  key: string;
  label: string;
  color: string;
}

interface RankDisplay {
  icon: string;
  title: string;
}

export interface MasteryCardProps {
  mastery: MasteryState;
  masteryLoading: boolean;
  onPress: () => void;
  rankDisplay: RankDisplay;
  techniques: TechniqueItem[];
}

export const MasteryCard: React.FC<MasteryCardProps> = ({
  mastery,
  masteryLoading,
  onPress,
  rankDisplay,
  techniques,
}) => {
  if (masteryLoading) {
    return (
      <GlassCard padding={18} radius={24} variant="default">
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
          <ActivityIndicator color={vexLightGlass.mint[500]} />
        </View>
      </GlassCard>
    );
  }

  return (
    <Pressable onPress={onPress}>
      <GlassCard padding={18} radius={24} variant="default">
        <View
          pointerEvents="none"
          style={{
            bottom: -10,
            position: 'absolute',
            right: -10,
          }}
        >
          <LiquidGlassObject size={80} variant="orb" />
        </View>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 14,
            marginBottom: 12,
            zIndex: 2,
          }}
        >
          <GlassIconOrb size={44} variant="pearl">
            <Icon color="#0C765F" name={rankDisplay.icon} size="sm" variant="solid" />
          </GlassIconOrb>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 15,
                fontWeight: '900',
                letterSpacing: -0.2,
              }}
            >
              {rankDisplay.title}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                fontWeight: '500',
              }}
            >
              {mastery.totalMasteryPoints} mastery points
            </Text>
          </View>
          <GlassPill
            label="View"
            size="sm"
            variant="mint"
          />
        </View>
        <View style={{ gap: 10, zIndex: 2 }}>
          {techniques.map((technique) => {
            const progress = mastery.techniques[technique.key] ?? 0;
            return (
              <View key={technique.key} style={{ gap: 6 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      color: vexLightGlass.text.secondary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {technique.label}
                  </Text>
                  <Text
                    style={{
                      color: vexLightGlass.text.primary,
                      fontSize: 12,
                      fontWeight: '800',
                    }}
                  >
                    {progress}%
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: vexLightGlass.mint[100],
                    borderRadius: 8,
                    height: 8,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: technique.color,
                      borderRadius: 8,
                      height: 8,
                      width: `${progress}%`,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </GlassCard>
    </Pressable>
  );
};

export default MasteryCard;
