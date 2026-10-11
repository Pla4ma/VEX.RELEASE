import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import type { ProgressMetric } from './SessionProgressionCard.types';

export function isProgressMetric(
  metric: ProgressMetric | null,
): metric is ProgressMetric {
  return metric !== null;
}

export function MetricRow({
  metric,
  delay,
}: {
  metric: ProgressMetric;
  delay: number;
}) {
  const { theme: _theme } = useTheme();
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <Box
        p={18}
        style={{
          backgroundColor: vexFire.panel,
          borderWidth: 1,
          borderColor: vexFire.border,
          ...getPremiumCardStyle('medium'),
        }}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mb={10}
        >
          <Box flexDirection="row" alignItems="center" gap={10}>
            {metric.icon ? (
              <Icon name={metric.icon} size={18} color={metric.accent} />
            ) : null}
            <Text variant="label" color={vexFire.textSecondary}>
              {metric.label}
            </Text>
          </Box>
          <Text
            variant="body"
            color={vexFire.cream}
            fontWeight="700"
          >
            {metric.value}
          </Text>
        </Box>
        <Box
          height={10}
          borderRadius={999}
          overflow="hidden"
          style={{ backgroundColor: vexFire.background }}
        >
          <Box
            height="100%"
            width={`${Math.max(0, Math.min(1, metric.progress)) * 100}%`}
            borderRadius={999}
            style={{ backgroundColor: metric.accent }}
          />
        </Box>
        {metric.reward ? (
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            mt={10}
          >
            <Text variant="caption" color={vexFire.textSecondary}>
              {metric.reward}
            </Text>
            {metric.showPlusBadge ? (
              <Box
                px={10}
                py={4}
                borderRadius={999}
                style={{ backgroundColor: vexFire.ember }}
              >
                <Text variant="caption" color={vexFire.cream}>
                  +1
                </Text>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Animated.View>
  );
}
