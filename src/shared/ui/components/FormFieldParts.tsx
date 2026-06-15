import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

export interface FormSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function FormSection({
  title,
  subtitle,
  children,
  style,
}: FormSectionProps): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View style={[{ marginBottom: theme.spacing[6] }, style]}>
      {title || subtitle ? (
        <View style={{ marginBottom: theme.spacing[4] }}>
          {title ? (
            <Text color="text.primary" mb="xs" variant="h4">
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text color="text.secondary" mb="md" variant="bodySmall">
              {subtitle}
            </Text>
          ) : null}
          <View
            style={{ backgroundColor: theme.colors.semantic.border, height: 1 }}
          />
        </View>
      ) : null}
      <View style={{ gap: theme.spacing[3] }}>{children}</View>
    </View>
  );
}

export function InputGroup({
  children,
  inline = false,
  gap = 16,
  style,
}: {
  children: React.ReactNode;
  inline?: boolean;
  gap?: number;
  style?: ViewStyle;
}): React.ReactNode {
  return (
    <View
      style={[
        {
          alignItems: inline ? 'flex-start' : undefined,
          flexDirection: inline ? 'row' : 'column',
          gap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
