import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { SessionStake } from './SessionStakesBriefing.types';
import {
  SessionGlyph,
  type SessionGlyphName,
} from '../../../shared/ui/liquid-glass';

interface StakeCardProps {
  icon: SessionGlyphName;
  title: string;
  subtitle: string;
  urgency: SessionStake['urgency'];
  accentColor?: string;
  onPress?: () => void;
}

export function StakeCard({
  icon,
  title,
  subtitle,
  urgency,
  accentColor,
  onPress,
}: StakeCardProps): JSX.Element {
  const { theme } = useTheme();
  const getUrgencyStyles = () => {
    switch (urgency) {
      case 'critical':
        return {
          borderColor: theme.colors.error[500],
          bgColor: `${theme.colors.error[500]}15`,
          iconBg: theme.colors.error[500],
        };
      case 'high':
        return {
          borderColor: theme.colors.warning[500],
          bgColor: `${theme.colors.warning[500]}10`,
          iconBg: theme.colors.warning[500],
        };
      case 'medium':
        return {
          borderColor: accentColor || theme.colors.primary[500],
          bgColor: `${accentColor || theme.colors.primary[500]}10`,
          iconBg: accentColor || theme.colors.primary[500],
        };
      default:
        return {
          borderColor: theme.colors.border.DEFAULT,
          bgColor: theme.colors.background.primary,
          iconBg: theme.colors.text.tertiary,
        };
    }
  };
  const styles = getUrgencyStyles();
  const CardWrapper = onPress ? Pressable : View;
  return (
    <CardWrapper onPress={onPress} accessibilityLabel={title}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[3],
          padding: theme.spacing[3],
          backgroundColor: styles.bgColor,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: styles.borderColor,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: theme.borderRadius['2xl'],
            backgroundColor: theme.colors.semantic.surfaceElevated,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SessionGlyph name={icon} size={36} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="body" fontWeight="600" color="text.primary">
            {title}
          </Text>
          <Text variant="caption" color="text.secondary">
            {subtitle}
          </Text>
        </View>
      </View>
    </CardWrapper>
  );
}
