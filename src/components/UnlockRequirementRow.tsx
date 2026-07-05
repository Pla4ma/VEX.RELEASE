import React from 'react';
import { View } from 'react-native';

import { Text } from './primitives/Text';
import { useTheme } from '../theme/ThemeContext';

// Module-scope frozen constants for the statically-shaped layout values.
// Theme-driven values stay inline so dark-mode tokens override at render time.
const TEXT_STYLE = { flex: 1 } as const;
const ROW_STATIC_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
} as const;

interface UnlockRequirementRowProps {
  label: string;
  progressLabel?: string;
}

export function UnlockRequirementRow({
  label,
  progressLabel,
}: UnlockRequirementRowProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <View
      style={{
        ...ROW_STATIC_STYLE,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.xl,
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        gap: theme.spacing[3],
      }}
    >
      <Text
        variant="bodySmall"
        color={theme.colors.text.primary}
        style={TEXT_STYLE}
      >
        {label}
      </Text>
      {progressLabel ? (
        <Text variant="label" color={theme.colors.primary[500]}>
          {progressLabel}
        </Text>
      ) : null}
    </View>
  );
}
