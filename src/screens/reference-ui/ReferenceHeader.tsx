import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../../icons/components/Icon';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';


interface ReferenceHeaderProps {
  eyebrow?: string;
  title: string;
  body?: string;
  mode?: string;
  onAction?: () => void;
}

          
export function ReferenceHeader({
  eyebrow,
  title,
  body,
  mode,
  onAction,
}: ReferenceHeaderProps): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing[4], paddingTop: theme.spacing[1] }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing[4],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
          <View
            style={{
              width: theme.spacing[2],
              height: theme.spacing[2],
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.primary[500],
            }}
          />
          <Text variant="h3">VEX</Text>
        </View>
        {mode ? (
          <Text variant="label" color="text.secondary">
            {mode}
          </Text>
        ) : null}
        {onAction ? (
          <Pressable
            accessibilityHint="Opens screen action"
            accessibilityLabel="Open action"
            accessibilityRole="button"
            onPress={onAction}
            style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon color={theme.colors.text.primary} name="notification" size="sm" />
          </Pressable>
        ) : null}
      </View>
      {eyebrow ? (
        <Text variant="label" color="primary.500" style={{ marginBottom: theme.spacing[2] }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="h1">{title}</Text>
      {body ? (
        <Text variant="body" color="text.secondary" style={{ marginTop: theme.spacing[2] }}>
          {body}
        </Text>
      ) : null}
    </View>
  );
}
