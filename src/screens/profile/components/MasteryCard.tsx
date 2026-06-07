import React from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native';
import { Box, Text } from '../../../components/primitives';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { GlassPill } from '../../../components/glass/GlassPill';
import { GlassProgressBar } from '../../../components/glass/GlassProgressBar';
import { Icon } from '../../../icons';
import { Skeleton } from '../../../components/ui/Skeleton';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface TechniqueItem {
  key: string;
  label: string;
  color: string;
}

interface MasteryState {
  totalMasteryPoints: number;
  techniques: Record<string, number>;
}

interface MasteryCardProps {
  mastery: MasteryState;
  masteryLoading: boolean;
  rankDisplay: { icon: string; title: string };
  techniques: TechniqueItem[];
  onPress: () => void;
}

export function MasteryCard({
  mastery,
  masteryLoading,
  rankDisplay,
  techniques,
  onPress,
}: MasteryCardProps): JSX.Element {
  return (
    <Pressable
      accessibilityHint="Opens the full mastery progression screen"
      accessibilityLabel="View Mastery details"
      accessibilityRole="button"
      onPress={onPress}
    >
      <GlassCard padding={14} radius={18} size="lg" variant="premium">
        <Box
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          mb={12}
        >
          <Box alignItems="center" flexDirection="row" gap={12}>
            <GlassIconOrb size={40} variant="lavender">
              <Icon color="#6D3BFF" name="diamond" size="md" variant="solid" />
            </GlassIconOrb>
            <Box>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 15,
                  fontWeight: '800',
                  letterSpacing: -0.2,
                }}
              >
                Mastery
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.tertiary,
                  fontSize: 11,
                  fontWeight: '600',
                }}
              >
                {`${rankDisplay.icon} ${rankDisplay.title.toUpperCase()}`}
              </Text>
            </Box>
          </Box>
          {masteryLoading ? (
            <Skeleton borderRadius={12} height={24} width={72} />
          ) : (
            <GlassPill
              label={`${mastery.totalMasteryPoints} pts`}
              size="sm"
              variant="premium"
            />
          )}
        </Box>
        {masteryLoading ? (
          <Skeleton borderRadius={999} height={10} lines={5} spacing={10} />
        ) : (
          techniques.map((tech) => (
            <View key={tech.key} style={{ marginBottom: 8 }}>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                style={{ marginBottom: 6 }}
              >
                <Text
                  style={{
                    color: vexLightGlass.text.secondary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {tech.label}
                </Text>
                <Text
                  style={{
                    color: vexLightGlass.text.tertiary,
                    fontSize: 11,
                    fontWeight: '600',
                  }}
                >
                  {`${mastery.techniques[tech.key]}/25`}
                </Text>
              </Box>
              <GlassProgressBar
                height={5}
                value={((mastery.techniques[tech.key] ?? 0) / 25) * 100}
                variant="mint"
              />
            </View>
          ))
        )}
      </GlassCard>
    </Pressable>
  );
}

export default MasteryCard;
