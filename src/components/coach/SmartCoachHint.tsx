import React, { type ReactNode } from 'react';
import { View } from 'react-native';

import { Card, Button, Text } from '../primitives/Card';
import { useTheme } from '../../theme/ThemeContext';
import { AnimatedCoachAvatar } from './AnimatedCoachAvatar';

interface SmartCoachHintProps {
  eyebrow?: string;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  mood?: 'calm' | 'active' | 'celebrate';
  children?: ReactNode;
}

export function SmartCoachHint({
  eyebrow = 'VEX coach',
  title,
  body,
  actionLabel,
  onAction,
  mood = 'active',
  children,
}: SmartCoachHintProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <Card
      size="lg"
      variant="premium"
      style={{
        backgroundColor: theme.colors.semantic.surfaceElevated,
        borderColor: theme.colors.semantic.primary,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[4],
        }}
      >
        <AnimatedCoachAvatar mood={mood} size={88} />
        <View style={{ flex: 1, gap: theme.spacing[1] }}>
          <Text color="primary.300" variant="label">
            {eyebrow}
          </Text>
          <Text color="text.primary" variant="h3">
            {title}
          </Text>
          <Text color="text.secondary" variant="bodySmall">
            {body}
          </Text>
        </View>
      </View>
      {children ? (
        <View style={{ marginTop: theme.spacing[4] }}>{children}</View>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          accessibilityHint={`Activates ${actionLabel}`}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          fullWidth
          mt="lg"
          onPress={onAction}
          variant="secondary"
        >
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
