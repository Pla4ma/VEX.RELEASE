import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '@/theme/ThemeContext';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

interface BannerStatsProps {
  sessionsAnalyzed: number;
  averageGrade: number;
  averagePurity: number;
}

export function BannerStats({
  sessionsAnalyzed,
  averageGrade,
  averagePurity,
}: BannerStatsProps): React.ReactElement {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: theme.spacing[4],
        marginBottom: theme.spacing[3],
        padding: theme.spacing[3],
        backgroundColor: rgbaColors.rgb_255_255_255_0_1,
        borderRadius: theme.borderRadius.md,
      }}
    >
      <View>
        <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
          Sessions Analyzed
        </Text>
        <Text variant="body" style={{ fontWeight: '600' }}>
          {sessionsAnalyzed}
        </Text>
      </View>
      <View>
        <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
          Average Grade
        </Text>
        <Text variant="body" style={{ fontWeight: '600' }}>
          {averageGrade.toFixed(1)}
        </Text>
      </View>
      <View>
        <Text variant="caption" style={{ color: theme.colors.text.secondary }}>
          Purity Score
        </Text>
        <Text variant="body" style={{ fontWeight: '600' }}>
          {Math.round(averagePurity)}%
        </Text>
      </View>
    </View>
  );
}