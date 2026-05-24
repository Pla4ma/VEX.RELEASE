import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';

const previewSteps = [
  { label: 'Start', value: '15m guided focus' },
  { label: 'Finish', value: 'Grade, XP, boss damage' },
  { label: 'Return', value: 'Tomorrow promise saved' },
] as const;

export function AuthValuePreview(): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      accessibilityLabel="VEX daily loop preview"
      accessibilityRole="text"
      style={{
        backgroundColor: theme.colors.background.elevated,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        gap: theme.spacing[3],
        padding: theme.spacing[4],
      }}
    >
      <Text color="primary.300" variant="label">
        Today inside VEX
      </Text>
      <Text color="text.primary" variant="h3">
        One protected block becomes progress you can trust.
      </Text>
      <Text color="text.secondary" variant="bodySmall">
        See the focus loop before signup: start small, finish clean, leave with
        a remembered promise for tomorrow.
      </Text>
      <View style={{ gap: theme.spacing[2] }}>
        {previewSteps.map((step) => (
          <View
            key={step.label}
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: theme.spacing[3],
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.semantic.primarySoft,
                borderRadius: theme.borderRadius.full,
                minHeight: theme.spacing[8],
                minWidth: theme.spacing[8],
              }}
            />
            <View style={{ flex: 1 }}>
              <Text color="text.primary" variant="label">
                {step.label}
              </Text>
              <Text color="text.secondary" variant="caption">
                {step.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
