import React from 'react';
import { View } from 'react-native';
import { Text } from '../primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';

export interface SupporterBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  style?: object;
  accessibilityLabel?: string;
}

const supporterSizeConfig = {
  sm: { badge: 18, font: 9, icon: 10 },
  md: { badge: 24, font: 11, icon: 14 },
  lg: { badge: 32, font: 14, icon: 18 },
};

const supporterStyles = createSheet({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: lightColors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: { fontWeight: '700' as const },
});

export function SupporterBadge({ size = 'md', style, accessibilityLabel }: SupporterBadgeProps) {
  const { theme } = useTheme();
  const config = supporterSizeConfig[size];

  return (
    <View
      style={[
        supporterStyles.badge,
        {
          width: config.badge,
          height: config.badge,
          borderRadius: config.badge / 2,
          backgroundColor: theme.colors.warning.DEFAULT,
          borderColor: theme.colors.warning.light,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel ?? "Supporter badge"}
      accessibilityRole="image"
    >
      <Text style={[supporterStyles.icon, { fontSize: config.icon }]}>⭐</Text>
    </View>
  );
}
