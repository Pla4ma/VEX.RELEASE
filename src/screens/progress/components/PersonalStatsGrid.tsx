import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface StatCard {
  label: string;
  value: string;
}

interface PersonalStatsGridProps {
  stats: StatCard[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function PersonalStatsGrid({
  stats,
  isLoading,
  onRefresh,
}: PersonalStatsGridProps): JSX.Element {
  return (
    <View style={{ gap: 12 }}>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 18,
          fontWeight: '800',
          letterSpacing: -0.3,
        }}
      >
        Personal Stats
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {stats.map((item) => (
          <GlassCard
            key={item.label}
            padding={14}
            radius={20}
            size="sm"
            style={{ flexGrow: 1, flexBasis: '30%', minWidth: '30%' }}
            variant="default"
          >
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </Text>
            {isLoading ? (
              <Skeleton borderRadius={10} height={28} width="70%" />
            ) : (
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                  marginTop: 4,
                }}
              >
                {item.value}
              </Text>
            )}
          </GlassCard>
        ))}
      </View>
      <LiquidButton
        accessibilityHint="Reloads your latest execution stats"
        accessibilityLabel="Refresh progress stats"
        fullWidth
        label="Refresh stats"
        onPress={onRefresh}
        variant="ghost"
      />
    </View>
  );
}

export default PersonalStatsGrid;
