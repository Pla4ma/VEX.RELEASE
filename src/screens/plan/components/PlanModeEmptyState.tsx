import React from 'react';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

interface PlanModeEmptyStateProps {
  asset: ImageSourcePropType;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

export function PlanModeEmptyState({
  asset,
  title,
  body,
  actionLabel,
  onAction,
}: PlanModeEmptyStateProps): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        gap: theme.spacing[2],
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[4],
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={`${title} illustration`}
        resizeMode="contain"
        source={asset}
        style={{ height: theme.spacing[20], width: theme.spacing[20] }}
      />
      <Text textAlign="center" variant="h3">
        {title}
      </Text>
      <Text color="text.secondary" textAlign="center" variant="bodyLarge">
        {body}
      </Text>
      <Pressable
        accessibilityHint={`Creates the first item for ${title.toLowerCase()}`}
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        onPress={onAction}
        style={({ pressed }) => ({
          alignItems: 'center',
          borderColor: theme.colors.primary[500],
          borderRadius: theme.borderRadius.full,
          borderWidth: 1,
          justifyContent: 'center',
          minHeight: theme.spacing[12],
          opacity: pressed ? theme.opacity[80] : theme.opacity[100],
          paddingHorizontal: theme.spacing[6],
        })}
      >
        <Text color={theme.colors.semantic.primary} variant="button">
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
