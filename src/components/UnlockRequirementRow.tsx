import React from 'react';
import { View } from 'react-native';

import { Text } from './primitives/Text';
import { useTheme } from '../theme/ThemeContext';

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
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
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
        style={{ flex: 1 }}
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

export default UnlockRequirementRow;
