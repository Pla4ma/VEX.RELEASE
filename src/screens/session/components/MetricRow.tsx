import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box, Text } from '../../../components/primitives/Box';
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
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <Box
        p={18}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
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
            <Text variant="label" color={theme.colors.text.secondary}>
              {metric.label}
            </Text>
          </Box>
          <Text
            variant="body"
            color={theme.colors.text.primary}
            fontWeight="700"
          >
            {metric.value}
          </Text>
        </Box>
        <Box
          height={10}
          borderRadius={999}
          overflow="hidden"
          style={{ backgroundColor: theme.colors.background.primary }}
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
            <Text variant="caption" color={theme.colors.text.secondary}>
              {metric.reward}
            </Text>
            {metric.showPlusBadge ? (
              <Box
                px={10}
                py={4}
                borderRadius={999}
                style={{ backgroundColor: theme.colors.primary[500] }}
              >
                <Text variant="caption" color={theme.colors.text.inverse}>
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
